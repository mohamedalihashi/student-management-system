'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    User,
    Users,
    BookOpen,
    Calendar,
    FileText,
    CreditCard,
    Settings,
    LogOut,
    GraduationCap,
    Sun,
    Moon
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/utils/cn';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();

    const menuItems = {
        admin: [
            { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
            { name: 'User Management', icon: Users, path: '/admin/users' },
            { name: 'Students', icon: GraduationCap, path: '/admin/students' },
            { name: 'Teachers', icon: Users, path: '/admin/teachers' },
            { name: 'Parents', icon: Users, path: '/admin/parents' },
            { name: 'Class Management', icon: BookOpen, path: '/admin/classes' },
            { name: 'Subject Management', icon: GraduationCap, path: '/admin/subjects' },
            { name: 'Attendance', icon: Calendar, path: '/admin/attendance' },
            { name: 'Exams', icon: FileText, path: '/admin/exams' },
            { name: 'Reports', icon: FileText, path: '/admin/reports' },
            { name: 'Fee Management', icon: CreditCard, path: '/admin/fees' },
        ],
        teacher: [
            { name: 'Dashboard', icon: LayoutDashboard, path: '/teacher' },
            { name: 'Attendance', icon: Calendar, path: '/teacher/attendance' },
            { name: 'Results Entry', icon: FileText, path: '/teacher/results' },
            { name: 'Exams', icon: FileText, path: '/teacher/exams' },
            { name: 'Subjects', icon: BookOpen, path: '/teacher/subjects' },
        ],
        student: [
            { name: 'Dashboard', icon: LayoutDashboard, path: '/student' },
            { name: 'My Profile', icon: User, path: '/student/profile' },
            { name: 'My Attendance', icon: Calendar, path: '/student/attendance' },
            { name: 'My Results', icon: FileText, path: '/student/results' },
            { name: 'Fee Status', icon: CreditCard, path: '/student/fees' },
        ],
        parent: [
            { name: 'Dashboard', icon: LayoutDashboard, path: '/parent' },
            { name: 'My Children', icon: Users, path: '/parent/children' },
        ]
    };

    const currentMenu = menuItems[user?.role] || [];

    return (
        <div className="w-64 min-h-screen bg-[var(--sidebar-bg)] border-r border-white/5 flex flex-col transition-colors duration-300">
            <div className="p-6">
                <div className="flex items-center gap-3 px-2 mb-8">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                        <GraduationCap className="text-white w-5 h-5" />
                    </div>
                    <span className="text-white font-bold text-xl">EduGate</span>
                </div>

                <nav className="space-y-1">
                    {currentMenu.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                                pathname === item.path
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5",
                                pathname === item.path ? "text-white" : "text-gray-500 group-hover:text-blue-400"
                            )} />
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-white/5 space-y-4">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold ring-2 ring-white/10">
                        {user?.email?.[0].toUpperCase() || 'U'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                </div>

                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all border border-white/5"
                >
                    <div className="flex items-center gap-3">
                        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                    </div>
                </button>

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
