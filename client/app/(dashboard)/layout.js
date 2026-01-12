'use client';

import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardLayout({ children }) {
    return (
        <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-950">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-8 relative">
                    {/* Subtle background glow */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>
                    <div className="relative z-10">
                        {children}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
