'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
    role: 'ai' | 'user';
    content: string;
}

interface ConvoEntry {
    question: string;
    answer: string;
}

interface InterviewChatProps {
    resumeText: string;
    role: string;
    interviewId: string;
}

const TOTAL_QUESTIONS = 8;

// Minimal markdown bold renderer: **text** → <strong>text</strong>
function renderBold(text: string) {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );
}

export default function InterviewChat({ resumeText, role, interviewId }: InterviewChatProps) {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [questionNumber, setQuestionNumber] = useState(1);
    const [conversationHistory, setConversationHistory] = useState<ConvoEntry[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<string>('');
    const [finished, setFinished] = useState(false);
    const [errorState, setErrorState] = useState<{ savedAnswer: string; savedHistory: ConvoEntry[]; savedQNum: number } | null>(null);

    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        startInterview();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const startInterview = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeText, role, conversationHistory: [], questionNumber: 1 }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            const q = data.question || 'Tell me about yourself.';
            setCurrentQuestion(q);
            setMessages([{ role: 'ai', content: q }]);
        } catch {
            // Graceful fallback — still playable
            const fallback = 'Tell me about yourself and your experience relevant to this role.';
            setCurrentQuestion(fallback);
            setMessages([{ role: 'ai', content: fallback }]);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Core function: sends the answer + current history to the API, handles
     * question or evaluation response. Extracted so both the normal submit
     * path and the retry path share the same implementation.
     */
    const submitAnswer = useCallback(async (
        answer: string,
        historySnapshot: ConvoEntry[],
        nextQNum: number,
        prevMessages: Message[]
    ) => {
        setLoading(true);
        setErrorState(null);

        try {
            const res = await fetch('/api/interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeText,
                    role,
                    conversationHistory: historySnapshot,
                    questionNumber: nextQNum,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            if (data.type === 'evaluation') {
                const evaluation = data.evaluation;
                setFinished(true);

                // Fire-and-forget — don't block UI on DB save
                fetch('/api/save-result', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        interviewId,
                        questions: historySnapshot.map((h) => h.question),
                        answers: historySnapshot.map((h) => h.answer),
                        score: evaluation.score,
                        feedback: evaluation,
                    }),
                }).catch(() => { /* non-fatal */ });

                sessionStorage.setItem(
                    'interviewResults',
                    JSON.stringify({
                        role,
                        score: evaluation.score,
                        strengths: evaluation.strengths ?? [],
                        weaknesses: evaluation.weaknesses ?? [],
                        improvements: evaluation.improvements ?? [],
                        recommended_topics: evaluation.recommended_topics ?? [],
                        questions: historySnapshot.map((h) => h.question),
                        answers: historySnapshot.map((h) => h.answer),
                    })
                );

                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'ai',
                        content: `✅ Interview complete! You scored **${evaluation.score}/100**. Generating your full report...`,
                    },
                ]);

                setTimeout(() => router.push('/results'), 2500);
            } else {
                const nextQ = data.question ?? 'Please continue.';
                setCurrentQuestion(nextQ);
                setQuestionNumber(nextQNum);
                setMessages((prev) => [...prev, { role: 'ai', content: nextQ }]);
            }
        } catch {
            // Roll back the optimistic user bubble, then add a single error message
            setMessages([
                ...prevMessages,
                {
                    role: 'ai',
                    content: '⚠️ The AI model is taking too long to respond (it may still be loading). Please wait a moment and click **Retry**.',
                },
            ]);
            // Save state so the retry handler can re-submit without retyping
            setErrorState({
                savedAnswer: answer,
                savedHistory: historySnapshot,
                savedQNum: nextQNum,
            });
        } finally {
            setLoading(false);
            textareaRef.current?.focus();
        }
    }, [resumeText, role, interviewId, router]);

    const handleSubmitAnswer = async () => {
        if (!userInput.trim() || loading || finished) return;

        const answer = userInput.trim();
        setUserInput('');

        const newMessages: Message[] = [...messages, { role: 'user', content: answer }];
        setMessages(newMessages);

        const newHistory: ConvoEntry[] = [...conversationHistory, { question: currentQuestion, answer }];
        setConversationHistory(newHistory);

        const nextQuestionNumber = questionNumber + 1;

        await submitAnswer(answer, newHistory, nextQuestionNumber, messages);
    };

    const handleRetry = async () => {
        if (!errorState || loading) return;
        const { savedAnswer, savedHistory, savedQNum } = errorState;

        // Re-add the user bubble (we rolled it back on the previous failure)
        const baseMessages: Message[] = [...messages, { role: 'user', content: savedAnswer }];
        setMessages(baseMessages);

        await submitAnswer(savedAnswer, savedHistory, savedQNum, messages);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmitAnswer();
        }
    };

    const progress = Math.min(((questionNumber - 1) / TOTAL_QUESTIONS) * 100, 100);

    return (
        <div className="flex flex-col h-full">
            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                    <span>Question {Math.min(questionNumber, TOTAL_QUESTIONS)} of {TOTAL_QUESTIONS}</span>
                    <span className={`font-medium ${questionNumber <= 5 ? 'text-violet-400' : 'text-yellow-400'}`}>
                        {questionNumber <= 5 ? '⚙️ Technical' : '🤝 HR Round'}
                    </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 custom-scrollbar">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fadeIn`}
                    >
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
              ${msg.role === 'ai'
                                ? 'bg-gradient-to-br from-violet-500 to-indigo-600'
                                : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                            }`}
                        >
                            {msg.role === 'ai' ? '🤖' : '👤'}
                        </div>

                        {/* Bubble */}
                        <div
                            className={`max-w-[80%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'ai'
                                    ? 'bg-white/10 border border-white/10 text-white rounded-tl-none'
                                    : 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-tr-none'
                                }`}
                        >
                            {renderBold(msg.content)}
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                    <div className="flex gap-3 animate-fadeIn">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm">
                            🤖
                        </div>
                        <div className="bg-white/10 border border-white/10 px-5 py-4 rounded-2xl rounded-tl-none flex items-center gap-1">
                            <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Retry banner */}
            {errorState && !loading && (
                <div className="mb-3 flex items-center gap-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                    <span className="text-amber-400 text-sm flex-1">
                        Your answer was saved. Click <strong>Retry</strong> once the model warms up (20–30 s).
                    </span>
                    <button
                        onClick={handleRetry}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold
                            transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
                    >
                        🔄 Retry
                    </button>
                </div>
            )}

            {/* Input Area — hidden while in error-retry state */}
            {!finished && !errorState && (
                <div className="relative">
                    <textarea
                        ref={textareaRef}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        placeholder="Type your answer… (Enter to submit, Shift+Enter for new line)"
                        rows={3}
                        className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 pr-16 text-white
              placeholder-slate-500 resize-none outline-none focus:border-violet-500 focus:ring-1
              focus:ring-violet-500/50 transition-all text-sm disabled:opacity-50"
                    />
                    <button
                        onClick={handleSubmitAnswer}
                        disabled={!userInput.trim() || loading}
                        className="absolute bottom-4 right-4 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600
              flex items-center justify-center disabled:opacity-40 hover:from-violet-500 hover:to-indigo-500
              transition-all duration-200 hover:scale-110 active:scale-95"
                    >
                        <svg className="w-5 h-5 text-white rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}
