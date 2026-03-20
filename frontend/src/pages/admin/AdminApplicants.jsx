import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { UserCircle, CheckCircle, ChevronDown, Filter, Search, Mail, Target, ArrowRight, Shield } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminApplicants() {
    const [jobs, setJobs] = useState([])
    const [selectedJob, setSelectedJob] = useState('')
    const [applicants, setApplicants] = useState([])
    const [loading, setLoading] = useState(false)
    const [showShortlistedOnly, setShowShortlistedOnly] = useState(false)
    const userName = localStorage.getItem('userName') || "Admin"

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await axios.get(`http://localhost:8000/api/admin/jobs`)
                setJobs(typeof res.data === 'string' ? JSON.parse(res.data.replace(/'/g, '"')) : res.data)
            } catch (err) { }
        }
        fetchJobs()
    }, [])

    useEffect(() => {
        if (selectedJob) {
            const fetchApplicants = async () => {
                setLoading(true)
                try {
                    const res = await axios.get(`http://localhost:8000/api/employer/applicants/${selectedJob}`)
                    const sortedApplicants = res.data.sort((a, b) => b.match_score - a.match_score)
                    setApplicants(sortedApplicants)
                } catch (err) { }
                setLoading(false)
            }
            fetchApplicants()
        } else {
            setApplicants([])
        }
    }, [selectedJob])

    const filteredApplicants = showShortlistedOnly 
        ? applicants.filter(app => app.status === 'Shortlisted')
        : applicants

    return (
        <DashboardLayout role="admin" userName={userName}>
            <div className="flex flex-col gap-8">
                {/* Header */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">System <span className="text-[#00B074]">Applicants Review</span></h2>
                    <p className="text-gray-500 font-bold mt-1">Select any job on the platform to view its applicants.</p>
                </motion.div>

                {/* Selection Bar */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-grow w-full relative group">
                        <select
                            className="w-full bg-gray-50 border-0 px-8 py-5 rounded-2xl focus:ring-2 focus:ring-[#00B074] transition-all font-black text-gray-800 appearance-none cursor-pointer pr-12"
                            onChange={e => setSelectedJob(e.target.value)}
                            value={selectedJob}
                        >
                            <option value="">-- Choose a Job Posting --</option>
                            {jobs.map((j, i) => (
                                <option key={i} value={j.job_id}>{j.title} ({j.company_name})</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={24} />
                    </div>

                    {selectedJob && (
                        <button
                            onClick={() => setShowShortlistedOnly(!showShortlistedOnly)}
                            className={`px-8 py-5 rounded-2xl font-black text-sm transition-all border flex items-center gap-2 whitespace-nowrap shadow-sm group ${
                                showShortlistedOnly 
                                ? 'bg-emerald-50 text-[#00B074] border-emerald-100' 
                                : 'bg-white text-gray-400 border-gray-100 hover:border-[#00B074] hover:text-[#00B074]'
                            }`}
                        >
                            <CheckCircle size={20} className={showShortlistedOnly ? "text-[#00B074]" : "text-gray-300"} />
                            {showShortlistedOnly ? "Shortlisted Talent" : "All Applicants"}
                        </button>
                    )}
                </div>

                {/* Applicants List Area */}
                <div className="flex flex-col gap-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-12 h-12 border-4 border-emerald-50 border-t-[#00B074] rounded-full animate-spin"></div>
                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading talent...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredApplicants.sort((a, b) => b.match_score - a.match_score).map((app, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#00B074]/30 transition-all group flex flex-col gap-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-[#00B074]/10 group-hover:text-[#00B074] transition-all shadow-sm">
                                                <UserCircle size={32} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-gray-900 group-hover:text-[#00B074] transition-colors">{app.user?.name || "Candidate Name"}</h3>
                                                <p className="text-gray-400 font-bold text-xs lowercase flex items-center gap-1.5 mt-0.5"><Mail size={12} /> {app.user?.email || "No email"}</p>
                                            </div>
                                        </div>
                                        <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
                                            <Target size={14} className="text-[#00B074]" />
                                            <span className="text-xs font-black text-[#00B074]">{app.match_score}% Match</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${app.status === 'Shortlisted'
                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                            : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                                            }`}>
                                            {app.status || 'Pending Review'}
                                        </span>

                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                            <Shield size={14} className="text-gray-300" /> Admin View Only
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {selectedJob && filteredApplicants.length === 0 && !loading && (
                        <div className="p-20 text-center flex flex-col items-center gap-6 bg-white rounded-[3rem] border border-dashed border-gray-200">
                            <div className="bg-gray-50 p-6 rounded-full text-gray-300">
                                <Search size={48} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-400 italic">
                                    {showShortlistedOnly ? "No students have been shortlisted for this job yet." : "No applicants found for this job yet."}
                                </h3>
                                <p className="text-gray-300 font-bold text-sm mt-1 uppercase tracking-widest">
                                    {showShortlistedOnly ? "Review all candidates to find the best talent." : "Waiting for candidates..."}
                                </p>
                            </div>
                        </div>
                    )}

                    {!selectedJob && (
                        <div className="p-20 text-center flex flex-col items-center gap-6 bg-emerald-50/20 rounded-[3rem] border border-dashed border-[#00B074]/30 animate-pulse">
                            <div className="bg-[#00B074]/10 p-6 rounded-full text-[#00B074]">
                                <ArrowRight size={48} />
                            </div>
                            <h3 className="text-xl font-black text-[#00B074]/60">Select a job above to view talent.</h3>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
