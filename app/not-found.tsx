import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-6">
            <div className="bg-blob" />
            <div className="relative z-10">
                <div className="text-8xl font-black gradient-text mb-4">404</div>
                <h1 className="text-2xl font-bold text-white mb-3">Page Not Found</h1>
                <p className="text-slate-400 mb-8">
                    Looks like this page went for a walk. Let&apos;s get you back to practising.
                </p>
                <Link
                    href="/"
                    className="px-8 py-3.5 rounded-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600
            hover:from-violet-500 hover:to-indigo-500 text-white transition-all duration-300
            hover:scale-105 shadow-lg shadow-violet-500/25"
                >
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
}
