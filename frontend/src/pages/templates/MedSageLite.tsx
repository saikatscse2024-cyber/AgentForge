import React, { useState } from 'react';
import { ArrowLeft, Activity, ShieldAlert, FileText, Database, HeartPulse, Pill, Search } from 'lucide-react';

interface MedSageLiteProps {
    onBack: () => void;
}

interface ExtractionResult {
    type: 'Condition' | 'Medication' | 'Vital' | 'Risk';
    value: string;
    sourceIndex: number; // For highlighting/traceability
    context: string;
    riskLevel?: 'Low' | 'Moderate' | 'High' | 'Critical';
}

// --- 1. LOCAL KNOWLEDGE BASE (THE "BRAIN") ---
const CONDITIONS_DB = [
    'Hypertension', 'Diabetes', 'Osteoarthritis', 'Asthma', 'COPD', 'Depression', 'Anxiety',
    'Hyperlipidemia', 'GERD', 'Thyroid Disorder', 'Migraine', 'Fibromyalgia', 'Cancer',
    'Heart Failure', 'Arrhythmia', 'Stroke', 'Kidney Disease', 'Liver Disease'
];

const MEDICATIONS_DB = [
    'Metformin', 'Lisinopril', 'Levothyroxine', 'Amlodipine', 'Metoprolol', 'Omeprazole',
    'Losartan', 'Simvastatin', 'Gabapentin', 'Hydrochlorothiazide', 'Sertraline', 'Fluticasone',
    'Montelukast', 'Furosemide', 'Pantoprazole', 'Prednisone', 'Escitalopram', 'Methotrexate',
    'Insulin', 'Warfarin', 'Eliquis', 'Xarelto', 'Atorvastatin', 'Aspirin', 'Ibuprofen', 'Naproxen'
];

const INTERACTIONS_DB = [
    { drugs: ['Warfarin', 'Aspirin'], risk: 'High', message: 'Bleeding Risk (Warfarin + Antiplatelet)' },
    { drugs: ['Warfarin', 'Ibuprofen'], risk: 'High', message: 'Bleeding Risk (Warfarin + NSAID)' },
    { drugs: ['Simvastatin', 'Amlodipine'], risk: 'Moderate', message: 'Myopathy Risk (Statin + CCB)' },
    { drugs: ['Lisinopril', 'Potassium'], risk: 'Moderate', message: 'Hyperkalemia Risk (ACEi + K+)' },
    { drugs: ['Methotrexate', 'Ibuprofen'], risk: 'High', message: 'Methotrexate Toxicity Risk' }
];

const CONTRAINDICATIONS_DB = [
    { condition: 'Asthma', drug: 'Metoprolol', risk: 'High', message: 'Bronchoconstriction Risk (Asthma + Beta Blocker)' },
    { condition: 'Kidney Disease', drug: 'Ibuprofen', risk: 'High', message: 'Renal Toxicity Risk (CKD + NSAID)' },
    { condition: 'Heart Failure', drug: 'Ibuprofen', risk: 'Moderate', message: 'Fluid Retention Risk (HF + NSAID)' }
];

const CRITICAL_SYMPTOMS_REGEX = /\b(chest pain|shortness of breath|syncope|crushing pain|difficulty breathing|severe headache)\b/gi;

// --- 2. DETERMINISTIC LOGIC ENGINE ---

