
// import React, { useState } from 'react';
// import { ArrowLeft, Play, Loader2, Zap } from 'lucide-react';
// import { ThinkingTerminal, type LogStep } from '../../components/agent/ThinkingTerminal';
// import { agentService } from '../../services/agentService';

// interface AlertSystemProps {
//     onBack: () => void;
// }

// export const AlertSystem: React.FC<AlertSystemProps> = ({ onBack }) => {
//     const [condition, setCondition] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [result, setResult] = useState<any>(null);
//     const [error, setError] = useState<string | null>(null);
//     const [logs, setLogs] = useState<LogStep[]>([]);

//     const addLog = (message: string, type: LogStep['type'] = 'info') => {
//         setLogs(prev => [...prev, {
//             id: Math.random().toString(36).substr(2, 9),
//             message,
//             type,
//             timestamp: Date.now()
//         }]);
//     };

//     const handleRun = async () => {
//         setLoading(true);
//         setError(null);
//         setResult(null);
//         setLogs([]);

//         try {
//             if (!condition) throw new Error('Please enter a condition');

//             addLog("Initializing Alert System...", 'info');
//             await new Promise(r => setTimeout(r, 600));

//             addLog(`Setting up watchers for: ${condition}`, 'tool');
//             await new Promise(r => setTimeout(r, 800));

//             addLog("Monitoring stream...", 'analysis');

//             const prompt = `Execute the agent task: Alert System.\nDescription: Monitor conditions and send instant notifications.\n\nInputs:\n- Condition: ${condition}`;
//             const response = await agentService.executeAdHoc(prompt);

//             const rawOutput = response.data.output;
//             const finalOutput = typeof rawOutput === 'string' ? rawOutput : JSON.stringify(rawOutput, null, 2);

//             setResult({
//                 status: 'success',
//                 message: 'Alert configured successfully!',
//                 data: { output: finalOutput, timestamp: new Date().toISOString() }
//             });
//             addLog("Alert active.", 'success');

//         } catch (err: any) {
//             setError(err.message || 'Error occurred');
//             addLog(`Error: ${err.message}`, 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
//             <div className="bg-slate-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20">
//                 <div className="max-w-4xl mx-auto px-6 py-4">
//                     <div className="flex items-center gap-4">
//                         <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
//                             <ArrowLeft className="w-5 h-5 text-slate-400" />
//                         </button>
//                         <div className="p-2 rounded-lg bg-orange-500/20">
//                             <Zap className="w-6 h-6 text-orange-400" />
//                         </div>
//                         <div>
//                             <h1 className="text-xl font-bold">Alert System</h1>
//                             <p className="text-sm text-slate-400">Monitoring</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="max-w-4xl mx-auto px-6 py-12">
//                 <div className="grid md:grid-cols-3 gap-8">
//                     <div className="md:col-span-2 space-y-8">
//                         <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
//                             <h2 className="text-xl font-bold mb-4">Configure Agent</h2>
//                             <p className="text-gray-400 mb-8">Monitor conditions and send instant notifications.</p>

//                             <div className="space-y-6">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-300 mb-2">Alert Condition <span className="text-pink-500">*</span></label>
//                                     <textarea
//                                         rows={4}
//                                         placeholder="If stock price > 150"
//                                         className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-600"
//                                         value={condition}
//                                         onChange={(e) => setCondition(e.target.value)}
//                                     />
//                                 </div>
//                             </div>

//                             <div className="mt-8 pt-8 border-t border-white/10">
//                                 <button
//                                     onClick={handleRun}
//                                     disabled={loading}
//                                     className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                                 >
//                                     {loading ? (
//                                         <>
//                                             <Loader2 className="w-5 h-5 animate-spin" />
//                                             Activating...
//                                         </>
//                                     ) : (
//                                         <>
//                                             <Play className="w-5 h-5" />
//                                             Set Alert
//                                         </>
//                                     )}
//                                 </button>
//                             </div>
//                         </div>

//                         {(loading || logs.length > 0) && <ThinkingTerminal logs={logs} isVisible={true} />}
//                         {(result || error) && (
//                             <div className={`rounded-xl border p-6 ${error ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
//                                 <h3 className={`font-bold mb-2 ${error ? 'text-red-400' : 'text-green-400'}`}>{error ? 'Failed' : 'Success'}</h3>
//                                 {result && <div className="text-sm whitespace-pre-wrap">{result.data.output}</div>}
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };







import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Loader2, Zap, Bell, Clock } from 'lucide-react';
import { ThinkingTerminal, type LogStep } from '../../components/agent/ThinkingTerminal';

interface AlertSystemProps {
    onBack: () => void;
}

interface ActiveTimer {
    id: string;
    text: string;
    targetTime: number;
    timeLeft: number;
}

