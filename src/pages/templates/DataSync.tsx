import React, { useState } from 'react';
import { Plus, Trash2, Printer, Moon, Sun, Save, ArrowLeft } from 'lucide-react';

interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
}

interface InvoiceProps {
    onBack: () => void;
    templateId?: string; // Kept for compatibility
}

export const DataSync: React.FC<InvoiceProps> = ({ onBack }) => {
    const [items, setItems] = useState<InvoiceItem[]>([
        { id: '1', description: 'Web Development Service', quantity: 1, rate: 500, amount: 500 }
    ]);
    const [discountPercent, setDiscountPercent] = useState(0);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [invoiceNumber, setInvoiceNumber] = useState('INV-001');
    const [customerName, setCustomerName] = useState('John Doe');
    const [businessName, setBusinessName] = useState('MyBusiness Inc.');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [invoiceTime, setInvoiceTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));

    // Calculations
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxPercent = 18;
    const taxAmount = (subtotal * taxPercent) / 100;
    const discountAmount = (subtotal * discountPercent) / 100;
    const grandTotal = subtotal + taxAmount - discountAmount;

    // Add Item
    const addItem = () => {
        const newItem: InvoiceItem = {
            id: Date.now().toString(),
            description: 'New Item',
            quantity: 1,
            rate: 0,
            amount: 0
        };
        setItems([...items, newItem]);
    };

    // Delete Item
    const deleteItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    // Update Item
    const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                if (field === 'quantity' || field === 'rate') {
                    updatedItem.amount = Number(updatedItem.quantity) * Number(updatedItem.rate);
                }
                return updatedItem;
            }
            return item;
        }));
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'} p-4 md:p-8 print:bg-white print:text-black`}>
            {/* Header Toolbar (Hidden when printing) */}
            <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between mb-8 print:hidden">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-700/50 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Invoice Generator
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                        {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg"
                    >
                        <Printer className="w-4 h-4" /> Print PDF
                    </button>
                </div>
            </div>

            {/* Invoice Paper */}
            <div className={`max-w-4xl mx-auto rounded-xl shadow-2xl p-8 print:shadow-none print:p-0 transition-colors ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>

                {/* Invoice Header */}
                <div className="flex justify-between items-start mb-12 border-b border-gray-700/50 pb-8">
                    <div>
                        <h2 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>INVOICE</h2>
                        <div className="flex flex-col gap-2 mt-4">
                            <label className="text-sm text-gray-400 uppercase tracking-wider">Invoice #</label>
                            <input
                                type="text"
                                value={invoiceNumber}
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                className={`bg-transparent border-b ${isDarkMode ? 'border-gray-700 focus:border-cyan-400' : 'border-gray-300 focus:border-blue-500'} focus:outline-none p-1 w-32`}
                            />
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="mb-4 flex flex-col items-end">
                            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mb-2">
                                <Save className="w-6 h-6 text-white" />
                            </div>
                            <input
                                type="text"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                className={`text-xl font-bold bg-transparent text-right border-b ${isDarkMode ? 'border-gray-700 focus:border-cyan-400' : 'border-gray-300 focus:border-blue-500'} focus:outline-none p-1 w-full max-w-[250px]`}
                                placeholder="Your Business Name"
                            />
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                            <label className="text-sm text-gray-400 uppercase tracking-wider">Date & Time</label>
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={invoiceDate}
                                    onChange={(e) => setInvoiceDate(e.target.value)}
                                    className={`bg-transparent text-right border-b ${isDarkMode ? 'border-gray-700 focus:border-cyan-400' : 'border-gray-300 focus:border-blue-500'} focus:outline-none p-1`}
                                />
                                <input
                                    type="time"
                                    value={invoiceTime}
                                    onChange={(e) => setInvoiceTime(e.target.value)}
                                    className={`bg-transparent text-right border-b ${isDarkMode ? 'border-gray-700 focus:border-cyan-400' : 'border-gray-300 focus:border-blue-500'} focus:outline-none p-1`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Client Info */}
                <div className="mb-12">
                    <label className="text-sm text-gray-400 uppercase tracking-wider block mb-2">Bill To</label>
                    <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className={`text-2xl font-semibold bg-transparent border-b ${isDarkMode ? 'border-gray-700 focus:border-cyan-400' : 'border-gray-300 focus:border-blue-500'} focus:outline-none p-1 w-full max-w-md placeholder-gray-500`}
                        placeholder="Client Name / Company"
                    />
                </div>

                {/* Invoice Items Table */}
                <div className="mb-8">
                    <div className={`grid grid-cols-12 gap-4 pb-2 mb-4 border-b ${isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'} text-sm font-semibold uppercase tracking-wider`}>
                        <div className="col-span-5">Description</div>
                        <div className="col-span-2 text-center">Qty</div>
                        <div className="col-span-2 text-right">Price</div>
                        <div className="col-span-2 text-right">Amount</div>
                        <div className="col-span-1 print:hidden"></div>
                    </div>

                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="grid grid-cols-12 gap-4 items-center group relative">
                                <div className="col-span-5">
                                    <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                        className={`w-full bg-transparent p-2 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none ${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-100'}`}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value))}
                                        className={`w-full text-center bg-transparent p-2 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none ${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-100'}`}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        value={item.rate}
                                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value))}
                                        className={`w-full text-right bg-transparent p-2 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none ${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-100'}`}
                                    />
                                </div>
                                <div className="col-span-2 text-right font-medium p-2">
                                    ₹{item.amount.toFixed(2)}
                                </div>
                                <div className="col-span-1 text-center print:hidden opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => deleteItem(item.id)} className="text-red-500 hover:text-red-400 p-1">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={addItem}
                        className={`mt-4 flex items-center gap-2 text-sm font-medium transition-colors ${isDarkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-700'} print:hidden`}
                    >
                        <Plus className="w-4 h-4" /> Add Line Item
                    </button>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end border-t border-gray-700/50 pt-8">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-gray-400">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between items-center text-gray-400">
                            <span className="flex items-center gap-2">
                                Discount (%)
                                <input
                                    type="number"
                                    value={discountPercent}
                                    onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                                    className={`w-12 bg-transparent text-center border-b ${isDarkMode ? 'border-gray-700 focus:border-cyan-400' : 'border-gray-300 focus:border-blue-500'} focus:outline-none text-sm`}
                                />
                            </span>
                            <span className="text-red-400">-₹{discountAmount.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between text-gray-400">
                            <span>Tax (18%)</span>
                            <span>₹{taxAmount.toFixed(2)}</span>
                        </div>

                        <div className={`flex justify-between text-xl font-bold pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <span>Grand Total</span>
                            <span className="text-emerald-500">₹{grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="mt-12 pt-8 border-t border-gray-700/50 text-sm text-center text-gray-500 print:mt-auto">
                    <p>Thank you for your business!</p>
                    <p className="mt-2">Payment Terms: Net 30</p>
                </div>

            </div>
        </div>
    );
};
