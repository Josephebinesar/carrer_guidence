'use client';

import { useRouter } from 'next/navigation';

interface FeedbackData {
    role: string;
    score: number;
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    recommended_topics: string[];
    questions: string[];
    answers: string[];
}

interface FeedbackReportProps {
    data: FeedbackData;
}

const scoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
};

const scoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Average';
    return 'Needs Work';
};

const scoreLabelEmoji = (score: number) => {
    if (score >= 85) return 'Excellent 🎉';
    if (score >= 70) return 'Good 👍';
    if (score >= 55) return 'Average 📈';
    return 'Needs Work 💪';
};

export default function FeedbackReport({ data }: FeedbackReportProps) {
    const router = useRouter();

    const handleDownloadPDF = async () => {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF({ unit: 'mm', format: 'a4' });

        const pageW = doc.internal.pageSize.getWidth();
        const margin = 18;
        let y = 20;

        const addPage = () => {
            doc.addPage();
            y = 20;
        };

        const checkY = (needed = 15) => {
            if (y + needed > 280) addPage();
        };

        // Header
        doc.setFillColor(109, 40, 217);
        doc.rect(0, 0, pageW, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('PlacementPrep AI – Interview Report', pageW / 2, 17, { align: 'center' });
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Role: ${data.role}  |  Date: ${new Date().toLocaleDateString()}`, pageW / 2, 30, { align: 'center' });

        y = 52;

        // Score Box
        doc.setFillColor(245, 243, 255);
        doc.roundedRect(margin, y, pageW - margin * 2, 22, 4, 4, 'F');
        doc.setTextColor(109, 40, 217);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Overall Score: ${data.score}/100  –  ${scoreLabel(data.score)}`, pageW / 2, y + 14, { align: 'center' });
        y += 32;

        const addSection = (title: string, items: string[], bgColor: [number, number, number]) => {
            checkY(20);
            doc.setFillColor(...bgColor);
            doc.roundedRect(margin, y, pageW - margin * 2, 9, 2, 2, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(title, margin + 4, y + 6.5);
            y += 13;

            doc.setTextColor(40, 40, 40);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);

            items.forEach((item) => {
                checkY(10);
                const lines = doc.splitTextToSize(`• ${item}`, pageW - margin * 2 - 8);
                doc.text(lines, margin + 4, y);
                y += lines.length * 6 + 2;
            });
            y += 6;
        };

        addSection('Strengths', data.strengths ?? [], [16, 185, 129]);
        addSection('Weaknesses', data.weaknesses ?? [], [239, 68, 68]);
        addSection('Areas for Improvement', data.improvements ?? [], [245, 158, 11]);
        addSection('Recommended Topics', data.recommended_topics ?? [], [99, 102, 241]);

        // Q&A
        checkY(20);
        doc.setFillColor(80, 80, 80);
        doc.roundedRect(margin, y, pageW - margin * 2, 9, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Interview Q&A', margin + 4, y + 6.5);
        y += 13;

        data.questions.forEach((q, i) => {
            checkY(25);
            doc.setTextColor(80, 80, 200);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            const qLines = doc.splitTextToSize(`Q${i + 1}: ${q}`, pageW - margin * 2 - 4);
            doc.text(qLines, margin + 2, y);
            y += qLines.length * 6 + 2;

            doc.setTextColor(50, 50, 50);
            doc.setFont('helvetica', 'normal');
            const aLines = doc.splitTextToSize(`A: ${data.answers[i] ?? 'No answer provided'}`, pageW - margin * 2 - 8);
            doc.text(aLines, margin + 6, y);
            y += aLines.length * 6 + 6;
        });

        // Footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setTextColor(150, 150, 150);
            doc.setFontSize(8);
            doc.text(`PlacementPrep AI · Page ${i} of ${pageCount}`, pageW / 2, 292, { align: 'center' });
        }

        doc.save('Interview_Report.pdf');
    };

    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (data.score / 100) * circumference;

    return (
        <div className="space-y-8">
            {/* Score Ring */}
            <div className="flex flex-col items-center gap-2">
                <div className="relative w-36 h-36">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="none" />
                        <circle
                            cx="60" cy="60" r="54"
                            stroke={data.score >= 80 ? '#34d399' : data.score >= 60 ? '#fbbf24' : '#f87171'}
                            strokeWidth="10" fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-black ${scoreColor(data.score)}`}>{data.score}</span>
                        <span className="text-xs text-slate-400">out of 100</span>
                    </div>
                </div>
                <p className={`text-xl font-bold ${scoreColor(data.score)}`}>{scoreLabelEmoji(data.score)}</p>
                <p className="text-slate-400 text-sm">Role: <span className="text-white font-medium">{data.role}</span></p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FeedbackCard
                    title="Strengths"
                    icon="✅"
                    items={data.strengths}
                    color="emerald"
                />
                <FeedbackCard
                    title="Weaknesses"
                    icon="⚠️"
                    items={data.weaknesses}
                    color="red"
                />
                <FeedbackCard
                    title="Areas for Improvement"
                    icon="📈"
                    items={data.improvements}
                    color="yellow"
                />
                <FeedbackCard
                    title="Recommended Topics"
                    icon="📚"
                    items={data.recommended_topics}
                    color="indigo"
                />
            </div>

            {/* Q&A Summary */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    💬 Interview Transcript
                </h3>
                <div className="space-y-4">
                    {data.questions.map((q, i) => (
                        <div key={i} className="border-l-2 border-violet-500/40 pl-4">
                            <p className="text-violet-300 text-sm font-semibold mb-1">Q{i + 1}: {q}</p>
                            <p className="text-slate-300 text-sm">{data.answers[i] ?? <span className="italic text-slate-500">No answer</span>}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={handleDownloadPDF}
                    className="flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2
            bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500
            text-white transition-all duration-300 shadow-lg shadow-emerald-500/20
            hover:scale-[1.02] active:scale-[0.98]"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF Report
                </button>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2
            bg-white/10 border border-white/20 hover:bg-white/20
            text-white transition-all duration-300
            hover:scale-[1.02] active:scale-[0.98]"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Start New Interview
                </button>
            </div>
        </div>
    );
}

interface FeedbackCardProps {
    title: string;
    icon: string;
    items: string[];
    color: 'emerald' | 'red' | 'yellow' | 'indigo';
}

const colorMap = {
    emerald: 'border-emerald-500/30 bg-emerald-500/10',
    red: 'border-red-500/30 bg-red-500/10',
    yellow: 'border-yellow-500/30 bg-yellow-500/10',
    indigo: 'border-indigo-500/30 bg-indigo-500/10',
};
const dotMap = {
    emerald: 'bg-emerald-400',
    red: 'bg-red-400',
    yellow: 'bg-yellow-400',
    indigo: 'bg-indigo-400',
};

function FeedbackCard({ title, icon, items, color }: FeedbackCardProps) {
    return (
        <div className={`border rounded-2xl p-5 ${colorMap[color]}`}>
            <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <span>{icon}</span> {title}
            </h4>
            <ul className="space-y-2">
                {items.length > 0 ? items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotMap[color]}`} />
                        {item}
                    </li>
                )) : (
                    <li className="text-slate-500 text-sm italic">None provided</li>
                )}
            </ul>
        </div>
    );
}
