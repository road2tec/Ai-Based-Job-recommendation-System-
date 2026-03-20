import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { LayoutDashboard, Users, Briefcase, ShieldCheck, Globe, Activity, ArrowRight, UserPlus, FileCheck, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'

export default function AdminDashboard() {
    const [stats, setStats] = useState({ total_users: 0, total_jobs: 0, total_companies: 0, total_applications: 0, total_shortlisted: 0, recent_activity: [] })
    const userName = localStorage.getItem('userName') || "Admin"

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/admin/dashboard')
                setStats(res.data)
            } catch (err) { }
        }
        fetchStats()
    }, [])

    const data = [
        { name: 'People Joined', value: stats.total_users, color: '#00B074', icon: <Users /> },
        { name: 'Active Jobs', value: stats.total_jobs, color: '#3B82F6', icon: <Briefcase /> },
        { name: 'Shortlisted', value: stats.total_shortlisted, color: '#F59E0B', icon: <CheckCircle /> },
        { name: 'Apps Received', value: stats.total_applications, color: '#EF4444', icon: <FileCheck /> }
    ]

    return (
        <DashboardLayout role="admin" userName={userName}>
            <div className="flex flex-col gap-10">
                {/* Header Section */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">System <span className="text-[#00B074]">Control Center</span></h2>
                    <p className="text-gray-500 mt-2 text-lg font-bold">Monitor and manage all activities on the platform.</p>
                </motion.div>

                {/* Main Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {data.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:shadow-xl hover:border-[#00B074]/20 transition-all"
                        >
                            <div className="bg-gray-50 p-4 rounded-2xl w-fit group-hover:bg-white transition-colors shadow-sm text-gray-400 group-hover:text-[#00B074]">
                                {item.icon}
                            </div>
                            <div>
                                <h3 className="text-gray-400 font-black uppercase tracking-widest text-[10px] mb-1">{item.name}</h3>
                                <p className="text-4xl font-black tracking-tighter" style={{ color: item.color }}>{item.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Activity Graph */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-emerald-50 relative overflow-hidden group"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                    <Activity className="w-6 h-6 text-[#00B074]" />
                                    Platform Usage
                                </h2>
                                <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Real-time statistics</p>
                            </div>
                            <span className="bg-emerald-50 text-[#00B074] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest animate-pulse border border-emerald-100">Live</span>
                        </div>

                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: 'black', padding: '15px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Quick Access Sidebar Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col gap-6"
                    >
                        <div className="bg-[#2B3940] p-10 rounded-[3rem] text-white overflow-hidden relative group">
                            <ShieldCheck className="absolute -top-10 -right-10 w-40 h-40 text-white opacity-5 rotate-12" />
                            <h3 className="text-2xl font-black mb-4 relative z-10">Quick Settings</h3>
                            <div className="flex flex-col gap-4 relative z-10">
                                <Link to="/admin/applicants" className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all font-bold group/item">
                                    Review Applicants <ArrowRight size={20} className="text-gray-500 group-hover/item:translate-x-1 transition-transform" />
                                </Link>
                                <Link to="/admin/manage-users" className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all font-bold group/item">
                                    Manage People <ArrowRight size={20} className="text-gray-500 group-hover/item:translate-x-1 transition-transform" />
                                </Link>
                                <Link to="/admin/manage-jobs" className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all font-bold group/item">
                                    Manage Jobs <ArrowRight size={20} className="text-gray-500 group-hover/item:translate-x-1 transition-transform" />
                                </Link>
                                <button className="flex items-center justify-between p-4 bg-[#00B074] border border-[#00B074] rounded-2xl hover:bg-[#009663] transition-all font-black text-white group/item shadow-xl shadow-emerald-900/40">
                                    Add New Admin <UserPlus size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Recent Alerts (Mock) */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex flex-col gap-6 shadow-sm">
                            <h3 className="text-lg font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Activity size={18} className="text-[#00B074]" />
                                Recent Activity
                            </h3>
                            <div className="flex flex-col gap-4">
                                {stats.recent_activity && stats.recent_activity.length > 0 ? (
                                    stats.recent_activity.map((alert, i) => (
                                        <div key={i} className="flex items-center justify-between p-1 border-b border-gray-50 pb-3 last:border-0 last:pb-1">
                                            <p className="font-bold text-sm text-gray-700">{alert.title}</p>
                                            <span className="text-xs font-bold text-gray-400 whitespace-nowrap ml-4">{alert.time}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm font-bold text-gray-400 text-center py-4">No recent activity.</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    )
}
