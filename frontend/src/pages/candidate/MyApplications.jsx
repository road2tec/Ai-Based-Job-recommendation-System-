import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { CheckCircle, Clock, XCircle, Search, Target, MapPin, IndianRupee } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function MyApplications() {
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [showShortlistedOnly, setShowShortlistedOnly] = useState(false)
    const userName = localStorage.getItem('userName') || "User"
    const userId = localStorage.getItem('userId')

    useEffect(() => {
        const fetchApplications = async () => {
            setLoading(true)
            try {
                const res = await axios.get(`http://localhost:8000/api/candidate/applications/${userId}`)
                setApplications(res.data)
            } catch (err) {
                console.error(err)
            }
            setLoading(false)
        }
        fetchApplications()
    }, [userId])

    // Helper to get status color
    const getStatusDetails = (status) => {
        switch (status?.toLowerCase()) {
            case 'shortlisted':
                return { color: 'bg-emerald-50 text-[#00B074] border-emerald-100', icon: <CheckCircle className="w-4 h-4" /> }
            case 'rejected':
                return { color: 'bg-red-50 text-red-600 border-red-100', icon: <XCircle className="w-4 h-4" /> }
            default:
                return { color: 'bg-orange-50 text-orange-600 border-orange-100', icon: <Clock className="w-4 h-4" /> }
        }
    }

    const filteredApps = showShortlistedOnly 
        ? applications.filter(app => app.status === 'Shortlisted')
        : applications

    return (
        <DashboardLayout role="candidate" userName={userName}>
            <div className="flex flex-col gap-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, y: 0 }}>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">My <span className="text-[#00B074]">Applications</span></h2>
                        <p className="text-gray-500 font-bold mt-1">Track the status of the jobs you've applied for.</p>
                    </motion.div>

                    {applications.length > 0 && (
                        <button
                            onClick={() => setShowShortlistedOnly(!showShortlistedOnly)}
                            className={`px-6 py-3 rounded-2xl font-black text-sm transition-all border flex items-center gap-2 shadow-sm ${
                                showShortlistedOnly 
                                ? 'bg-emerald-50 text-[#00B074] border-emerald-100' 
                                : 'bg-white text-gray-400 border-gray-100'
                            }`}
                        >
                            <CheckCircle size={18} />
                            Shortlisted Only
                        </button>
                    )}
                </div>

                {/* Applications List */}
                <div className="flex flex-col gap-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-12 h-12 border-4 border-emerald-50 border-t-[#00B074] rounded-full animate-spin"></div>
                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading history...</p>
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center gap-6 bg-white rounded-[3rem] border border-dashed border-gray-200">
                            <div className="bg-gray-50 p-6 rounded-full text-gray-300">
                                <Search size={48} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-400 italic">You haven't applied to any jobs yet.</h3>
                                <p className="text-gray-400 font-bold mt-2">Check your recommendations and start applying!</p>
                            </div>
                            <Link to="/candidate/recommendations" className="mt-4 bg-[#00B074] text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-[#009663] transition-all shadow-xl shadow-emerald-100">
                                View Recommended Jobs
                            </Link>
                        </div>
                    ) : filteredApps.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center gap-6 bg-white rounded-[3rem] border border-dashed border-gray-200">
                            <div className="bg-gray-50 p-6 rounded-full text-gray-300">
                                <Search size={48} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-400 italic">No shortlisted jobs found.</h3>
                                <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-xs">Keep applying and improving your skills!</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredApps.map((app, idx) => {
                                const statusDetails = getStatusDetails(app.status)
                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#00B074]/30 transition-all flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="bg-gray-50 p-3 rounded-2xl text-gray-400 shadow-sm">
                                                    <Target size={24} />
                                                </div>
                                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border ${statusDetails.color}`}>
                                                    {statusDetails.icon} {app.status || 'Applied'}
                                                </span>
                                            </div>

                                            <h3 className="text-xl font-black text-gray-900 mb-1">{app.job_title || "Job Title"}</h3>
                                            <p className="text-gray-500 font-bold text-sm mb-6">{app.company_name || 'Employer'}</p>

                                            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-50 flex items-center justify-between mb-4">
                                                <span className="text-xs font-black text-[#00B074] uppercase tracking-widest">AI Match Score</span>
                                                <span className="text-lg font-black text-[#00B074]">{app.match_score || "N/A"}%</span>
                                            </div>
                                        </div>

                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest pt-4 border-t border-gray-50 text-right">
                                            Applied {new Date(app.created_at).toLocaleDateString()}
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
