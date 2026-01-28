
import React, { useState } from 'react';
import { ArrowLeft, Check, AlertCircle, Sparkles, Wand2, Type } from 'lucide-react';
import { ThinkingTerminal, type LogStep } from '../../components/agent/ThinkingTerminal';

interface GrammarXProps {
    onBack: () => void;
}

interface GrammarError {
    message: string;
    shortMessage: string;
    offset: number;
    length: number;
    replacements: { value: string }[];
    rule: {
        id: string;
        description: string;
        issueType: string;
        category: {
            id: string;
            name: string;
        }
    };
}

export const GrammarX: React.FC<GrammarXProps> = ({ onBack }) => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<GrammarError[]>([]);
    const [logs, setLogs] = useState<LogStep[]>([]);
    const [correctedText, setCorrectedText] = useState('');

    const addLog = (message: string, type: LogStep['type'] = 'info') => {
        setLogs(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            message,
            type,
            timestamp: Date.now()
        }]);
    };

    const handleCheck = async () => {
        if (!text.trim()) return;

        setLoading(true);
        setLogs([]);
        setErrors([]);
        setCorrectedText('');

        try {
            addLog("Initializing GrammarX Engine...", 'info');
            await new Promise(r => setTimeout(r, 600));

            addLog("Analyzing linguistic structure...", 'analysis');

            // Construct API request to LanguageTool
            const params = new URLSearchParams();
            params.append('text', text);
            params.append('language', 'en-US');

            const response = await fetch('https://api.languagetool.org/v2/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: params
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();

            addLog(`Analysis complete. Found ${data.matches.length} potential issues.`, 'success');
            setErrors(data.matches);

            // Generate auto-corrected text
            let currentText = text;
            // Process replacements in reverse order to preserve string indices
            const sortedMatches = [...data.matches].sort((a: GrammarError, b: GrammarError) => b.offset - a.offset);

            for (const match of sortedMatches) {
                if (match.replacements && match.replacements.length > 0) {
                    const before = currentText.slice(0, match.offset);
                    const after = currentText.slice(match.offset + match.length);
                    currentText = before + match.replacements[0].value + after;
                }
            }

            setCorrectedText(currentText);

        } catch (err: any) {
            addLog(`Error: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const applyCorrection = (textToApply: string) => {
        setText(textToApply);
        setCorrectedText('');
        setErrors([]);
        addLog("Corrections applied successfully.", 'success');
    };

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 font-sans p-6 md:p-12 selection:bg-purple-500/30">
            <div className="max-w-[1400px] mx-auto">

                {/* --- HEADER --- */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
                    <div className="space-y-4">
                        <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-slate-500 hover:text-purple-500 transition-colors uppercase">
                            <ArrowLeft className="w-3 h-3" />
                            Return_to_Deck
                        </button>
                        <h1 className="text-6xl font-bold tracking-tight text-white leading-none">
                            Grammar<span className="text-purple-500">X</span>
                        </h1>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-10 items-start">

                    {/* LEFT: INPUT AREA */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Type className="w-4 h-4 text-purple-400" />
                                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Input_Stream</h2>
                                </div>
                                {text && (
                                    <span className="text-[10px] font-mono text-slate-600">
                                        {text.length} CHARS
                                    </span>
                                )}
                            </div>

                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Enter text to grammar check (e.g., 'I has a apple')..."
                                className="w-full h-80 bg-slate-950/50 border border-white/5 rounded-xl p-6 text-lg leading-relaxed text-white placeholder:text-slate-700 focus:outline-none focus:border-purple-500/50 transition-all resize-none font-serif"
                                spellCheck={false}
                            />

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleCheck}
                                    disabled={loading || !text}
                                    className="px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-xs uppercase tracking-widest text-white shadow-xl shadow-purple-900/20 active:scale-[0.98] transition-all disabled:opacity-30 flex items-center gap-3"
                                >
                                    {loading ? (
                                        <>
                                            <Wand2 className="w-4 h-4 animate-spin" />
                                            Analysing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            Improvise_Text
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Terminal for logs */}
                        {(loading || logs.length > 0) && (
                            <div className="border border-white/5 rounded-2xl overflow-hidden">
                                <ThinkingTerminal logs={logs} isVisible={true} />
                            </div>
                        )}
                    </div>

                    {/* RIGHT: RESULTS AREA */}
                    <div className="lg:col-span-5 space-y-6">
                        {correctedText && errors.length > 0 ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {/* Correction Preview */}
                                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-3xl p-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Check className="w-24 h-24 text-green-500" />
                                    </div>

                                    <h3 className="text-sm font-bold text-green-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Check className="w-4 h-4" />
                                        Optimized_Result
                                    </h3>

                                    <p className="text-lg text-white font-serif leading-relaxed whitespace-pre-wrap">
                                        {correctedText}
                                    </p>

                                    <button
                                        onClick={() => applyCorrection(correctedText)}
                                        className="mt-6 w-full py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl text-green-400 font-bold text-xs uppercase tracking-widest transition-all"
                                    >
                                        Apply_Fixes
                                    </button>
                                </div>

                                {/* detailed errors */}
                                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
                                        Detected_Issues ({errors.length})
                                    </h3>

                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {errors.map((error, idx) => (
                                            <div key={idx} className="bg-slate-900/50 border border-white/5 rounded-xl p-4 hover:border-purple-500/30 transition-colors">
                                                <div className="flex items-start gap-3">
                                                    <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <div className="text-sm font-medium text-white mb-1">
                                                            {text.slice(error.offset, error.offset + error.length)}
                                                            <span className="text-slate-500 mx-2">→</span>
                                                            <span className="text-green-400">{error.replacements[0]?.value || '?'}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 leading-relaxed">
                                                            {error.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : errors.length === 0 && correctedText ? (
                            <div className="h-full flex items-center justify-center p-12 border border-green-500/20 bg-green-500/5 rounded-3xl">
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                                        <Check className="w-8 h-8 text-green-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Perfect Grammar!</h3>
                                    <p className="text-slate-400 text-sm">No issues were detected in your text.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-[400px] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center space-y-4 opacity-20 grayscale">
                                <Wand2 className="w-12 h-12 text-slate-400" />
                                <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-center">Awaiting_Input</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
