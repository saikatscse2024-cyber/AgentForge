
// import React, { useState } from 'react';
// import { ArrowLeft, Play, AlertCircle, CheckCircle, Loader2, Calendar } from 'lucide-react';
// import { ThinkingTerminal, type LogStep } from '../../components/agent/ThinkingTerminal';
// import { agentService } from '../../services/agentService';

// interface MeetingSchedulerProps {
//     onBack: () => void;
// }

// export const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({ onBack }) => {
//     const [calendarUrl, setCalendarUrl] = useState('');
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
//             if (!calendarUrl) {
//                 throw new Error('Please provide a Calendar Link');
//             }

//             addLog("Initializing Meeting Scheduler...", 'info');
//             await new Promise(r => setTimeout(r, 600));

//             addLog(`Validating calendar URL: ${calendarUrl}`, 'analysis');
//             await new Promise(r => setTimeout(r, 500));
//             addLog("URL verified successfully.", 'success');

//             addLog("Connecting to AI Engine...", 'info');

//             // Construct prompt
//             const prompt = `Execute the agent task: Meeting Scheduler.\nDescription: Automatically schedule meetings based on calendar availability.\n\nInputs:\n- Calendar Link: ${calendarUrl}`;

//             const response = await agentService.executeAdHoc(prompt);

//             const rawOutput = response.data.output;
//             const finalOutput = typeof rawOutput === 'string' ? rawOutput : JSON.stringify(rawOutput, null, 2);

//             setResult({
//                 status: 'success',
//                 message: 'Meeting Scheduler executed successfully!',
//                 data: {
//                     output: finalOutput,
//                     timestamp: new Date().toISOString()
//                 }
//             });
//             addLog("Execution completed successfully.", 'success');

//         } catch (err: any) {
//             setError(err.message || 'An error occurred');
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
//                         <div className="p-2 rounded-lg bg-green-500/20">
//                             <Calendar className="w-6 h-6 text-green-400" />
//                         </div>
//                         <div>
//                             <h1 className="text-xl font-bold">Meeting Scheduler</h1>
//                             <p className="text-sm text-slate-400">Productivity</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="max-w-4xl mx-auto px-6 py-12">
//                 <div className="grid md:grid-cols-3 gap-8">
//                     <div className="md:col-span-2 space-y-8">
//                         <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
//                             <h2 className="text-xl font-bold mb-4">Configure Scheduler</h2>
//                             <p className="text-gray-400 mb-8">Automatically schedule meetings based on calendar availability.</p>

//                             <div className="space-y-6">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                                         Calendar Link <span className="text-pink-500">*</span>
//                                     </label>
//                                     <input
//                                         type="text"
//                                         placeholder="https://cal.com/username"
//                                         className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors placeholder-gray-600"
//                                         value={calendarUrl}
//                                         onChange={(e) => setCalendarUrl(e.target.value)}
//                                     />
//                                 </div>
//                             </div>

//                             <div className="mt-8 pt-8 border-t border-white/10">
//                                 <button
//                                     onClick={handleRun}
//                                     disabled={loading}
//                                     className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                                 >
//                                     {loading ? (
//                                         <>
//                                             <Loader2 className="w-5 h-5 animate-spin" />
//                                             Scheduling...
//                                         </>
//                                     ) : (
//                                         <>
//                                             <Play className="w-5 h-5" />
//                                             Run Scheduler
//                                         </>
//                                     )}
//                                 </button>
//                             </div>
//                         </div>

//                         {(loading || logs.length > 0) && (
//                             <ThinkingTerminal logs={logs} isVisible={true} />
//                         )}

//                         {(result || error) && (
//                             <div className={`rounded-xl border p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ${error ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
//                                 <div className="flex items-start gap-4">
//                                     {error ? <AlertCircle className="w-6 h-6 text-red-400" /> : <CheckCircle className="w-6 h-6 text-green-400" />}
//                                     <div className="w-full">
//                                         <h3 className={`font-bold mb-2 ${error ? 'text-red-400' : 'text-green-400'}`}>
//                                             {error ? 'Scheduling Failed' : 'Scheduling Successful'}
//                                         </h3>
//                                         {result && result.data && (
//                                             <div className="bg-slate-950/50 p-6 rounded-lg text-sm leading-relaxed whitespace-pre-wrap font-sans text-gray-200 border border-white/5">
//                                                 {result.data.output}
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>

//                     {/* Right Column: Info */}
//                     <div className="space-y-6">
//                         <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24">
//                             <h3 className="font-bold text-gray-300 mb-4">About the Scheduler</h3>
//                             <ul className="space-y-4 text-sm text-gray-400">
//                                 <li className="flex items-center gap-3">
//                                     <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
//                                         <Calendar className="w-4 h-4" />
//                                     </div>
//                                     <span>Syncs with Cal.com/Google</span>
//                                 </li>
//                                 <li className="flex items-center gap-3">
//                                     <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
//                                         <Loader2 className="w-4 h-4" />
//                                     </div>
//                                     <span>Instant Confirmation</span>
//                                 </li>
//                             </ul>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };


