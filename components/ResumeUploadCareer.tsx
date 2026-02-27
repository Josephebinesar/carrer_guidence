'use client';

import { useState, useRef } from 'react';

interface ResumeAnalysis {
    skills: string[];
    experience: string[];
    education: string[];
    strengths: string[];
    weaknesses: string[];
    atsScore: number;
    improvementSuggestions: string[];
}

interface ResumeUploadCareerProps {
    onAnalysisComplete: (resumeText: string, analysis: ResumeAnalysis) => void;
}

export default function ResumeUploadCareer({ onAnalysisComplete }: ResumeUploadCareerProps) {
    const [file, setFile] = useState<File | null>(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (selected: File) => {
        const ext = selected.name.split('.').pop()?.toLowerCase() ?? '';
        if (!['pdf', 'docx'].includes(ext)) {
            setError('Only PDF and DOCX files are accepted.');
            return;
        }
        if (selected.size > 10 * 1024 * 1024) {
            setError('File size must be under 10 MB.');
            return;
        }
        setError(null);
        setFile(selected);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setError(null);
        setProgress(20);

        const formData = new FormData();
        formData.append('resume', file);

        try {
            setProgress(45);
            const res = await fetch('/api/resume', { method: 'POST', body: formData });
            setProgress(85);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Analysis failed');
            setProgress(100);
            onAnalysisComplete(data.resumeText, data.analysis);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
            setTimeout(() => setProgress(0), 600);
        }
    };

    const fileIcon = file?.name.endsWith('.docx') ? '📝' : '📄';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Drop zone */}
            <div
                onClick={() => !uploading && inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                className={`upload-zone ${dragging ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,.docx"
                    style={{ display: 'none' }}
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />

                <div className={`upload-zone-icon ${file ? 'success' : 'default'}`}>
                    {file ? fileIcon : '📤'}
                </div>

                {file ? (
                    <>
                        <h3 style={{ color: '#34d399' }}>{file.name}</h3>
                        <p>{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                    </>
                ) : (
                    <>
                        <h3>Drop your resume here</h3>
                        <p>or click to browse</p>
                        <div className="upload-file-badges">
                            <span className="file-badge">PDF</span>
                            <span className="file-badge">DOCX</span>
                            <span className="file-badge">Max 10 MB</span>
                        </div>
                    </>
                )}
            </div>

            {/* Progress */}
            {uploading && progress > 0 && (
                <div className="upload-progress">
                    <div className="upload-progress-label">
                        <span>Analysing resume with AI…</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="upload-progress-track">
                        <div className="upload-progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="alert error">
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="btn btn-cyan btn-full"
                style={{ padding: '1rem', fontSize: '1rem', borderRadius: '1rem' }}
            >
                {uploading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg className="animate-spin" style={{ width: '1.25rem', height: '1.25rem' }} viewBox="0 0 24 24" fill="none">
                            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Analysing Resume…
                    </span>
                ) : '🔍 Analyse My Resume'}
            </button>
        </div>
    );
}
