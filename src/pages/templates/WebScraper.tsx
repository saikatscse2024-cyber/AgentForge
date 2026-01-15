
// import React, { useState } from 'react';
// import { ArrowLeft, Play, AlertCircle, CheckCircle, Loader2, Globe } from 'lucide-react';
// import { ThinkingTerminal, type LogStep } from '../../components/agent/ThinkingTerminal';
// import { agentService } from '../../services/agentService';

// interface WebScraperProps {
//     onBack: () => void;
// }

// export const WebScraper: React.FC<WebScraperProps> = ({ onBack }) => {
//     const [targetUrl, setTargetUrl] = useState('');
//     const [dataPoints, setDataPoints] = useState('');
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
//             if (!targetUrl || !dataPoints) {
//                 throw new Error('Please fill in all details');
//             }

//             addLog("Initializing Web Scraper...", 'info');
//             await new Promise(r => setTimeout(r, 600));

//             addLog(`Analyzing target URL: ${targetUrl}`, 'analysis');
//             await new Promise(r => setTimeout(r, 800));

//             addLog("Fetching metadata and structure...", 'tool');

//             const prompt = `Execute the agent task: Web Data Scraper.\nDescription: Extract data from websites.\n\nInputs:\n- Target URL: ${targetUrl}\n- Data Points: ${dataPoints}`;
//             const response = await agentService.executeAdHoc(prompt);

//             const rawOutput = response.data.output;
//             const finalOutput = typeof rawOutput === 'string' ? rawOutput : JSON.stringify(rawOutput, null, 2);

//             setResult({
//                 status: 'success',
//                 message: 'Scraping completed successfully!',
//                 data: {
//                     output: finalOutput,
//                     timestamp: new Date().toISOString()
//                 }
//             });
//             addLog("Data extracted successfully.", 'success');

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
//                         <div className="p-2 rounded-lg bg-purple-500/20">
//                             <Globe className="w-6 h-6 text-purple-400" />
//                         </div>
//                         <div>
//                             <h1 className="text-xl font-bold">Web Data Scraper</h1>
//                             <p className="text-sm text-slate-400">Data Collection</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="max-w-4xl mx-auto px-6 py-12">
//                 <div className="grid md:grid-cols-3 gap-8">
//                     <div className="md:col-span-2 space-y-8">
//                         <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
//                             <h2 className="text-xl font-bold mb-4">Configure Scraper</h2>
//                             <p className="text-gray-400 mb-8">Extract data from websites and save to spreadsheet.</p>

//                             <div className="space-y-6">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-300 mb-2">Target URL <span className="text-pink-500">*</span></label>
//                                     <input
//                                         type="text"
//                                         placeholder="https://example.com/products"
//                                         className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-600"
//                                         value={targetUrl}
//                                         onChange={(e) => setTargetUrl(e.target.value)}
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-300 mb-2">Data to Extract <span className="text-pink-500">*</span></label>
//                                     <textarea
//                                         rows={4}
//                                         placeholder="Product Name, Price, Rating"
//                                         className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-600"
//                                         value={dataPoints}
//                                         onChange={(e) => setDataPoints(e.target.value)}
//                                     />
//                                 </div>
//                             </div>

//                             <div className="mt-8 pt-8 border-t border-white/10">
//                                 <button
//                                     onClick={handleRun}
//                                     disabled={loading}
//                                     className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                                 >
//                                     {loading ? (
//                                         <>
//                                             <Loader2 className="w-5 h-5 animate-spin" />
//                                             Scraping...
//                                         </>
//                                     ) : (
//                                         <>
//                                             <Play className="w-5 h-5" />
//                                             Start Scraping
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
//                                             {error ? 'Execution Failed' : 'Execution Successful'}
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
//                 </div>
//             </div>
//         </div>
//     );
// };



import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft, ShieldCheck, ShieldAlert, Globe, Loader2,
    Search, Shield, Lock, MapPin, Server,  ExternalLink,
} from 'lucide-react';
import { ThinkingTerminal, type LogStep } from '../../components/agent/ThinkingTerminal';

