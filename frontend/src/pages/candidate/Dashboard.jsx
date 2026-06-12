import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Target, Activity, Send, Sparkles, Layout, ArrowRight, UserCheck, Zap, Bell, CheckCircle, X } from 'lucide-react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'

export default function CandidateDashboard() {
    const [appsCount, setAppsCount] = useState(0)
    const [applications, setApplications] = useState([])
    const [showProfileModal, setShowProfileModal] = useState(false)
    const userName = localStorage.getItem('userName') || "User"
    const userId = localStorage.getItem('userId')

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch Apps
                const appsRes = await axios.get(`http://localhost:8000/api/candidate/applications/${userId}`)
                setAppsCount(appsRes.data.length)
                setApplications(appsRes.data.reverse().slice(0, 5))

                // Check Profile
                const profileRes = await axios.get(`http://localhost:8000/api/candidate/profile/${userId}`)
                if (!profileRes.data.resume_path || !profileRes.data.skills || profileRes.data.skills.length === 0) {
                    setShowProfileModal(true)
                }
            } catch (err) {
                console.error(err)
            }
        }
        fetchDashboardData()
    }, [userId])

    return (
        <DashboardLayout role="candidate" userName={userName}>
            {/* Complete Profile Modal */}
            <AnimatePresence>
                {showProfileModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#2B3940]/80 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-[3rem] p-10 max-w-lg w-full relative shadow-2xl border border-gray-100 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00B074]/10 rounded-full translate-x-1/2 -translate-y-1/2"></div>

                            <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors z-10">
                                <X size={20} />
                            </button>

                            <div className="flex flex-col items-center text-center gap-6 relative z-10">
                                <div className="bg-emerald-50 p-6 rounded-full text-[#00B074]">
                                    <FileText size={48} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">Complete Your Profile</h3>
                                    <p className="text-gray-500 font-bold mt-3 leading-relaxed">You haven't uploaded a resume yet. To get personalized job recommendations and start applying, please upload your resume now.</p>
                                </div>
                                <div className="flex flex-col w-full gap-3 mt-4">
                                    <Link to="/candidate/resume-upload" className="w-full bg-[#00B074] text-white py-4 rounded-2xl font-black shadow-xl shadow-emerald-200 hover:bg-[#009663] transition-all transform hover:-translate-y-1">
                                        Upload Resume Now
                                    </Link>
                                    <button onClick={() => setShowProfileModal(false)} className="w-full text-gray-400 font-black py-4 hover:bg-gray-50 rounded-2xl transition-all">
                                        I'll do it later
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col gap-10">
                {/* Hero Greeting Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative p-10 bg-[#2B3940] rounded-[3rem] text-white overflow-hidden shadow-2xl"
                >
                    <Sparkles className="absolute -top-10 -right-10 w-40 h-40 text-white opacity-5 rotate-12" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <span className="flex items-center gap-2 text-[#00B074] font-black text-sm uppercase tracking-widest mb-4">
                                <UserCheck className="w-4 h-4" />
                                Candidate Dashboard
                            </span>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                                Welcome back, <span className="text-[#00B074]">{userName}</span>!
                            </h1>
                            <p className="text-gray-400 text-lg font-bold">Ready to find your next goal today?</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl flex flex-col items-center justify-center text-center shadow-lg hover:backdrop-blur-lg transition-all">
                            <h3 className="text-5xl font-black text-[#00B074] mb-1 tracking-tighter">{appsCount}</h3>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Jobs Applied</p>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: "My Resume", desc: "Update your profile details.", path: "/candidate/resume-upload", icon: <FileText />, color: "emerald" },
                        { title: "Best Jobs", desc: "Matches for your skills.", path: "/candidate/recommendations", icon: <Target />, color: "blue" },
                        { title: "Skill Check", desc: "See what you need to learn.", path: "/candidate/skill-gap", icon: <Activity />, color: "orange" },
                        { title: "All Jobs", desc: "Browse all active job posts.", path: "/jobs", icon: <Zap />, color: "purple" }
                    ].map((card, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -8 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Link to={card.path} className="bg-white p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center h-full hover:shadow-xl hover:border-[#00B074]/30 transition-all border border-gray-100 group relative overflow-hidden shadow-sm">
                                <div className="bg-gray-50 p-6 rounded-3xl mb-6 group-hover:bg-[#00B074] transition-all transform group-hover:scale-110 shadow-sm text-[#00B074] group-hover:text-white">
                                    {card.icon}
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">{card.title}</h3>
                                <p className="text-gray-400 font-bold text-sm leading-relaxed">{card.desc}</p>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Activity Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-green-50 overflow-hidden relative"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                    <Bell className="w-6 h-6 text-[#00B074]" />
                                    Recent Updates
                                </h2>
                                <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest px-1">Stay tuned to your progress</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {applications.length > 0 ? applications.map((item, i) => (
                                <Link 
                                    key={i} 
                                    to={`/jobs/${item.job_id}`}
                                    className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl group border border-transparent hover:border-[#00B074]/20 hover:bg-white transition-all shadow-sm cursor-pointer"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="bg-white p-3 rounded-2xl text-[#00B074] shadow-sm group-hover:bg-[#00B074] group-hover:text-white transition-colors">
                                            <CheckCircle />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 group-hover:text-[#00B074] transition-colors">Applied to {item.job_title} at {item.company_name}</h4>
                                            <p className="text-xs font-bold text-gray-400">Match Score: {item.match_score}%</p>
                                        </div>
                                    </div>
                                    <span className="bg-emerald-50 text-[#00B074] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-100">{item.status}</span>
                                </Link>
                            )) : (
                                <p className="text-sm font-bold text-gray-400 text-center py-4">No recent activity.</p>
                            )}
                        </div>
                    </motion.div>

                    {/* AI Coach Sidebar (Mock) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-[#00B074] p-10 rounded-[3rem] text-white overflow-hidden relative shadow-2xl shadow-emerald-200"
                    >
                        <Zap className="absolute -top-10 -right-10 w-40 h-40 text-black opacity-10 rotate-12" />
                        <h3 className="text-2xl font-black mb-6 relative z-10 flex items-center gap-2">
                            AI Career Coach
                        </h3>
                        <p className="text-white/80 font-bold mb-8 relative z-10 leading-relaxed">"Based on your profile, adding <span className="bg-white/20 px-2 py-0.5 rounded text-white">Docker</span> and <span className="bg-white/20 px-2 py-0.5 rounded text-white">Cloud</span> skills could double your chances."</p>
                        <Link to="/candidate/skill-gap" className="flex items-center justify-center p-5 bg-white text-[#00B074] rounded-2xl hover:bg-emerald-50 transition-all font-black text-lg gap-2 relative z-10 shadow-xl">
                            Improve My Score <ArrowRight size={20} />
                        </Link>

                        <div className="mt-12 bg-white/10 p-6 rounded-3xl border border-white/20 relative z-10">
                            <h4 className="text-xs font-black uppercase tracking-widest mb-4">Daily Goal</h4>
                            <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden mb-3 shadow-inner">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '70%' }}
                                    transition={{ duration: 1, delay: 1 }}
                                    className="bg-white h-full"
                                ></motion.div>
                            </div>
                            <div className="flex justify-between text-xs font-bold">
                                <span>3 of 5 Completed</span>
                                <span>70%</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    )
}
