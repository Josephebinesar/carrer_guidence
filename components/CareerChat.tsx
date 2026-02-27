'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatMessage { role: 'user' | 'assistant'; content: string; }
interface CareerChatProps { context?: { resumeSkills?: string[]; targetCareer?: string; }; }

const QUICK_PROMPTS = [
    'What career suits me best?',
    'How do I improve my resume?',
    'Give me a 3-month learning plan',
    'What skills are in demand for AI?',
];

function renderMarkdown(text: string) {
    return text.split('\n').map((line, i) => {
        if (line.startsWith('- ') || line.startsWith('• ')) {
            const content = line.replace(/^[-•]\s/, '');
            return (
                <li key={i} className="chat-bubble-li">
                    <span className="li-dot" />
                    <span>{renderInline(content)}</span>
                </li>
            );
        }
        if (!line.trim()) return <br key={i} />;
        return <p key={i} style={{ marginBottom: '0.2rem' }}>{renderInline(line)}</p>;
    });
}

function renderInline(text: string) {
    return text.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
        return part;
    });
}

export default function CareerChat({ context }: CareerChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'assistant', content: "👋 Hi! I'm **CareerGuide AI**.\n\nI can help you with:\n- Career path recommendations\n- Skill gap analysis\n- Resume tips\n- Learning roadmaps\n\nWhat would you like to explore today?" },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const sendMessage = async (content: string) => {
        if (!content.trim() || loading) return;

        const userMsg: ChatMessage = { role: 'user', content: content.trim() };
        const updated = [...messages, userMsg];
        setMessages(updated);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: content.trim(),
                    history: updated.slice(-6).map(({ role, content }) => ({ role, content })),
                    context,
                }),
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, could not generate a response.' }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Connection issue. Please try again.' }]);
        } finally {
            setLoading(false);
            textareaRef.current?.focus();
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Messages */}
            <div className="chat-messages custom-scrollbar">
                {messages.map((msg, i) => (
                    <div key={i} className={`chat-msg ${msg.role} animate-fadeIn`}>
                        <div className={`chat-avatar ${msg.role}`}>
                            {msg.role === 'assistant' ? '🎓' : '👤'}
                        </div>
                        <div className={`chat-bubble ${msg.role}`}>
                            {msg.role === 'assistant'
                                ? <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>{renderMarkdown(msg.content)}</ul>
                                : msg.content}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="chat-typing">
                        <div className="chat-avatar ai">🎓</div>
                        <div className="typing-indicator">
                            <span className="typing-dot animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="typing-dot animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="typing-dot animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            {messages.length === 1 && (
                <div className="chat-quick-prompts">
                    {QUICK_PROMPTS.map(p => (
                        <button key={p} onClick={() => sendMessage(p)} className="quick-prompt">{p}</button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="chat-input-row">
                <textarea
                    ref={textareaRef}
                    className="chat-textarea"
                    value={input}
                    rows={2}
                    disabled={loading}
                    placeholder="Ask about careers, skills, roadmaps…"
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                />
                <button
                    className="chat-send-btn"
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading}
                >
                    <svg style={{ width: '1.1rem', height: '1.1rem', transform: 'rotate(90deg)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