import React, { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { ThinkingTerminal, type LogStep } from '../../components/agent/ThinkingTerminal';

interface MeetingSchedulerProps {
    onBack: () => void;
}

export const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({ onBack }) => {
    const [eventTitle, setEventTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [duration, setDuration] = useState('60');

    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<LogStep[]>([]);

    const addLog = (message: string, type: LogStep['type'] = 'info') => {
        setLogs(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            message,
            type,
            timestamp: Date.now()
        }]);
    };

    const formatToGoogleDate = (dateStr: string, timeStr: string) => {
        const cleanDate = dateStr.replace(/-/g, '');
        const cleanTime = timeStr.replace(/:/g, '') + '00';
        return `${cleanDate}T${cleanTime}Z`;
    };

    const handleQuickSave = async () => {
        if (!eventTitle || !startDate || !startTime) {
            addLog("Validation failed: Missing required fields", 'error');
            return;
        }

        setLoading(true);
        setLogs([]);

        try {
            addLog("4-Bit Agent initializing...", 'info');
            await new Promise(r => setTimeout(r, 500));
            addLog("Calculating event bounds...", 'analysis');

            const startDateTime = new Date(`${startDate}T${startTime}`);
            const endDateTime = new Date(startDateTime.getTime() + parseInt(duration) * 60000);
            
            const startFormatted = formatToGoogleDate(startDate, startTime);
            const endFormatted = formatToGoogleDate(
                endDateTime.toISOString().split('T')[0], 
                endDateTime.toISOString().split('T')[1].substring(0, 5)
            );

            const params = new URLSearchParams({
                action: 'TEMPLATE',
                text: eventTitle,
                dates: `${startFormatted}/${endFormatted}`,
                details: description,
                location: location,
            });

            const finalUrl = `https://www.google.com/calendar/render?${params.toString()}`;
            
            addLog("Opening Google Calendar...", 'success');
            await new Promise(r => setTimeout(r, 400));

            // THE "JUST CLICK ON SAVE" LOGIC:
            window.open(finalUrl, '_blank');

        } catch (err: any) {
            addLog("Critical failure in protocol", 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
            {/* Responsive Header */}
            <div className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-all">
                            <ArrowLeft className="w-5 h-5 text-slate-400" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex p-2 rounded-lg bg-blue-600/20">
                                <Calendar className="w-5 h-5 text-blue-400" />
                            </div>
                            <h1 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                Event Forge
                            </h1>
                        </div>
                    </div>
                    <div className="hidden md:block text-xs font-mono text-slate-500 uppercase tracking-widest">
                        Protocol: v1.4.2
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Main Form Area */}
                    <div className="flex-1 space-y-6">
                        <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm shadow-2xl">
                            <div className="flex items-center gap-2 mb-6">
                                <Sparkles className="w-4 h-4 text-blue-400" />
                                <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Configure Parameters</h2>
                            </div>
                            
                            <div className="space-y-5">
                                {/* Title */}
                                <div className="group">
                                    <label className="block text-xs font-medium text-slate-500 mb-2 transition-colors group-focus-within:text-blue-400">EVENT TITLE *</label>
                                    <input
                                        type="text"
                                        placeholder="Weekly Sprint / 4-Bit Coders Meeting"
                                        className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3.5 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-700 shadow-inner"
                                        value={eventTitle}
                                        onChange={(e) => setEventTitle(e.target.value)}
                                    />
                                </div>

                                {/* Date/Time Grid - Responsive Columns */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-2">DATE</label>
                                        <input
                                            type="date"
                                            className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3.5 outline-none [color-scheme:dark]"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-2">START TIME</label>
                                        <input
                                            type="time"
                                            className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3.5 outline-none [color-scheme:dark]"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Location & Duration */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <label className="block text-xs font-medium text-slate-500 mb-2">LOCATION</label>
                                        <MapPin className="absolute left-4 top-[46px] w-4 h-4 text-slate-600" />
                                        <input
                                            type="text"
                                            placeholder="Google Meet"
                                            className="w-full bg-slate-950/50 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 outline-none"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-2">DURATION</label>
                                        <select 
                                            className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3.5 outline-none appearance-none"
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                        >
                                            <option value="30">30 Minutes</option>
                                            <option value="60">1 Hour</option>
                                            <option value="120">2 Hours</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-2">DESCRIPTION / NOTES</label>
                                    <textarea
                                        placeholder="Briefly describe the meeting objective..."
                                        rows={3}
                                        className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3.5 outline-none resize-none"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleQuickSave}
                                disabled={loading}
                                className="w-full mt-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl font-bold text-white shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin w-5 h-5" />
                                ) : (
                                    <>
                                        <span>Save to Google Calendar</span>
                                        <CheckCircle className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </>
                                )}
                            </button>
                        </div>

                        {(loading || logs.length > 0) && (
                            <div className="rounded-3xl overflow-hidden border border-white/5">
                                <ThinkingTerminal logs={logs} isVisible={true} />
                            </div>
                        )}
                    </div>

                    {/* Desktop Sidebar */}
                    <aside className="w-full lg:w-72 space-y-4">
                        <div className="bg-blue-600/5 border border-blue-500/10 rounded-3xl p-6">
                            <h3 className="text-sm font-bold text-blue-400 mb-3">Sync Status</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                AgentForge is connected via standard TEMPLATE protocols. No additional API keys required for this module.
                            </p>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};