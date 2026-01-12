'use client';

import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color }) => {
    const colors = {
        blue: "from-blue-600 to-blue-400 bg-blue-500/10 border-blue-500/20 text-blue-500",
        purple: "from-purple-600 to-purple-400 bg-purple-500/10 border-purple-500/20 text-purple-500",
        green: "from-emerald-600 to-emerald-400 bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
        orange: "from-orange-600 to-orange-400 bg-orange-500/10 border-orange-500/20 text-orange-500",
    };

    const colorClass = colors[color] || colors.blue;

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`p-6 rounded-2xl border ${colorClass.split(' ')[2]} ${colorClass.split(' ')[3]} backdrop-blur-xl transition-all relative overflow-hidden group`}
        >
            <div className="flex items-center justify-between relative z-10">
                <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-white">{value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${colorClass.split(' ').slice(0, 2).join(' ')} flex items-center justify-center text-white shadow-lg shadow-current/10`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>

            {/* Decorative background element */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-current opacity-5 blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
        </motion.div>
    );
};

export default StatCard;
