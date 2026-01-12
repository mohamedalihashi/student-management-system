'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import {
    CreditCard,
    DollarSign,
    Calendar,
    Clock,
    CheckCircle,
    Loader2,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function StudentFees() {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const studentRes = await api.get('/students/me');
            const feeRes = await api.get(`/fees/student/${studentRes.data._id}`);
            setFees(feeRes.data);
        } catch (error) {
            console.error('Error fetching fees:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    const totalPaid = fees.filter(f => f.status === 'Paid').reduce((acc, f) => acc + f.amount, 0);
    const totalPending = fees.filter(f => f.status === 'Unpaid').reduce((acc, f) => acc + f.amount, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">My Fee Status</h1>
                <p className="text-gray-400">Track your tuition fees and payment history.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 rounded-2xl bg-gradient-to-br from-green-600/20 to-emerald-600/5 border border-green-500/20 backdrop-blur-xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <ShieldCheck className="text-green-500 w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Total Paid</h3>
                    </div>
                    <p className="text-4xl font-bold text-white">${totalPaid.toLocaleString()}</p>
                </div>
                <div className="p-8 rounded-2xl bg-gradient-to-br from-orange-600/20 to-amber-600/5 border border-orange-500/20 backdrop-blur-xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <AlertCircle className="text-orange-500 w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">Total Pending</h3>
                    </div>
                    <p className="text-4xl font-bold text-white">${totalPending.toLocaleString()}</p>
                </div>
            </div>

            {/* Fee History */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">Payment History</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/[0.02]">
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Description</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Amount</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Due Date</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Payment Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                            {fees.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No fee records found.
                                    </td>
                                </tr>
                            ) : (
                                fees.map((f) => (
                                    <tr key={f._id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-white">{f.description}</p>
                                            <p className="text-xs text-gray-500">ID: {f._id.slice(-6).toUpperCase()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-white">${f.amount}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-400">{new Date(f.dueDate).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                                                f.status === 'Paid'
                                                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                                                    : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                            )}>
                                                {f.status === 'Paid' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                {f.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-400">
                                                {f.paymentDate ? new Date(f.paymentDate).toLocaleDateString() : '—'}
                                            </p>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
