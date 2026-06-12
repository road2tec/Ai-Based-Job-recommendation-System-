import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    ArrowLeft, MapPin, Briefcase, Calendar, IndianRupee, 
    CheckCircle, AlertCircle, Sparkles, ExternalLink, 
    Youtube, ArrowRight, Lock, BookOpen, Clock, Heart
} from 'lucide-react'
import axios from 'axios'

export default function JobDetails() {
    const { jobId } = useParams()
    const navigate = useNavigate()
    const userId = localStorage.getItem('userId')
    
    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1)
        } else {
            navigate(userId ? '/candidate/dashboard' : '/jobs')
        }
    }

    const [wishlist, setWishlist] = useState(() => {
        try { return JSON.parse(localStorage.getItem('wishlist') || '[]') } catch { return [] }
    })

    const toggleWishlist = () => {
        setWishlist(prev => {
            const updated = prev.includes(jobId)
                ? prev.filter(id => id !== jobId)
                : [...prev, jobId]
            localStorage.setItem('wishlist', JSON.stringify(updated))
            return updated
        })
    }
    
    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    
    // User status
    const [applied, setApplied] = useState(false)
    const [applying, setApplying] = useState(false)
    const [profile, setProfile] = useState(null)
    
    // AI Skill gap analysis
    const [hasResume, setHasResume] = useState(false)
    const [skillGap, setSkillGap] = useState(null)
    const [matchPercentage, setMatchPercentage] = useState(null)
    const [loadingAI, setLoadingAI] = useState(false)

    useEffect(() => {
        const fetchJobData = async () => {
            try {
                setLoading(true)
                // Fetch the job
                const jobRes = await axios.get(`http://localhost:8000/api/admin/jobs/${jobId}`)
                setJob(jobRes.data)
                
                // If logged in, fetch candidate applications and profile details
                if (userId) {
                    // Check if already applied
                    const appsRes = await axios.get(`http://localhost:8000/api/candidate/applications/${userId}`)
                    const alreadyApplied = appsRes.data.some(app => app.job_id === jobId)
                    setApplied(alreadyApplied)
                    
                    // Fetch profile
                    const profileRes = await axios.get(`http://localhost:8000/api/candidate/profile/${userId}`)
                    setProfile(profileRes.data)
                    
                    if (profileRes.data.resume_path && profileRes.data.skills && profileRes.data.skills.length > 0) {
                        setHasResume(true)
                        // Fetch skill gap analysis
                        setLoadingAI(true)
                        try {
                            const gapRes = await axios.get(`http://localhost:8000/api/candidate/skill-gap/${userId}/${jobId}`)
                            setSkillGap(gapRes.data)
                            
                            // Calculate score
                            const req = gapRes.data.required_skills || []
                            const matched = gapRes.data.matched_skills || []
                            if (req.length > 0) {
                                const percentage = Math.round((matched.length / req.length) * 100)
                                setMatchPercentage(percentage)
                            } else {
                                setMatchPercentage(100)
                            }
                        } catch (aiErr) {
                            console.error("Failed to analyze skill gap:", aiErr)
                        } finally {
                            setLoadingAI(false)
                        }
                    }
                }
            } catch (err) {
                console.error(err)
                setError("Failed to load job details. The job may not exist or the server is down.")
            } finally {
                setLoading(false)
            }
        }
        
        if (jobId) {
            fetchJobData()
        }
    }, [jobId, userId])

    const handleApply = async () => {
        if (!userId) {
            navigate('/login')
            return
        }
        
        setApplying(true)
        try {
            await axios.post('http://localhost:8000/api/candidate/apply', {
                job_id: jobId,
                candidate_id: userId,
                match_score: matchPercentage !== null ? matchPercentage : 0
            })
            setApplied(true)
        } catch (err) {
            console.error(err)
            alert("An error occurred while submitting your application.")
        } finally {
            setApplying(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F1F8F5] pt-20 gap-6">
                <div className="w-16 h-16 border-8 border-emerald-50 border-t-[#00B074] rounded-full animate-spin"></div>
                <p className="text-xl font-black text-gray-400 uppercase tracking-widest">Loading job details...</p>
            </div>
        )
    }

    if (error || !job) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F1F8F5] px-6 text-center">
                <AlertCircle size={64} className="text-red-500 mb-6" />
                <h2 className="text-3xl font-black text-[#2B3940] mb-4">Oops! Something went wrong</h2>
                <p className="text-gray-500 font-bold max-w-md mb-8">{error || "Job not found"}</p>
                <Link to="/jobs" className="inline-flex items-center gap-2 bg-[#00B074] text-white px-8 py-4 rounded-2xl font-black hover:bg-[#009663] transition-all shadow-xl shadow-emerald-400/20">
                    <ArrowLeft size={20} /> Back to Job Listings
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F1F8F5] pt-12 pb-24 px-4 md:px-6">
            <div className="max-w-[1320px] mx-auto flex flex-col gap-8">
                
                {/* Back Button & Breadcrumb */}
                <div className="flex items-center justify-between">
                    <button 
                        onClick={handleBack} 
                        className="inline-flex items-center gap-2 text-[#2B3940] hover:text-[#00B074] font-black transition-colors group cursor-pointer bg-transparent border-0"
                    >
                        <ArrowLeft size={20} className="transform group-hover:-translate-x-1 transition-transform" /> 
                        {userId ? 'Back to Dashboard' : 'Back to Jobs'}
                    </button>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:block">
                        Jobs &bull; {job.company_name} &bull; {job.title}
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid lg:grid-cols-3 gap-10 items-start">
                    
                    {/* Left Column: Job Details */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        
                        {/* Hero Header Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-8 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-[#00B074]/5 rounded-full translate-x-1/3 -translate-y-1/3"></div>
                            
                            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left relative z-10">
                                {/* Company Logo Initial */}
                                <div className="w-24 h-24 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center justify-center font-black text-4xl text-[#00B074] shrink-0 shadow-sm">
                                    {job.company_name ? job.company_name.charAt(0).toUpperCase() : 'J'}
                                </div>
                                <div className="flex-grow">
                                    <h1 className="text-3xl md:text-4xl font-black text-[#2B3940] tracking-tight">{job.title}</h1>
                                    <p className="text-lg font-bold text-[#00B074] mt-2">{job.company_name || 'Employer'}</p>
                                    
                                    {/* Badges row */}
                                    <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start text-sm font-bold text-gray-400">
                                        <span className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                            <MapPin size={16} className="text-[#00B074]" /> {job.location || 'Remote'}
                                        </span>
                                        <span className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                            <Briefcase size={16} className="text-[#00B074]" /> {job.job_type || 'Full Time'}
                                        </span>
                                        <span className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                            <IndianRupee size={16} className="text-[#00B074]" /> {job.salary || 'Not Disclosed'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Detailed Description Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white p-8 md:p-12 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col gap-8"
                        >
                            {/* Job Description Title */}
                            <div>
                                <h2 className="text-2xl font-black text-[#2B3940]">Job Description</h2>
                                <div className="w-12 h-1.5 bg-[#00B074] rounded-full mt-2"></div>
                            </div>

                            {/* Spacing and white-space pre-line ensures paragraphs / line breaks in database description render properly */}
                            <div className="text-gray-600 font-medium leading-relaxed text-base space-y-4 whitespace-pre-wrap break-words">
                                {job.description}
                            </div>

                            {/* Skills Section */}
                            <div className="border-t border-gray-100 pt-8 mt-4">
                                <h3 className="text-lg font-black text-[#2B3940] mb-4">Required Skills</h3>
                                <div className="flex flex-wrap gap-2.5">
                                    {(job.required_skills || job.skills_required || []).map((skill, index) => (
                                        <span 
                                            key={index} 
                                            className="bg-emerald-50 text-[#00B074] text-xs font-black px-5 py-2.5 rounded-2xl border border-emerald-100/50 uppercase tracking-widest hover:bg-[#00B074] hover:text-white transition-all duration-300"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: AI Score Widget & Action Buttons */}
                    <div className="lg:col-span-1 flex flex-col gap-8 sticky top-28">
                        
                        {/* Quick Apply Action Box */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col gap-6"
                        >
                            <h3 className="text-xl font-black text-[#2B3940]">Apply for this Job</h3>
                            
                            <div className="flex flex-col gap-2 text-xs font-bold text-gray-400">
                                <div className="flex justify-between">
                                    <span>Job ID:</span>
                                    <span className="font-mono text-gray-700 font-bold">{job.job_id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Posted:</span>
                                    <span className="text-gray-700">
                                        {job.created_at ? new Date(job.created_at).toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'}) : 'Recently'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={toggleWishlist}
                                    className={`p-5 rounded-2xl transition-all shadow-sm shrink-0 border cursor-pointer ${
                                        wishlist.includes(jobId) 
                                            ? 'bg-[#00B074] text-white border-[#00B074]' 
                                            : 'bg-gray-50 text-[#00B074] border-transparent hover:bg-[#00B074] hover:text-white'
                                    }`}
                                    title={wishlist.includes(jobId) ? "Remove from Wishlist" : "Save to Wishlist"}
                                >
                                    <Heart size={24} fill={wishlist.includes(jobId) ? "currentColor" : "none"} />
                                </button>

                                {applied ? (
                                    <button 
                                        disabled 
                                        className="flex-grow bg-gray-100 text-gray-400 py-5 rounded-2xl font-black text-lg border border-gray-200 cursor-not-allowed flex items-center justify-center gap-3"
                                    >
                                        Already Applied <CheckCircle size={22} className="text-gray-400" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleApply}
                                        disabled={applying}
                                        className="flex-grow bg-[#00B074] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#009663] transition-all duration-300 shadow-xl shadow-emerald-400/20 flex items-center justify-center gap-3 active:scale-98 disabled:opacity-75 cursor-pointer"
                                    >
                                        {applying ? (
                                            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                Apply Now <ArrowRight size={20} />
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                            
                            {!userId && (
                                <p className="text-center text-xs font-bold text-gray-400 leading-normal">
                                    * You will be redirected to Log In if you are not authenticated.
                                </p>
                            )}
                        </motion.div>

                        {/* AI Match Widget (Premium Feature) */}
                        <AnimatePresence mode="wait">
                            {!userId ? (
                                // Prompt user to login for AI matching
                                <motion.div
                                    key="no-user"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gradient-to-tr from-[#2B3940] to-[#3D4F59] p-8 rounded-[3rem] text-white flex flex-col gap-6 shadow-2xl relative overflow-hidden"
                                >
                                    <div className="absolute -top-10 -left-10 w-28 h-28 bg-[#00B074]/10 rounded-full blur-xl"></div>
                                    <div className="flex items-center gap-3 text-[#00B074] font-black text-xs uppercase tracking-widest">
                                        <Lock size={16} /> AI Match insights
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight leading-tight">Unlock AI Match Analysis</h3>
                                    <p className="text-gray-400 text-sm font-bold leading-relaxed">
                                        Log in and upload your resume to see how your skills compare, get a fit rating, and access curated tutorial playlists.
                                    </p>
                                    <Link to="/login" className="flex items-center justify-center p-4 bg-[#00B074] text-white rounded-2xl hover:bg-[#009663] transition-all font-black text-base gap-2 shadow-lg shadow-emerald-400/10">
                                        Log In & Check <ArrowRight size={18} />
                                    </Link>
                                </motion.div>
                            ) : loadingAI ? (
                                <motion.div
                                    key="loading-ai"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 gap-4"
                                >
                                    <div className="w-10 h-10 border-4 border-emerald-50 border-t-[#00B074] rounded-full animate-spin"></div>
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Analyzing compatibility...</p>
                                </motion.div>
                            ) : !hasResume ? (
                                // Profile exists, but no resume uploaded
                                <motion.div
                                    key="no-resume"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col gap-6 text-center"
                                >
                                    <div className="bg-emerald-50 p-5 rounded-full text-[#00B074] w-16 h-16 flex items-center justify-center mx-auto">
                                        <Sparkles size={28} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-[#2B3940]">Calculate AI Match Score</h4>
                                        <p className="text-gray-400 font-bold text-xs mt-3 leading-relaxed">
                                            Upload your resume to let our AI compare your skills with this job and highlight learning resources.
                                        </p>
                                    </div>
                                    <Link to="/candidate/resume-upload" className="w-full bg-[#00B074] text-white py-4 rounded-xl font-black text-sm hover:bg-[#009663] transition-all shadow-md">
                                        Upload Resume Now
                                    </Link>
                                </motion.div>
                            ) : (
                                // Full AI Match Insights
                                <motion.div
                                    key="ai-matched"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-green-50/50 flex flex-col gap-6 relative overflow-hidden"
                                >
                                    {/* Subtitle / Header */}
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2 text-[#00B074] font-black text-[10px] uppercase tracking-widest">
                                            <Sparkles size={14} className="animate-pulse" /> AI Fit Analysis
                                        </span>
                                        {matchPercentage !== null && (
                                            <span className="bg-emerald-50 text-[#00B074] text-[10px] font-black px-3 py-1 rounded-lg border border-emerald-100">
                                                Active
                                            </span>
                                        )}
                                    </div>

                                    {/* Score Progress Layout */}
                                    <div className="flex items-center gap-6 bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                        <div className="relative flex items-center justify-center shrink-0">
                                            {/* Circular SVG Indicator */}
                                            <svg className="w-20 h-20 transform -rotate-90">
                                                <circle cx="40" cy="40" r="32" stroke="#e6f7f0" strokeWidth="8" fill="transparent" />
                                                <motion.circle 
                                                    cx="40" 
                                                    cy="40" 
                                                    r="32" 
                                                    stroke="#00B074" 
                                                    strokeWidth="8" 
                                                    fill="transparent" 
                                                    strokeDasharray={200}
                                                    initial={{ strokeDashoffset: 200 }}
                                                    animate={{ strokeDashoffset: 200 - (200 * (matchPercentage || 0)) / 100 }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                />
                                            </svg>
                                            <span className="absolute text-lg font-black text-[#2B3940]">{matchPercentage || 0}%</span>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 text-sm">Compatibility Fit</h4>
                                            <p className="text-gray-400 text-xs font-bold mt-1 leading-normal">
                                                {matchPercentage >= 80 ? 'Excellent match for your skills!' : 
                                                 matchPercentage >= 50 ? 'Good fit. Consider learning missing skills.' : 
                                                 'A few skills mismatch. Level up below!'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Skill Breakdown */}
                                    {skillGap && (
                                        <div className="flex flex-col gap-5">
                                            
                                            {/* Matched Skills */}
                                            <div>
                                                <h4 className="text-xs font-black text-[#2B3940] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                    <CheckCircle size={14} className="text-[#00B074]" /> Matched Skills ({skillGap.matched_skills?.length || 0})
                                                </h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {skillGap.matched_skills?.length > 0 ? (
                                                        skillGap.matched_skills.map((skill, index) => (
                                                            <span key={index} className="bg-emerald-50 text-[#00B074] text-[10px] font-black px-3 py-1.5 rounded-xl border border-emerald-100/50 uppercase tracking-wider">
                                                                {skill}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs font-bold text-gray-400 italic">None matched yet.</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Missing Skills */}
                                            <div>
                                                <h4 className="text-xs font-black text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                    <AlertCircle size={14} className="text-orange-400" /> Missing Skills ({skillGap.missing_skills?.length || 0})
                                                </h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {skillGap.missing_skills?.length > 0 ? (
                                                        skillGap.missing_skills.map((skill, index) => (
                                                            <span key={index} className="bg-orange-50 text-orange-500 text-[10px] font-black px-3 py-1.5 rounded-xl border border-orange-100 uppercase tracking-wider">
                                                                {skill}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs font-bold text-gray-400 italic">No missing skills! You possess all requirements.</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* YouTube Playlists / Learn Section */}
                                            {skillGap.missing_skills?.length > 0 && Object.keys(skillGap.suggestions || {}).length > 0 && (
                                                <div className="border-t border-gray-100 pt-5 mt-2">
                                                    <h4 className="text-xs font-black text-[#2B3940] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                        <BookOpen size={14} className="text-red-500" /> AI Recommended Tutorials
                                                    </h4>
                                                    <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
                                                        {Object.entries(skillGap.suggestions).map(([skill, videos]) => (
                                                            <div key={skill} className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 flex flex-col gap-2">
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-[#00B074]">{skill} Course</span>
                                                                {videos.slice(0, 2).map((vid, vIdx) => (
                                                                    <a 
                                                                        key={vIdx}
                                                                        href={vid.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-start gap-2 text-xs font-bold text-gray-600 hover:text-[#00B074] transition-colors group/link"
                                                                    >
                                                                        <Youtube size={16} className="text-red-500 shrink-0 mt-0.5" />
                                                                        <span className="flex-grow line-clamp-2">{vid.title}</span>
                                                                        <ExternalLink size={12} className="text-gray-400 opacity-0 group-hover/link:opacity-100 shrink-0 mt-0.5 transition-opacity" />
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                        </div>
                                    )}

                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>
                </div>

            </div>
        </div>
    )
}
