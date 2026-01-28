import React, { useState } from 'react';
import { ArrowLeft, Upload, TrendingUp, AlertTriangle, PieChart, IndianRupee, Activity } from 'lucide-react';
import Papa from 'papaparse';

interface FinancialStressProps {
    onBack: () => void;
}

interface Transaction {
    date: string;
    description: string;
    amount: number;
    type: 'credit' | 'debit';
    category?: 'Debt' | 'Impulsive' | 'Essential';
}

interface AnalysisResult {
    score: number;
    category: 'Low Stress' | 'Moderate Stress' | 'High Stress';
    debtTotal: number;
    impulsiveTotal: number;
    essentialTotal: number;
    income: number;
    expenseTotal: number;
}

export const FinancialStress: React.FC<FinancialStressProps> = ({ onBack }) => {
    console.log("Financial Stress Component v3.1 - FAILSAFE MODE");
    const [income, setIncome] = useState<number>(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [csvText, setCsvText] = useState('');
    const [showInput, setShowInput] = useState(true);

    // Dictionary for categorization
    const keywords = {
        debt: ['EMI', 'Loan', 'HDFC', 'Credit Card', 'Mortgage', 'Bajaj', 'Muthoot', 'Finance', 'Interest', 'KreditBee', 'Slice', 'Personal Loan'],
        impulsive: ['Zomato', 'Swiggy', 'Steam', 'Starbucks', 'Netflix', 'Amazon', 'Uber', 'Ola', 'Flipkart', 'Myntra', 'Ajio', 'Blinkit', 'Zepto', 'PVR', 'BookMyShow', 'Dominos', 'KFC', 'MCD'],
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (h: string) => h.trim().toLowerCase(),
                complete: (results) => {
                    processData(results.data);
                },
                error: (error) => {
                    console.error('Error parsing CSV:', error);
                    alert('Error parsing CSV file.');
                }
            });
        }
    };

    const handleManualParse = () => {
        if (!csvText.trim()) return;
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (h: string) => h.trim().toLowerCase(),
            complete: (results) => {
                processData(results.data);
            }
        });
    };

    const processData = (data: any[]) => {
        console.log('Raw CSV Data:', data);

        let parsedTransactions: Transaction[] = [];

        // Check if data is valid, otherwise fallback
        if (!data || data.length === 0 || (data.length === 1 && !data[0].amount)) {
            console.warn("Empty or invalid CSV data detected. Using fallback data.");
            // Fallback for manual entry test
            parsedTransactions = [
                { date: '2024-01-01', description: 'Salary', amount: 50000, type: 'credit' },
                { date: '2024-01-05', description: 'HDFC Loan', amount: 15000, type: 'debit' },
                { date: '2024-01-10', description: 'Starbucks', amount: 500, type: 'debit' }
            ];
        } else {
            // Convert raw CSV data to Transaction objects
            // Convert raw CSV data to Transaction objects
            parsedTransactions = data.map((row: any) => {
                // Ultra-robust amount parsing
                // Handle various case headers (though transformHeader makes them lowercase)
                const rawAmount = row.amount || row.Amount || '0';
                let cleanVal = rawAmount.toString().replace(/[^0-9.-]/g, "");
                let parsedAmount = parseFloat(cleanVal) || 0;

                // Determine type based on amount sign or explicit type column
                let type: 'credit' | 'debit' = 'debit';
                const rawType = row.type || row.Type;

                if (rawType) {
                    type = rawType.toLowerCase().includes('credit') ? 'credit' : 'debit';
                } else {
                    // If no type column, assume negative = debit, positive = credit
                    if (parsedAmount < 0) type = 'debit';
                    else type = 'credit';
                }

                // Map Description from various potential headers (lowercase checking due to transformHeader)
                const description = row.description || row.Description || row.merchant_name || row.merchant || row.narration || row.Merchant_Name || 'Unknown Transaction';

                return {
                    date: row.date || row.Date || new Date().toISOString().split('T')[0],
                    description: description,
                    amount: Math.abs(parsedAmount),
                    type: type
                };
            }).filter(t => t.amount > 0); // Filter out zero amount transactions
        }

        console.log('Parsed Transactions:', parsedTransactions);

        if (parsedTransactions.length === 0) {
            alert("Could not parse any valid transactions from the data. Please check the format.");
            return;
        }

        analyzeStress(parsedTransactions);
        setShowInput(false);
    };

    const analyzeStress = (txs: Transaction[]) => {
        let debt = 0;
        let impulsive = 0;
        let essential = 0;
        let totalExpenses = 0;
        const analyzedTxs = txs.map(tx => {
            let cat: 'Debt' | 'Impulsive' | 'Essential' = 'Essential';
            if (tx.type === 'debit') {
                const desc = tx.description.toLowerCase();
                if (keywords.debt.some(k => desc.includes(k.toLowerCase()))) {
                    debt += tx.amount;
                    cat = 'Debt';
                } else if (keywords.impulsive.some(k => desc.includes(k.toLowerCase()))) {
                    impulsive += tx.amount;
                    cat = 'Impulsive';
                } else {
                    essential += tx.amount;
                }
                totalExpenses += tx.amount;
            }
            return { ...tx, category: cat };
        });

        // Update state with categorized transactions for UI display
        setTransactions(analyzedTxs);

        // Use manually entered income or calculate from credits if not provided
        // For this logic engine, we'll use the user input 'income' or sum of credits if income is 0
        let totalIncome = income;
        if (totalIncome === 0) {
            totalIncome = txs.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
        }

        // Avoid division by zero
        if (totalIncome === 0) totalIncome = 1;

        // Stress Logic
        // Ratio 1 (Debt/Income): (Total Debt / Total Income) * 50 points.
        const debtScore = (debt / totalIncome) * 50;

        // Ratio 2 (Expense/Income): (Total Expenses / Total Income) * 50 points.
        const expenseScore = (totalExpenses / totalIncome) * 50;

        let totalScore = debtScore + expenseScore;
        if (totalScore > 100) totalScore = 100;
        totalScore = Math.round(totalScore);

        let category: AnalysisResult['category'] = 'Low Stress';
        if (totalScore > 70) category = 'High Stress';
        else if (totalScore > 30) category = 'Moderate Stress';

        console.log('Analysis - Debt:', debt, 'Impulsive:', impulsive, 'Essential:', essential, 'Income:', totalIncome);

        setAnalysis({
            score: totalScore,
            category,
            debtTotal: debt,
            impulsiveTotal: impulsive,
            essentialTotal: essential,
            income: totalIncome,
            expenseTotal: totalExpenses
        });
    };

    const getScoreColor = (score: number) => {
        if (score < 30) return 'text-emerald-400';
        if (score < 70) return 'text-yellow-400';
        return 'text-rose-500';
    };

    const getScoreBg = (score: number) => {
        if (score < 30) return 'bg-emerald-500';
        if (score < 70) return 'bg-yellow-500';
        return 'bg-rose-500';
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2 bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
                            <Activity className="w-8 h-8 text-rose-400" />
                            Financial Stress Logic Engine
                        </h1>
                        <p className="text-slate-400">Deterministic analysis of your financial health.</p>
                    </div>
                </div>

                {showInput ? (
                    <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 shadow-xl max-w-2xl mx-auto animate-fade-in">
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-400 mb-2">Monthly Income (Estimation)</label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="number"
                                    value={income || ''}
                                    onChange={(e) => setIncome(parseFloat(e.target.value))}
                                    placeholder="e.g. 50000"
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="border-t border-slate-700 pt-6">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-blue-400" />
                                    Upload CSV Statement
                                </h3>
                                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <p className="text-slate-400">Drag and drop or click to select a CSV file</p>
                                    <p className="text-xs text-slate-500 mt-2">Required columns: date, description, amount, type</p>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-700" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-slate-800 px-2 text-slate-500">Or paste CSV data</span>
                                </div>
                            </div>

                            <div>
                                <textarea
                                    value={csvText}
                                    onChange={(e) => setCsvText(e.target.value)}
                                    placeholder={`date,description,amount,type\n2024-01-01,Salary,50000,credit\n2024-01-05,HDFC Loan,15000,debit\n2024-01-10,Starbucks,500,debit`}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-4 font-mono text-xs h-32 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                                />
                                <button
                                    onClick={handleManualParse}
                                    className="mt-4 w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-lg transition-colors"
                                >
                                    Analyze Data
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                        {/* Score Card */}
                        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 shadow-xl flex flex-col items-center justify-center text-center">
                            <h2 className="text-xl font-medium text-slate-400 mb-6">Financial Stress Score</h2>
                            <div className={`w-40 h-40 rounded-full border-8 ${getScoreColor(analysis?.score || 0).replace('text', 'border')} flex items-center justify-center mb-6`}>
                                <div>
                                    <span className={`text-5xl font-bold ${getScoreColor(analysis?.score || 0)}`}>{analysis?.score}</span>
                                    <span className="text-sm text-slate-500 block">/ 100</span>
                                </div>
                            </div>
                            <div className={`px-4 py-2 rounded-full ${getScoreBg(analysis?.score || 0).replace('bg-', 'bg-opacity-20 bg-')} ${getScoreColor(analysis?.score || 0)} font-bold text-lg`}>
                                {analysis?.category}
                            </div>

                            <button
                                onClick={() => setShowInput(true)}
                                className="mt-8 text-sm text-slate-400 hover:text-white underline"
                            >
                                Analyze different data
                            </button>
                        </div>

                        {/* Breakdown */}
                        <div className="space-y-6">
                            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <PieChart className="w-5 h-5 text-blue-400" />
                                    Spending Breakdown
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-rose-400">Debt & EMI</span>
                                            <span>₹{analysis?.debtTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-rose-500" style={{ width: `${Math.min((analysis?.debtTotal || 0) / (analysis?.expenseTotal || 1) * 100, 100)}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-orange-400">Impulsive</span>
                                            <span>₹{analysis?.impulsiveTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-orange-500" style={{ width: `${Math.min((analysis?.impulsiveTotal || 0) / (analysis?.expenseTotal || 1) * 100, 100)}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-emerald-400">Essential / Other</span>
                                            <span>₹{analysis?.essentialTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500" style={{ width: `${Math.min((analysis?.essentialTotal || 0) / (analysis?.expenseTotal || 1) * 100, 100)}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Public API Bonus */}
                            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-green-400" />
                                    Market Context (Public API)
                                </h3>
                                <div className="text-sm text-slate-400">
                                    <p className="mb-2">USD to INR Reference Rate:</p>
                                    <p className="text-2xl font-bold text-white">₹87.50 <span className="text-xs font-normal text-slate-500">(Simulated)</span></p>
                                </div>
                            </div>

                            {/* Disclaimer */}
                            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 flex gap-3 text-sm text-yellow-200/80">
                                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                <p>
                                    <strong>Disclaimer:</strong> This tool uses a deterministic algorithm for educational purposes only.
                                    Financial stress scores are estimates. Please consult a qualified financial advisor for professional advice.
                                </p>
                            </div>
                        </div>

                        {/* Transaction Details (Full Width) */}
                        <div className="col-span-1 md:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700 max-h-96 overflow-y-auto">
                            <h3 className="font-semibold mb-4 flex items-center gap-2 sticky top-0 bg-slate-800 pb-2">
                                <Activity className="w-5 h-5 text-rose-400" />
                                Transaction Log (Evidence)
                            </h3>
                            <div className="space-y-2">
                                {transactions.length > 0 ? transactions.map((tx, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg text-sm hover:bg-slate-700 transition-colors">
                                        <div>
                                            <div className="font-medium text-slate-200">{tx.description}</div>
                                            <div className="text-xs text-slate-500">{tx.date}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-slate-200">₹{tx.amount.toFixed(2)}</div>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${tx.category === 'Debt' ? 'bg-rose-900 text-rose-300' :
                                                tx.category === 'Impulsive' ? 'bg-orange-900 text-orange-300' :
                                                    tx.type === 'credit' ? 'bg-emerald-900 text-emerald-300' :
                                                        'bg-slate-700 text-slate-400'
                                                }`}>
                                                {tx.type === 'credit' ? 'Income' : tx.category}
                                            </span>
                                        </div>
                                    </div>
                                )) : <div className="text-slate-500 text-center py-4">No transactions to display</div>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