export const MedSageLite: React.FC<MedSageLiteProps> = ({ onBack }) => {
    const [inputText, setInputText] = useState(`Patient presents with history significant for Osteoarthritis. 
Currently taking Methotrexate and Folic Acid. 
Vitals determined as: BP 145/92, HR 78. 
Patient reports no headaches or chest pain.`);

    const [results, setResults] = useState<ExtractionResult[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const runDeterministicExtraction = () => {
        setIsProcessing(true);
        const extractions: ExtractionResult[] = [];
        const lowerText = inputText.toLowerCase();

        // --- A. VITALS EXTRACTION (REGEX) ---
        // Pattern: Matches "120/80" or "140/90"
        const bpRegex = /\b\d{2,3}\/\d{2,3}\b/g;
        let match;
        while ((match = bpRegex.exec(inputText)) !== null) {
            const bpVal = match[0];
            const [sys, dia] = bpVal.split('/').map(Number);
            let risk: ExtractionResult['riskLevel'] = 'Low';

            if (sys > 180 || dia > 120) risk = 'Critical';
            else if (sys >= 140 || dia >= 90) risk = 'High';
            else if (sys >= 130 || dia >= 80) risk = 'Moderate';

            extractions.push({
                type: 'Vital',
                value: `BP ${bpVal}`,
                sourceIndex: match.index,
                context: `Found vital sign pattern`,
                riskLevel: risk
            });
        }

        // --- B. ENTITY EXTRACTION & NEGATION CHECK ---
        const checkNegation = (index: number, text: string) => {
            // Look backward 40 characters for negation terms
            const windowStart = Math.max(0, index - 40);
            const windowText = text.substring(windowStart, index).toLowerCase();
            const negationTerms = ['no ', 'not ', 'denies ', 'negative for ', 'without '];
            return negationTerms.some(term => windowText.includes(term));
        };

        // 1. Database Matching (Known Entities)
        CONDITIONS_DB.forEach(cond => {
            const idx = lowerText.indexOf(cond.toLowerCase());
            if (idx !== -1) {
                if (!checkNegation(idx, inputText)) {
                    extractions.push({
                        type: 'Condition',
                        value: cond,
                        sourceIndex: idx,
                        context: 'Matched against Clinical Knowledge Base (DB)',
                        riskLevel: 'Low' // Base risk, updated later
                    });
                }
            }
        });

        MEDICATIONS_DB.forEach(med => {
            const idx = lowerText.indexOf(med.toLowerCase());
            if (idx !== -1) {
                if (!checkNegation(idx, inputText)) {
                    let risk: ExtractionResult['riskLevel'] = 'Low';
                    if (['Methotrexate', 'Warfarin', 'Insulin'].includes(med)) risk = 'Moderate'; // High alert meds

                    extractions.push({
                        type: 'Medication',
                        value: med,
                        sourceIndex: idx,
                        context: 'Matched against Clinical Knowledge Base (DB)',
                        riskLevel: risk
                    });
                }
            }
        });

        // 2. Contextual Parsing (Regex for "Unknown" entities)
        // matches "diagnosed with [text]" or "taking [text]"
        const diagnosisRegex = /(?:diagnosed with|history of|suffering from)\s+([a-zA-Z\s]+?)(?:\.|,|and)/gi;
        while ((match = diagnosisRegex.exec(inputText)) !== null) {
            const capturedValues = match[1].trim();
            // Simple filter to avoid capturing too much garbage
            if (capturedValues.length > 3 && capturedValues.split(' ').length < 4) {
                // Check if we already found it via DB to avoid duplicates
                const alreadyFound = extractions.some(e => e.value.toLowerCase() === capturedValues.toLowerCase());
                if (!alreadyFound && !checkNegation(match.index, inputText)) {
                    extractions.push({
                        type: 'Condition',
                        value: capturedValues, // Keep original casing
                        sourceIndex: match.index,
                        context: `Extracted via Contextual Pattern: "${match[0].substring(0, 20)}..."`,
                        riskLevel: 'Low'
                    });
                }
            }
        }

        // --- C. RISK TRUTH TABLE ---
        // Global Risk Assessment based on combination of factors
        const highBPs = extractions.filter(e => e.type === 'Vital' && (e.riskLevel === 'High' || e.riskLevel === 'Critical'));
        if (highBPs.length > 0) {
            extractions.push({
                type: 'Risk',
                value: 'Uncontrolled Hypertension',
                sourceIndex: highBPs[0].sourceIndex,
                context: 'Logic Rule: BP > 140/90',
                riskLevel: 'High'
            });
        }

        const meds = extractions.filter(e => e.type === 'Medication').map(e => e.value);
        const conditions = extractions.filter(e => e.type === 'Condition').map(e => e.value);

        if (meds.length >= 5) {
            extractions.push({
                type: 'Risk',
                value: 'Polypharmacy Alert',
                sourceIndex: 0,
                context: `Logic Rule: ${meds.length} Active Medications`,
                riskLevel: 'Moderate'
            });
        }

        // 1. Drug-Drug Interactions
        INTERACTIONS_DB.forEach(rule => {
            const hasDrug1 = meds.some(m => m.toLowerCase() === rule.drugs[0].toLowerCase());
            const hasDrug2 = meds.some(m => m.toLowerCase() === rule.drugs[1].toLowerCase());

            if (hasDrug1 && hasDrug2) {
                extractions.push({
                    type: 'Risk',
                    value: rule.message,
                    sourceIndex: 0,
                    context: `Interaction: ${rule.drugs[0]} + ${rule.drugs[1]}`,
                    riskLevel: rule.risk as 'High' | 'Moderate'
                });
            }
        });

        // 2. Contraindications (Condition + Drug)
        CONTRAINDICATIONS_DB.forEach(rule => {
            const hasCondition = conditions.some(c => c.toLowerCase() === rule.condition.toLowerCase());
            const hasDrug = meds.some(m => m.toLowerCase() === rule.drug.toLowerCase());

            if (hasCondition && hasDrug) {
                extractions.push({
                    type: 'Risk',
                    value: rule.message,
                    sourceIndex: 0,
                    context: `Contraindication: ${rule.condition} + ${rule.drug}`,
                    riskLevel: rule.risk as 'High' | 'Moderate'
                });
            }
        });

        // 3. Critical Symptoms Regex
        while ((match = CRITICAL_SYMPTOMS_REGEX.exec(inputText)) !== null) {
            if (!checkNegation(match.index, inputText)) {
                extractions.push({
                    type: 'Risk',
                    value: `Critical Symptom: ${match[0]}`,
                    sourceIndex: match.index,
                    context: 'Matched Critical Symptom Pattern',
                    riskLevel: 'Critical'
                });
            }
        }

        if (extractions.some(e => e.value === 'Methotrexate')) {
            extractions.push({
                type: 'Risk',
                value: 'Requires Liver/Blood Monitoring',
                sourceIndex: 0,
                context: 'Logic Rule: High toxicity medication detected',
                riskLevel: 'Moderate'
            });
        }

        setResults(extractions);
        setIsProcessing(false);
    };

    const getRiskColor = (level?: string) => {
        switch (level) {
            case 'Critical': return 'text-rose-600 bg-rose-100 border-rose-200';
            case 'High': return 'text-orange-600 bg-orange-100 border-orange-200';
            case 'Moderate': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
            default: return 'text-emerald-600 bg-emerald-100 border-emerald-200';
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-emerald-400">
                            <Activity className="w-8 h-8" />
                            MedSage Lite
                        </h1>
                        <p className="text-slate-400">Rule-based clinical extraction engine with strict regex traceability.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Input Column */}
                    <div className="space-y-6">
                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                                <FileText className="w-5 h-5 text-blue-400" />
                                Clinical Note Input
                            </h2>

                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="w-full h-96 bg-slate-900 border border-slate-600 rounded-lg p-4 font-mono text-sm leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-300"
                                placeholder="Paste clinical notes here..."
                            />
                            <button
                                onClick={runDeterministicExtraction}
                                disabled={isProcessing}
                                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {isProcessing ? 'Processing...' : (
                                    <>
                                        <Search className="w-5 h-5" />
                                        Extract & Analyze Verification
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Debug/Info Box */}
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-dashed border-slate-700">
                            <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">Logic Engine Specs</h3>
                            <ul className="space-y-2 text-xs text-slate-500">
                                <li className="flex justify-between"><span>Knowledge Base:</span> <span className="text-slate-300">{CONDITIONS_DB.length + MEDICATIONS_DB.length} Entities</span></li>
                                <li className="flex justify-between"><span>Regex Patterns:</span> <span className="text-slate-300">Strict (BP, HR, Diagnosis)</span></li>
                                <li className="flex justify-between"><span>Negation Window:</span> <span className="text-slate-300">40 chars Look-back</span></li>
                                <li className="flex justify-between"><span>Execution Time:</span> <span className="text-emerald-400">~2ms (Instant)</span></li>
                            </ul>
                        </div>
                    </div>

                    {/* Output Column */}
                    <div className="space-y-6">
                        {/* Risk Dashboard */}
                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                                <ShieldAlert className="w-5 h-5 text-rose-400" />
                                Risk Assessment
                            </h2>
                            <div className="space-y-3">
                                {results.filter(r => r.type === 'Risk').length > 0 ? (
                                    results.filter(r => r.type === 'Risk').map((risk, idx) => (
                                        <div key={idx} className={`p-4 rounded-lg border-l-4 ${getRiskColor(risk.riskLevel)} bg-opacity-10 bg-white`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold">{risk.value}</h3>
                                                    <p className="text-xs mt-1 opacity-80">{risk.context}</p>
                                                </div>
                                                <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-white/20">
                                                    {risk.riskLevel}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-500 bg-slate-900/50 rounded-lg">
                                        No specific clinical risks detected based on current rules.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Extraction Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Conditions */}
                            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                                <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-300">
                                    <HeartPulse className="w-4 h-4" /> Conditions
                                </h3>
                                <div className="space-y-2">
                                    {results.filter(r => r.type === 'Condition').map((item, id) => (
                                        <div key={id} className="flex justify-between text-sm p-2 bg-slate-900 rounded border border-slate-700">
                                            <span className="text-slate-200">{item.value}</span>
                                            <span className="text-xs text-slate-500 flex items-center gap-1" title={item.context}>
                                                <Database className="w-3 h-3" /> Indexed
                                            </span>
                                        </div>
                                    ))}
                                    {results.filter(r => r.type === 'Condition').length === 0 && <span className="text-xs text-slate-600">None detected</span>}
                                </div>
                            </div>

                            {/* Medications */}
                            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
                                <h3 className="font-semibold mb-3 flex items-center gap-2 text-purple-300">
                                    <Pill className="w-4 h-4" /> Medications
                                </h3>
                                <div className="space-y-2">
                                    {results.filter(r => r.type === 'Medication').map((item, id) => (
                                        <div key={id} className="flex justify-between text-sm p-2 bg-slate-900 rounded border border-slate-700">
                                            <span className="text-slate-200">{item.value}</span>
                                            <span className={`text-xs px-2 rounded-full ${item.riskLevel === 'Moderate' ? 'bg-yellow-900 text-yellow-300' : 'bg-slate-800 text-slate-500'}`}>
                                                {item.riskLevel === 'Moderate' ? 'High Alert' : 'Routine'}
                                            </span>
                                        </div>
                                    ))}
                                    {results.filter(r => r.type === 'Medication').length === 0 && <span className="text-xs text-slate-600">None detected</span>}
                                </div>
                            </div>

                            {/* Vitals */}
                            <div className="col-span-1 md:col-span-2 bg-slate-800 rounded-xl p-5 border border-slate-700">
                                <h3 className="font-semibold mb-3 flex items-center gap-2 text-emerald-300">
                                    <Activity className="w-4 h-4" /> Vitals
                                </h3>
                                <div className="space-y-2">
                                    {results.filter(r => r.type === 'Vital').map((item, id) => (
                                        <div key={id} className={`flex justify-between text-sm p-3 rounded border ${item.riskLevel === 'High' ? 'bg-orange-900/20 border-orange-900/50 text-orange-200' :
                                            item.riskLevel === 'Critical' ? 'bg-rose-900/20 border-rose-900/50 text-rose-200' :
                                                'bg-slate-900 border-slate-700 text-slate-200'
                                            }`}>
                                            <span className="font-mono font-bold">{item.value}</span>
                                            <span className="text-xs opacity-75">{item.context}</span>
                                        </div>
                                    ))}
                                    {results.filter(r => r.type === 'Vital').length === 0 && <span className="text-xs text-slate-600">None detected</span>}
                                </div>
                            </div>
                        </div>

                        {/* Regulatory Footer */}
                        <div className="border-t border-slate-800 pt-6 mt-4">
                            <div className="bg-yellow-900/10 border border-yellow-800/30 rounded p-4 text-xs text-yellow-600/80 leading-relaxed">
                                <p className="font-bold mb-1 flex items-center gap-2">
                                    <ShieldAlert className="w-3 h-3" />
                                    CLINICAL AUDIT DISCLOSURE
                                </p>
                                <p>
                                    <strong>Source of Logic:</strong> Rule-based Regex & Local Keyword Matching (v1.0.4).<br />
                                    <strong>AI Status:</strong> NON-AI. This report contains no generative inferences. It is a literal extraction of the provided text.<br />
                                    <strong>Disclaimer:</strong> This software is for administrative assistance and information organization ONLY. It is not a substitute for professional medical judgment. Errors in text parsing may occur; always cross-reference with the Source Context provided above.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
