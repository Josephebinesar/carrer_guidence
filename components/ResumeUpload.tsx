'use client';

import { useRef, useState, DragEvent } from 'react';

interface ResumeUploadProps {
    onUploadComplete: (interviewId: string, resumeText: string) => void;
    role: string;
}

export default function ResumeUpload({ onUploadComplete, role }: ResumeUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (selected: File) => {
        if (selected.type !== 'application/pdf') {
            setError('Only PDF files are accepted.');
            return;
        }
        if (selected.size > 5 * 1024 * 1024) {
            setError('File size must be under 5 MB.');
            return;
        }
        setError(null);
        setFile(selected);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) handleFile(dropped);
    };

    const handleUpload = async () => {
        if (!file) return;
        if (!role) {
            setError('Please select a role before uploading.');
            return;
        }

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('role', role);

        try {
            const res = await fetch('/api/upload-resume', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Upload failed');
            onUploadComplete(data.interviewId, data.resumeText);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300
          ${dragging
                        ? 'border-violet-400 bg-violet-500/10 scale-[1.01]'
                        : file
                            ? 'border-emerald-400 bg-emerald-500/10'
                            : 'border-white/20 bg-white/5 hover:border-violet-400 hover:bg-violet-500/5'
                    }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />

                <div className="flex flex-col items-center gap-3">
                    {file ? (
                        <>
                            <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-emerald-400 font-semibold">{file.name}</p>
                            <p className="text-sm text-slate-400">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                        </>
                    ) : (
                        <>
                            <div className="w-14 h-14 rounded-full bg-violet-500/20 flex items-center justify-center">
                                <svg className="w-7 h-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <p className="text-white font-semibold text-lg">Drop your resume here</p>
                            <p className="text-slate-400 text-sm">or click to browse · PDF only · Max 5 MB</p>
                        </>
                    )}
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={!file || uploading || !role}
                className="w-full py-4 rounded-2xl font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed
          bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500
          transition-all duration-300 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40
          hover:scale-[1.01] active:scale-[0.99]"
            >
                {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Analysing Resume…
                    </span>
                ) : (
                    'Upload & Start Interview'
                )}
            </button>
        </div>
    );
}