const WebScraper: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    // --- STATE ---
    const [targetUrl, setTargetUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<LogStep[]>([]);
    const [report, setReport] = useState<any>(null);

    // --- REFS ---
    const terminalRef = useRef<HTMLDivElement>(null);

    // --- AUTO-SCROLL LOGIC ---
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTo({
                top: terminalRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [logs]);

    const addLog = (message: string, type: LogStep['type'] = 'info') => {
        setLogs(prev => [...prev, {
            id: Math.random().toString(36).substring(2, 9),
            message,
            type,
            timestamp: Date.now()
        }]);
    };

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const handleAnalyze = async () => {
        if (!targetUrl) return;

        setLoading(true);
        setReport(null);
        setLogs([]);

        try {
            // 1. URL Normalization
            const cleanUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
            const urlObj = new URL(cleanUrl);
            const hostname = urlObj.hostname.toLowerCase();

            addLog(`📡 Target acquired: ${hostname}`, "info");
            await sleep(500);

            // 2. Real DNS Fetch (Google DNS over HTTPS)
            addLog("🔍 Querying Global DNS records...", "analysis");
            const dnsResponse = await fetch(`https://dns.google/resolve?name=${hostname}`);
            const dnsData = await dnsResponse.json();

            if (!dnsData.Answer) throw new Error("Domain does not exist.");
            const publicIp = dnsData.Answer[0].data;
            addLog(`✅ DNS Success: Bound to ${publicIp}`, "success");

            // 3. Real Geolocation Fetch (ipapi.co)
            addLog("🌍 Geolocation tracing in progress...", "analysis");
            const geoResponse = await fetch(`https://ipapi.co/${publicIp}/json/`);
            const geoData = await geoResponse.json();
            addLog(`🛰️ Origin: ${geoData.city}, ${geoData.country_name} (${geoData.org})`, "success");

            // 4. Heuristic Analysis Logic
            addLog("🥘 Processing security heuristics...", "info");
            await sleep(800);

            let riskScore = 10;
            const redFlags = [];

            // Protocol Check
            if (urlObj.protocol !== 'https:') {
                riskScore += 40;
                redFlags.push("INSECURE: Unencrypted connection (HTTP detected)");
            }

            // Redirect & Shortener Check
            const shorteners = ['bit.ly', 't.co', 'tinyurl.com', 'is.gd', 'buff.ly', 'goo.gl'];
            const redirectKeys = ['url', 'redirect', 'dest', 'target', 'next', 'goto', 'link'];
            const hasRedirect = redirectKeys.some(key => urlObj.searchParams.has(key));

            if (shorteners.includes(hostname.replace('www.', ''))) {
                riskScore += 35;
                redFlags.push("MASKED: URL shortener obscures final destination");
            }

            if (hasRedirect) {
                riskScore += 25;
                redFlags.push("OPEN_REDIRECT: Dynamic routing parameters found");
            }

            // Obfuscation check
            if (targetUrl.includes('%25')) {
                riskScore += 30;
                redFlags.push("OBFUSCATION: Double-encoding detected (%25)");
            }

            // TLD Analysis
            const suspiciousTLDs = ['.xyz', '.top', '.zip', '.pw'];
            if (suspiciousTLDs.some(tld => hostname.endsWith(tld))) {
                riskScore += 15;
                redFlags.push("TLD_RISK: High-frequency spam domain extension");
            }

            const finalScore = Math.min(100, riskScore);
            const status = finalScore > 65 ? 'danger' : finalScore > 30 ? 'suspicious' : 'safe';

            setReport({
                status,
                score: finalScore,
                metadata: {
                    hostname: urlObj.hostname,
                    ip: publicIp,
                    provider: geoData.org || "Global Provider",
                    location: `${geoData.city}, ${geoData.country_name}`,
                    protocol: urlObj.protocol.toUpperCase().replace(':', ''),
                    redirectRisk: hasRedirect || shorteners.includes(hostname.replace('www.', '')) ? "HIGH" : "LOW",
                    flags: redFlags.length > 0 ? redFlags : ["No malicious patterns detected."]
                }
            });

            addLog("🍽️ Scan complete. Report served.", "success");

        } catch (err: any) {
            addLog(`🧨 CRITICAL: ${err.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 font-sans p-6 md:p-12 selection:bg-orange-500/30">
            <div className="max-w-[1400px] mx-auto">

                {/* --- HEADER --- */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
                    <div className="space-y-4">
                        <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-slate-500 hover:text-orange-500 transition-colors uppercase">
                            <ArrowLeft className="w-3 h-3" />
                            Return_to_Dash
                        </button>
                        <h1 className="text-6xl font-bold tracking-tight text-white leading-none">
                            Link<span className="text-orange-500">Guard</span>
                        </h1>
                    </div>

                    <div className="w-full lg:max-w-xl relative group">
                        <input
                            type="text"
                            placeholder="https://..."
                            value={targetUrl}
                            onChange={(e) => setTargetUrl(e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl px-6 py-5 pr-32 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-slate-700"
                        />
                        <button
                            onClick={handleAnalyze}
                            disabled={loading || !targetUrl}
                            className="absolute right-2 top-2 bottom-2 bg-white text-black px-6 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-orange-500 transition-all disabled:opacity-20 active:scale-95"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Scan Link'}
                        </button>
                    </div>
                </div>

                {/* --- MAIN GRID --- */}
                <div className="grid lg:grid-cols-12 gap-10 items-start">

                    {/* LEFT: TERMINAL DISPLAY */}
                    <div className="lg:col-span-5 lg:sticky lg:top-10">
                        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Globe className="text-orange-500 w-4 h-4" />
                                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Analysis_Terminal_v2</span>
                                </div>
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-red-500/20" />
                                    <div className="w-2 h-2 rounded-full bg-orange-500/20" />
                                    <div className="w-2 h-2 rounded-full bg-green-500/20" />
                                </div>
                            </div>

                            {/* SCROLL FIX APPLIED HERE */}
                            <div
                                ref={terminalRef}
                                className="h-[480px] p-6 overflow-y-auto overflow-x-hidden scroll-smooth
                                            /* Hide scrollbar for Chrome, Safari and Opera */
                                            [&::-webkit-scrollbar]:display-none
                                            /* Hide scrollbar for IE, Edge and Firefox */
                                            [ms-overflow-style:none]
                                            [scrollbar-width:none]
                                            /* Ensure text wraps to prevent horizontal scroll */
                                            break-all whitespace-pre-wrap">
                                <style dangerouslySetInnerHTML={{
                                    __html: `[ref="terminalRef"]::-webkit-scrollbar { display: none; }`
                                }} />
                                <ThinkingTerminal logs={logs} isVisible={true} />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: RESULT PANELS */}
                    <div className="lg:col-span-7 space-y-6">
                        {report ? (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {/* Result Header */}
                                <div className={`p-10 rounded-3xl border ${report.status === 'safe' ? 'bg-green-500/5 border-green-500/20' :
                                    report.status === 'suspicious' ? 'bg-orange-500/5 border-orange-500/20' :
                                        'bg-red-500/5 border-red-500/20'
                                    } flex items-center gap-8 mb-6`}>
                                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${report.status === 'safe' ? 'bg-green-500/20 text-green-400' :
                                        report.status === 'suspicious' ? 'bg-orange-500/20 text-orange-400' :
                                            'bg-red-500/20 text-red-400'
                                        }`}>
                                        {report.status === 'safe' ? <ShieldCheck className="w-10 h-10" /> : <ShieldAlert className="w-10 h-10" />}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-white mb-1 uppercase tracking-tighter leading-none">
                                            {report.status === 'safe' ? 'Verified Clean' : report.status === 'suspicious' ? 'Caution Advised' : 'Threat Identified'}
                                        </h2>
                                        <p className="text-slate-500 font-medium tracking-tight">
                                            Risk Probability: <span className={report.status === 'safe' ? 'text-green-500' : 'text-red-500'}>{report.score}%</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Detailed Metrics */}
                                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-8">
                                    <div className="flex items-center gap-2 mb-8 text-slate-400">
                                        <Search className="w-4 h-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Global_Infrastructure_Audit</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 mb-8">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                                <Lock className="w-3 h-3" /> Protocol
                                            </p>
                                            <p className="text-sm font-mono text-white">{report.metadata.protocol}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                                <ExternalLink className="w-3 h-3" /> Redirect_Risk
                                            </p>
                                            <p className={`text-sm font-mono ${report.metadata.redirectRisk === 'HIGH' ? 'text-orange-500' : 'text-green-500'}`}>
                                                {report.metadata.redirectRisk} POTENTIAL
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                                <MapPin className="w-3 h-3" /> Geo_Location
                                            </p>
                                            <p className="text-sm font-mono text-white leading-tight">{report.metadata.location}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                                <Server className="w-3 h-3" /> Infrastructure
                                            </p>
                                            <p className="text-sm font-mono text-white truncate">{report.metadata.provider}</p>
                                        </div>
                                    </div>

                                    <div className="bg-black/40 rounded-xl border border-white/5 p-6">
                                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4 italic underline">Security_Verdict_Log</p>
                                        <ul className="space-y-2">
                                            {report.metadata.flags.map((flag: string, i: number) => (
                                                <li key={i} className="text-[12px] font-mono text-slate-400 flex items-start gap-3">
                                                    <span className="text-orange-500">{'>'}</span> {flag}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-[600px] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center space-y-4 opacity-20 grayscale transition-all">
                                <Shield className="w-12 h-12 text-slate-400" />
                                <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-center">System_Awaiting_Payload</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WebScraper;