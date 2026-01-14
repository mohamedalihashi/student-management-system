'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { User, Mail, Phone, MapPin, Calendar, Hash, BookOpen, School, Loader2 } from 'lucide-react';

export default function StudentProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/students/me');
                setProfile(res.data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-400">Profile not found.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
                <p className="text-gray-400">View your personal and academic information.</p>
            </div>

            {/* Header Card */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 rounded-full bg-blue-500/20 flex items-center justify-center border-4 border-blue-500/30">
                    <User className="w-16 h-16 text-blue-400" />
                </div>
                <div className="text-center md:text-left">
                    <h2 className="text-3xl font-bold text-white mb-2">{profile.name}</h2>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm font-medium">
                            Student
                        </span>
                        <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-sm font-medium">
                            Grade {profile.class?.grade} - {profile.class?.section}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Academic Info */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-6">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-400" />
                        Academic Details
                    </h3>
                    <div className="space-y-4">
                        <InfoRow
                            icon={Hash}
                            label="Admission Number"
                            value={profile.admissionNumber || 'N/A'}
                        />
                        <InfoRow
                            icon={School}
                            label="Roll Number"
                            value={profile.rollNumber}
                        />
                        <InfoRow
                            icon={Calendar}
                            label="Date of Birth"
                            value={new Date(profile.dob).toLocaleDateString()}
                        />
                    </div>
                </div>

                {/* Contact Info */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-6">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-green-400" />
                        Personal Info
                    </h3>
                    <div className="space-y-4">
                        <InfoRow
                            icon={Mail}
                            label="Email"
                            value={profile.user?.email}
                        />
                        <InfoRow
                            icon={Phone}
                            label="Phone"
                            value={profile.phone || 'N/A'}
                        />
                        <InfoRow
                            icon={User}
                            label="Gender"
                            value={profile.gender}
                        />
                        <InfoRow
                            icon={MapPin}
                            label="Address"
                            value={profile.address}
                        />
                    </div>
                </div>

                {/* Parent Info */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-6 md:col-span-2">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                        <UsersIcon className="w-5 h-5 text-orange-400" />
                        Parent / Guardian
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoRow
                            icon={User}
                            label="Parent Name"
                            value={profile.parentName}
                        />
                        <InfoRow
                            icon={Phone}
                            label="Parent Phone"
                            value={profile.parentPhone}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="w-10 h-10 rounded-lg bg-gray-800/50 flex items-center justify-center">
                <Icon className="w-5 h-5 text-gray-400" />
            </div>
            <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
                <p className="text-white font-medium">{value}</p>
            </div>
        </div>
    );
}

function UsersIcon({ className }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}