export const AlertSystem: React.FC<AlertSystemProps> = ({ onBack }) => {
    const [condition, setCondition] = useState('');
    const [minutes, setMinutes] = useState('0');
    const [seconds, setSeconds] = useState('10');
    const [loading, setLoading] = useState(false);
    const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);
    const [showPopup, setShowPopup] = useState<{ show: boolean, text: string }>({ show: false, text: '' });
    const [logs, setLogs] = useState<LogStep[]>([]);

    // Countdown Logic: Runs every second to update the UI
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTimers(prev => prev.map(timer => {
                const remaining = Math.max(0, Math.floor((timer.targetTime - Date.now()) / 1000));

                // Trigger completion when hits zero
                if (remaining === 0 && timer.timeLeft > 0) {
                    handleTimerComplete(timer.text);
                }

                return { ...timer, timeLeft: remaining };
            }).filter(t => t.timeLeft > 0 || Date.now() - t.targetTime < 2000)); // Keep visible for 2s after completion
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleTimerComplete = (text: string) => {
        // Trigger Sound
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => { });

        // Trigger System Notification
        if (Notification.permission === "granted") {
            new Notification("AgentWeaver Alert!", { body: text });
        }

        // Show UI Popup
        setShowPopup({ show: true, text });
    };

    const addLog = (message: string, type: LogStep['type'] = 'info') => {
        setLogs(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            message, type, timestamp: Date.now()
        }]);
    };

    const handleStartTimer = async () => {
        const totalMs = (parseInt(minutes) * 60 + parseInt(seconds)) * 1000;
        if (totalMs <= 0 || !condition) return;

        setLoading(true);
        addLog(`Protocol initiated for: ${condition}`, 'info');
        await new Promise(r => setTimeout(r, 600));

        const newTimer: ActiveTimer = {
            id: Math.random().toString(36).substr(2, 9),
            text: condition,
            targetTime: Date.now() + totalMs,
            timeLeft: totalMs / 1000
        };

        setActiveTimers(prev => [...prev, newTimer]);
        addLog(`Agent watching clock. Target T-minus ${minutes}m ${seconds}s`, 'success');

        setLoading(false);
        setCondition('');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
            {/* Completion Popup Overlay */}
            {showPopup.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-orange-500/50 p-8 rounded-3xl max-w-sm w-full shadow-[0_0_50px_rgba(249,115,22,0.2)] text-center relative">
                        <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bell className="w-10 h-10 text-orange-500 animate-bounce" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Alert Triggered!</h2>
                        <p className="text-slate-400 mb-8">{showPopup.text}</p>
                        <button
                            onClick={() => setShowPopup({ show: false, text: '' })}
                            className="w-full py-3 bg-orange-600 rounded-xl font-bold hover:bg-orange-500 transition-colors"
                        >
                            Acknowledge
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-slate-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-400" />
                    </button>
                    <div className="p-2 rounded-lg bg-orange-500/20">
                        <Zap className="w-6 h-6 text-orange-400" />
                    </div>
                    <h1 className="text-xl font-bold italic tracking-tight">ALERT_KERNEL v1.0</h1>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Setup Panel */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-orange-400" />
                                Timer Configuration
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-mono text-slate-500 mb-2 block uppercase">What should I monitor?</label>
                                    <input
                                        type="text"
                                        placeholder="Meeting starts / Check the crypto price..."
                                        className="w-full bg-slate-950 border border-white/5 rounded-2xl px-5 py-4 focus:border-orange-500/50 outline-none transition-all"
                                        value={condition}
                                        onChange={(e) => setCondition(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-mono text-slate-500 mb-2 block uppercase">Minutes</label>
                                        <input
                                            type="number" min="0"
                                            className="w-full bg-slate-950 border border-white/5 rounded-xl px-5 py-4 outline-none focus:bg-orange-500/5 transition-colors"
                                            value={minutes}
                                            onChange={(e) => setMinutes(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-mono text-slate-500 mb-2 block uppercase">Seconds</label>
                                        <input
                                            type="number" min="0" max="59"
                                            className="w-full bg-slate-950 border border-white/5 rounded-xl px-5 py-4 outline-none focus:bg-orange-500/5 transition-colors"
                                            value={seconds}
                                            onChange={(e) => setSeconds(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleStartTimer}
                                    disabled={loading || !condition}
                                    className="w-full py-4 bg-orange-600 hover:bg-orange-500 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-orange-900/20 active:scale-[0.98] transition-all"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                                    Deploy Active Watcher
                                </button>
                            </div>
                        </div>

                        <ThinkingTerminal logs={logs} isVisible={logs.length > 0} />
                    </div>

                    {/* Live Countdowns Sidebar */}
                    <div className="space-y-4">
                        <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
                            <h3 className="text-xs font-bold text-slate-500 mb-4 tracking-widest uppercase">Live Countdowns</h3>

                            <div className="space-y-3">
                                {activeTimers.length === 0 ? (
                                    <div className="py-10 text-center border border-dashed border-white/10 rounded-2xl text-slate-600 text-sm">
                                        No active processes
                                    </div>
                                ) : (
                                    activeTimers.map(timer => (
                                        <div key={timer.id} className="bg-slate-950 border border-orange-500/20 p-4 rounded-2xl flex items-center justify-between">
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-medium truncate pr-2">{timer.text}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Active</span>
                                                </div>
                                            </div>
                                            <div className="text-xl font-mono font-bold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-lg">
                                                {Math.floor(timer.timeLeft / 60)}:{(timer.timeLeft % 60).toString().padStart(2, '0')}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};