import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Briefcase, MapPin, IndianRupee, CheckCircle, Sparkles, Send, Target, Heart, ArrowRight, Copy, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '../../components/DashboardLayout'

export default function Recommendations() {
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [applying, setApplying] = useState(null)
    const [appliedJobs, setAppliedJobs] = useState([])
    const userName = localStorage.getItem('userName') || "User"
    const userId = localStorage.getItem('userId')

    const [wishlist, setWishlist] = useState(() => {
        try { return JSON.parse(localStorage.getItem('wishlist') || '[]') } catch { return [] }
    })

    const toggleWishlist = (jobId) => {
        setWishlist(prev => {
            const updated = prev.includes(jobId)
                ? prev.filter(id => id !== jobId)
                : [...prev, jobId]
            localStorage.setItem('wishlist', JSON.stringify(updated))
            return updated
        })
    }

    useEffect(() => {
        const fetchRecsAndApps = async () => {
            try {
                if (!userId) return

                const [recsRes, appsRes] = await Promise.all([
                    axios.get(`http://localhost:8000/api/candidate/recommendations/${userId}`),
                    axios.get(`http://localhost:8000/api/candidate/applications/${userId}`)
                ])

                setJobs(recsRes.data)
                setAppliedJobs(appsRes.data.map(app => app.job_id))
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchRecsAndApps()
    }, [])

    const [copiedId, setCopiedId] = useState(null)

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        setCopiedId(text)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const applyJob = async (jobId, aiScore) => {
        setApplying(jobId)
        try {
            await axios.post('http://localhost:8000/api/candidate/apply', {
                job_id: jobId,
                candidate_id: userId,
                match_score: aiScore
            })
            setAppliedJobs(prev => [...prev, jobId])
        } catch (err) {
            alert("Error applying to job")
        } finally {
            setApplying(null)
        }
    }

    return (
        <DashboardLayout role="candidate" userName={userName}>
            <div className="flex flex-col gap-8">
                {/* Header */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Best Jobs <span className="text-[#00B074]">for Me</span></h2>
                    <p className="text-gray-500 font-bold mt-1">AI matched these career goals based on your skills.</p>
                </motion.div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                        <div className="w-16 h-16 border-8 border-emerald-50 border-t-[#00B074] rounded-full animate-spin"></div>
                        <p className="text-xl font-black text-gray-400 uppercase tracking-widest">Finding matches...</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[3rem] p-20 text-center border border-gray-100 shadow-xl shadow-green-50"
                    >
                        <div className="bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <Sparkles size={48} className="text-[#00B074]" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-4">No jobs matched yet.</h3>
                        <p className="text-gray-500 mb-10 text-lg font-bold max-w-md mx-auto leading-relaxed">Please make sure you have added your resume so our AI can read your skills first.</p>
                        <Link to="/candidate/resume-upload" className="inline-flex items-center gap-3 px-10 py-5 bg-[#00B074] text-white rounded-[2rem] font-black text-xl hover:bg-[#009663] transition-all shadow-2xl shadow-emerald-200">
                            Add My Resume
                            <ArrowRight size={24} />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {jobs.map((job, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="bg-white rounded-[2.5rem] border border-gray-100 p-8 pt-12 relative group shadow-sm hover:shadow-2xl hover:border-[#00B074]/30 transition-all flex flex-col h-full"
                            >
                                <div className="absolute top-0 right-0 py-2.5 px-6 bg-[#00B074] text-white text-[10px] font-black uppercase tracking-widest rounded-bl-[1.5rem] rounded-tr-[2.5rem] shadow-xl shadow-emerald-100 flex items-center gap-2">
                                    <Sparkles size={14} />
                                    {job.match_percentage}% Score
                                </div>

                                <div className="bg-gray-50 w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:bg-[#00B074]/10 group-hover:text-[#00B074] text-[#00B074]/40 transition-all shadow-sm">
                                    <Briefcase size={36} />
                                </div>

                                <div className="flex-grow">
                                    <h3 className="text-2xl font-black text-gray-900 mb-2 truncate group-hover:text-[#00B074] transition-colors">{job.title}</h3>
                                    <p className="text-gray-400 mb-4 flex items-center font-black uppercase tracking-widest text-[10px]">
                                        {job.company_name}
                                    </p>

                                    <div className="flex items-center gap-2 mb-8 group/id">
                                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 transition-all group-hover:bg-white text-[10px] font-bold text-gray-500">
                                            <span className="text-gray-300 uppercase tracking-tighter mr-1">Job ID:</span>
                                            <code className="text-gray-700 font-mono">{job.job_id}</code>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                copyToClipboard(job.job_id);
                                            }}
                                            className="text-gray-300 hover:text-[#00B074] transition-colors p-1"
                                            title="Copy Job ID"
                                        >
                                            {copiedId === job.job_id ? <Check size={14} className="text-[#00B074]" /> : <Copy size={14} />}
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-3 mb-8">
                                        <div className="flex items-center text-gray-400 font-bold text-xs bg-gray-50 px-5 py-3 rounded-2xl group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-all">
                                            <MapPin size={16} className="mr-3 text-[#00B074]" /> {job.location || 'Remote'}
                                        </div>
                                        <div className="flex items-center text-gray-400 font-bold text-xs bg-gray-50 px-5 py-3 rounded-2xl group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-all">
                                            <IndianRupee size={16} className="mr-3 text-[#00B074]" /> {job.salary || 'Not disclosed'}
                                        </div>
                                    </div>

                                    <div className="mb-10 flex flex-wrap gap-2">
                                        {job.required_skills?.slice(0, 3).map((s, i) => (
                                            <span key={i} className="bg-emerald-50/50 text-[#00B074] text-[10px] px-4 py-2 rounded-xl font-black border border-emerald-100/50 uppercase tracking-widest">{s}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 w-full mt-auto">
                                    <Link 
                                        to={`/jobs/${job.job_id}`} 
                                        className="w-full bg-white text-[#00B074] border border-[#00B074] py-3.5 rounded-2xl font-black text-center text-sm hover:bg-[#00B074] hover:text-white transition-all shadow-sm block"
                                    >
                                        View Details & More
                                    </Link>
                                    <div className="flex gap-3 w-full">
                                        <button 
                                            onClick={() => toggleWishlist(job.job_id)}
                                            className={`p-4 rounded-2xl transition-all shadow-sm border cursor-pointer ${
                                                wishlist.includes(job.job_id) 
                                                    ? 'bg-[#00B074] text-white border-[#00B074]' 
                                                    : 'bg-gray-50 text-[#00B074] border-transparent hover:bg-[#00B074] hover:text-white'
                                            }`}
                                            title={wishlist.includes(job.job_id) ? "Remove from Wishlist" : "Save to Wishlist"}
                                        >
                                            <Heart size={20} fill={wishlist.includes(job.job_id) ? "currentColor" : "none"} />
                                        </button>
                                        <button
                                            onClick={() => applyJob(job.job_id, job.match_percentage)}
                                            disabled={applying === job.job_id || appliedJobs.includes(job.job_id)}
                                            className={`flex-grow font-black py-4 rounded-2xl transition-all flex justify-center items-center gap-2 text-sm active:scale-95 ${appliedJobs.includes(job.job_id)
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                                : 'bg-[#00B074] text-white hover:bg-[#009663] shadow-xl shadow-emerald-200 disabled:opacity-70'
                                                }`}
                                        >
                                            {applying === job.job_id ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : appliedJobs.includes(job.job_id) ? (
                                                <>
                                                    Applied <CheckCircle size={16} />
                                                </>
                                            ) : (
                                                <>
                                                    Apply <Send size={16} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
