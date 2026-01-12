'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/utils/api';
import {
    CreditCard,
    Plus,
    Search,
    Trash2,
    User,
    Loader2,
    CheckCircle,
    Clock,
    DollarSign,
    Calendar,
    ArrowUpRight,
    Printer,
    Receipt,
    FileText,
    History,
    CheckCircle2,
    AlertCircle,
    X
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function FeeManagement() {
    const [fees, setFees] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showPrintView, setShowPrintView] = useState(false); // 'bono' or 'bill'
    const [selectedFee, setSelectedFee] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const [formData, setFormData] = useState({
        studentId: '',
        description: '',
        amount: '',
        dueDate: ''
    });

    const [paymentData, setPaymentData] = useState({
        amount: '',
        paymentMethod: 'Cash',
        note: ''
    });

    const printRef = useRef();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [feeRes, studentRes] = await Promise.all([
                api.get('/fees'),
                api.get('/students')
            ]);
            setFees(feeRes.data);
            setStudents(studentRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/fees', formData);
            setShowModal(false);
            setFormData({ studentId: '', description: '', amount: '', dueDate: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Something went wrong');
        }
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/fees/${selectedFee._id}/pay`, paymentData);
            setShowPaymentModal(false);
            setPaymentData({ amount: '', paymentMethod: 'Cash', note: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error recording payment');
        }
    };

    const handleGenerateMonthly = async () => {
        if (!window.confirm('Generate monthly fees for all active students?')) return;
        try {
            setIsGenerating(true);
            const res = await api.post('/fees/generate-monthly');
            alert(res.data.message);
            fetchData();
        } catch (error) {
            alert('Error generating fees');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this fee record?')) {
            try {
                await api.delete(`/fees/${id}`);
                fetchData();
            } catch (error) {
                alert('Error deleting fee');
            }
        }
    };

    const handlePrint = () => {
        const content = printRef.current;
        const pri = window.open('', 'Print', 'height=600,width=800');
        pri.document.write('<html><head><title>Print Report</title>');
        // Add basic tailwind-like styles for print
        pri.document.write('<style>body{font-family:sans-serif;padding:40px;} .bill-container{border:2px solid #eee;padding:20px;max-width:800px;margin:auto;} .header{text-align:center;margin-bottom:30px;} .row{display:flex;justify-content:between;margin-bottom:10px;} .footer{margin-top:50px;text-align:center;font-size:12px;color:#666;}</style>');
        pri.document.write('</head><body>');
        pri.document.write(content.innerHTML);
        pri.document.write('</body></html>');
        pri.document.close();
        pri.focus();
        pri.print();
        pri.close();
    };

    const filteredFees = fees.filter(fee =>
        fee.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        totalRevenue: fees.reduce((acc, f) => acc + (f.amountPaid || 0), 0),
        pendingAmount: fees.reduce((acc, f) => acc + (f.balance || 0), 0),
        totalInvoiced: fees.reduce((acc, f) => acc + f.amount, 0)
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Financial Management</h1>
                    <p className="text-gray-400">Track tuition, payments, and balances (Bono & Reysto).</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleGenerateMonthly}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600/10 hover:bg-purple-600 text-purple-400 hover:text-white rounded-xl font-medium transition-all border border-purple-500/20 disabled:opacity-50"
                    >
                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
                        Generate Monthly Bills
                    </button>
                    <button
                        onClick={() => {
                            setFormData({ studentId: '', description: '', amount: '', dueDate: '' });
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20"
                    >
                        <Plus className="w-5 h-5" />
                        One-Time Fee
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Collected (Cash In)', val: stats.totalRevenue, color: 'green', icon: CheckCircle2 },
                    { label: 'Remaining (Reysto)', val: stats.pendingAmount, color: 'orange', icon: Clock },
                    { label: 'Total Invoiced', val: stats.totalInvoiced, color: 'blue', icon: FileText }
                ].map((s, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl group hover:border-blue-500/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", `bg-${s.color}-500/10`)}>
                                <s.icon className={cn("w-6 h-6", `text-${s.color}-500`)} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">{s.label}</p>
                                <p className="text-2xl font-bold text-white">${s.val.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search and List */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search by student name, roll number, or invoice description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all outline-none"
                />
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/[0.02]">
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Student</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Fee Details</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400 text-center">Invoiced</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400 text-center">Paid</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400 text-center text-orange-400">Balance</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                                        Fetching financial records...
                                    </td>
                                </tr>
                            ) : filteredFees.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No fee records found for the given search.
                                    </td>
                                </tr>
                            ) : (
                                filteredFees.map((f) => (
                                    <tr key={f._id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4 border-r border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600/20 to-purple-600/20 flex items-center justify-center text-blue-400 font-bold border border-white/5">
                                                    {f.student?.name?.[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white leading-none mb-1">{f.student?.name}</p>
                                                    <p className="text-[10px] text-gray-500 tracking-wider">ID: {f.student?.rollNumber}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <p className="text-sm text-gray-300 font-medium">{f.description}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Calendar className="w-3 h-3 text-gray-500" />
                                                <p className="text-[10px] text-gray-500">Due: {new Date(f.dueDate).toLocaleDateString()}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-medium text-white">${f.amount}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-medium text-green-400">${f.amountPaid || 0}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center bg-orange-400/5">
                                            <span className="text-sm font-bold text-orange-400">${f.balance ?? f.amount}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                                                f.status === 'Paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    f.status === 'Partial' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                            )}>
                                                {f.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {f.status !== 'Paid' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedFee(f);
                                                            setPaymentData({ amount: f.balance, paymentMethod: 'Cash', note: '' });
                                                            setShowPaymentModal(true);
                                                        }}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-lg shadow-blue-600/10"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                        Pay
                                                    </button>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        title="Print Invoice (Bill)"
                                                        onClick={() => {
                                                            setSelectedFee(f);
                                                            setShowPrintView('bill');
                                                        }}
                                                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                                                    >
                                                        <Printer className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        title="Payment History"
                                                        onClick={() => {
                                                            setSelectedFee(f);
                                                            setShowPrintView('history');
                                                        }}
                                                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                                                    >
                                                        <History className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(f._id)}
                                                        className="p-2 hover:bg-red-400/10 rounded-lg text-gray-400 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedFee && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-[2rem] p-8 shadow-2xl relative">
                        <button onClick={() => setShowPaymentModal(false)} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Record Payment</h2>
                            <p className="text-sm text-gray-400">Recording for: <span className="text-blue-400 font-semibold">{selectedFee.student?.name}</span></p>
                        </div>

                        <form onSubmit={handleRecordPayment} className="space-y-6">
                            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-blue-400/60 uppercase font-bold tracking-widest">Total Remaining</span>
                                    <span className="text-2xl font-black text-white">${selectedFee.balance ?? selectedFee.amount}</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${(selectedFee.amountPaid / selectedFee.amount) * 100}%` }}></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Payment Amount ($)</label>
                                <input
                                    type="number"
                                    required
                                    value={paymentData.amount}
                                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-green-500/50 outline-none"
                                    placeholder="Enter amount..."
                                    max={selectedFee.balance ?? selectedFee.amount}
                                    min="1"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Payment Method</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Cash', 'Bank Transfer', 'Card', 'Online'].map(m => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => setPaymentData({ ...paymentData, paymentMethod: m })}
                                            className={cn(
                                                "py-3 rounded-xl text-xs font-bold transition-all border",
                                                paymentData.paymentMethod === m
                                                    ? "bg-blue-600 border-blue-500 text-white shadow-lg"
                                                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                            )}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Note (Optional)</label>
                                <input
                                    type="text"
                                    value={paymentData.note}
                                    onChange={(e) => setPaymentData({ ...paymentData, note: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 outline-none"
                                    placeholder="e.g. Paid via Parent"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full px-6 py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-green-600/20 mt-4"
                            >
                                Confirm Payment
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Print Preview Modal */}
            {showPrintView && selectedFee && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in zoom-in duration-300">
                    <div className="w-full max-w-4xl bg-white rounded-[2rem] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
                        <div className="p-6 bg-gray-50 border-b flex justify-between items-center sticky top-0">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Document Preview</h3>
                                <p className="text-xs text-gray-500">Document ID: {selectedFee._id}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30">
                                    <Printer className="w-4 h-4" />
                                    Print Now
                                </button>
                                <button onClick={() => setShowPrintView(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-gray-200/50 p-12">
                            <div ref={printRef} className="bg-white p-12 shadow-sm min-h-[1000px] max-w-[800px] mx-auto text-gray-900 border">
                                {showPrintView === 'bill' && (
                                    <div className="space-y-12">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h1 className="text-4xl font-black text-blue-600 tracking-tighter mb-2">SCHOOL LOGO</h1>
                                                <p className="text-sm text-gray-500">Modern School Management System</p>
                                                <p className="text-xs text-gray-400">Contact: +1 234 567 890 | support@school.com</p>
                                            </div>
                                            <div className="text-right">
                                                <h2 className="text-2xl font-bold grayscale opacity-50 uppercase tracking-widest">Fee Invoice</h2>
                                                <p className="text-sm font-bold mt-2">NO: INV-{selectedFee._id.slice(-6).toUpperCase()}</p>
                                                <p className="text-xs text-gray-500">Date: {new Date().toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-12 py-8 border-y border-gray-100">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Bill To (Ardayga):</p>
                                                <p className="text-xl font-black">{selectedFee.student?.name}</p>
                                                <p className="text-sm text-gray-600 mt-1">Roll Number: {selectedFee.student?.rollNumber}</p>
                                                <p className="text-sm text-gray-600">Class: Grade {selectedFee.student?.class?.grade} - {selectedFee.student?.class?.section}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">Invoice Details:</p>
                                                <p className="text-sm font-medium">Description: {selectedFee.description}</p>
                                                <p className="text-sm font-medium">Due Date: {new Date(selectedFee.dueDate).toLocaleDateString()}</p>
                                                <p className="text-sm font-medium">Status: {selectedFee.status}</p>
                                            </div>
                                        </div>

                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b-2 border-gray-900">
                                                    <th className="py-4 font-bold text-sm uppercase">Description</th>
                                                    <th className="py-4 font-bold text-sm uppercase text-right">Invoiced Amount</th>
                                                    <th className="py-4 font-bold text-sm uppercase text-right">Paid Amount</th>
                                                    <th className="py-4 font-bold text-sm uppercase text-right">Balance (Hadhaan)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                <tr>
                                                    <td className="py-6 text-sm font-medium">{selectedFee.description}</td>
                                                    <td className="py-6 text-sm font-bold text-right">${selectedFee.amount}</td>
                                                    <td className="py-6 text-sm font-bold text-right text-green-600">${selectedFee.amountPaid || 0}</td>
                                                    <td className="py-6 text-sm font-black text-right text-orange-600">${selectedFee.balance ?? selectedFee.amount}</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        <div className="flex justify-end pt-12">
                                            <div className="w-64 space-y-4">
                                                <div className="flex justify-between items-center text-sm border-b pb-2">
                                                    <span className="text-gray-500 uppercase font-medium">Subtotal</span>
                                                    <span className="font-bold">${selectedFee.amount}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm border-b pb-2">
                                                    <span className="text-gray-500 uppercase font-medium">Total Paid</span>
                                                    <span className="font-bold text-green-600">-${selectedFee.amountPaid || 0}</span>
                                                </div>
                                                <div className="flex justify-between items-center p-4 bg-gray-900 text-white rounded-xl">
                                                    <span className="text-xs uppercase font-bold">Total Due</span>
                                                    <span className="text-xl font-black">${selectedFee.balance ?? selectedFee.amount}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-12 pt-24">
                                            <div className="border-t border-gray-300 pt-4 text-center">
                                                <p className="text-xs font-bold text-gray-400 uppercase">Cashier Signature</p>
                                            </div>
                                            <div className="border-t border-gray-300 pt-4 text-center">
                                                <p className="text-xs font-bold text-gray-400 uppercase">Guardian Signature</p>
                                            </div>
                                        </div>

                                        <div className="text-center text-[10px] text-gray-400 pt-12 uppercase tracking-[5px]">
                                            Thank you for your timely payment
                                        </div>
                                    </div>
                                )}

                                {showPrintView === 'history' && (
                                    <div className="space-y-12">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h1 className="text-3xl font-black text-blue-600 tracking-tighter mb-2">PAYMENT RECEIPT (BONO)</h1>
                                                <p className="text-sm text-gray-500">Student: {selectedFee.student?.name}</p>
                                                <p className="text-xs text-gray-400">Invoice: {selectedFee.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center justify-end gap-2 mb-2">
                                                    <Receipt className="w-6 h-6 text-gray-300" />
                                                </div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest leading-none">History Report</p>
                                            </div>
                                        </div>

                                        <div className="bg-blue-600 text-white p-8 rounded-3xl flex justify-between items-center">
                                            <div>
                                                <p className="text-xs font-bold uppercase opacity-80 mb-1">Total Paid So Far</p>
                                                <p className="text-4xl font-black">${selectedFee.amountPaid || 0}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold uppercase opacity-80 mb-1">Total Invoiced</p>
                                                <p className="text-2xl font-black">${selectedFee.amount}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-sm font-black uppercase tracking-widest border-b-2 border-gray-900 pb-2">Transactions History</h3>
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-gray-50">
                                                        <th className="py-3 px-4 text-[10px] font-bold uppercase">Date</th>
                                                        <th className="py-3 px-4 text-[10px] font-bold uppercase">Method</th>
                                                        <th className="py-3 px-4 text-[10px] font-bold uppercase">Note</th>
                                                        <th className="py-3 px-4 text-[10px] font-bold uppercase text-right">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {selectedFee.paymentHistory?.length > 0 ? (
                                                        selectedFee.paymentHistory.map((h, i) => (
                                                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                                <td className="py-4 px-4 text-sm font-medium">{new Date(h.date).toLocaleDateString()}</td>
                                                                <td className="py-4 px-4 text-xs">{h.method}</td>
                                                                <td className="py-4 px-4 text-xs italic text-gray-500">{h.note || '-'}</td>
                                                                <td className="py-4 px-4 text-sm font-black text-right text-blue-600 font-mono tracking-tighter cursor-pointer" onClick={() => {
                                                                    setSelectedPayment(h);
                                                                    alert(`Printing specific bono for payment of $${h.amount}...`);
                                                                }}>${h.amount}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="4" className="py-12 text-center text-sm text-gray-400">No payment transactions recorded yet.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex justify-between items-center">
                                            <div>
                                                <p className="text-xs font-bold uppercase text-orange-400 leading-none mb-1">Remaining Balance (Hadhaan)</p>
                                                <p className="text-2xl font-black text-orange-600">${selectedFee.balance ?? selectedFee.amount}</p>
                                            </div>
                                            <AlertCircle className="w-8 h-8 text-orange-200" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Existing Assignment Modal (Modified for better UI) */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-black text-white tracking-tight">Assign Fee</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-500"><X /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Select Student</label>
                                <select
                                    required
                                    value={formData.studentId}
                                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none"
                                >
                                    <option value="">Select a student...</option>
                                    {students.map(s => (
                                        <option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Fee Description</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 outline-none"
                                    placeholder="e.g. Uniform Fee, Transport..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Amount ($)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 outline-none font-bold"
                                        placeholder="100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Due Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-600/20"
                            >
                                Confirm Assignment
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
