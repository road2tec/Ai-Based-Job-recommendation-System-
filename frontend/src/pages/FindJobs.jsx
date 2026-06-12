import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, TrendingUp, Heart, Briefcase, Filter, CheckCircle, Copy, Check } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import axios from 'axios'

export default function FindJobs() {
    const [searchTerm, setSearchTerm] = useState('')
    const [jobs, setJobs] = useState([])
    const [appliedJobs, setAppliedJobs] = useState([])
    const [copiedId, setCopiedId] = useState(null)
    const [filterTypes, setFilterTypes] = useState([])
    const [salaryMax, setSalaryMax] = useState(50)
    const [selectedLocation, setSelectedLocation] = useState('')
    const [wishlist, setWishlist] = useState(() => {
        try { return JSON.parse(localStorage.getItem('wishlist') || '[]') } catch { return [] }
    })
    const userId = localStorage.getItem('userId')
    const location = useLocation()

    // Read ?search= query param on load
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const q = params.get('search')
        if (q) setSearchTerm(q)
    }, [location.search])

    const toggleFilter = (type) => {
        setFilterTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        )
    }

    const toggleWishlist = (jobId) => {
        setWishlist(prev => {
            const updated = prev.includes(jobId)
                ? prev.filter(id => id !== jobId)
                : [...prev, jobId]
            localStorage.setItem('wishlist', JSON.stringify(updated))
            return updated
        })
    }

    // Parse salary string like "₹8L - ₹15L" to get max value in Lakhs
    const parseSalaryMax = (salaryStr) => {
        if (!salaryStr) return 0
        const matches = salaryStr.match(/[\d.]+/g)
        if (matches && matches.length >= 2) return parseFloat(matches[1])
        if (matches && matches.length === 1) return parseFloat(matches[0])
        return 0
    }

    const filteredJobs = jobs.filter(job => {
        const matchesSearch =
            job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.location?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = filterTypes.length === 0 || filterTypes.includes(job.job_type)
        const salaryVal = job.salary || job.salary_range || ''
        const jobSalaryMax = parseSalaryMax(salaryVal)
        const matchesSalary = jobSalaryMax === 0 || jobSalaryMax <= salaryMax
        const matchesLocation = !selectedLocation ||
            job.location?.toLowerCase().includes(selectedLocation.toLowerCase())
        return matchesSearch && matchesType && matchesSalary && matchesLocation
    })

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        setCopiedId(text)
        setTimeout(() => setCopiedId(null), 2000)
    }

    useEffect(() => {
        const fetchJobsAndApps = async () => {
            try {
                const jobsRes = await axios.get('http://localhost:8000/api/admin/jobs')
                setJobs(jobsRes.data)

                if (userId) {
                    const appsRes = await axios.get(`http://localhost:8000/api/candidate/applications/${userId}`)
                    setAppliedJobs(appsRes.data.map(app => app.job_id))
                }
            } catch (err) {
                console.error(err)
            }
        }
        fetchJobsAndApps()
    }, [userId])

    return (
        <div className="flex flex-col min-h-screen bg-[#F1F8F5]">
            {/* Page Header with Search */}
            <div className="bg-[#2B3940] pt-40 pb-32 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[#00B074]/10 mix-blend-overlay opacity-50"></div>
                <div className="max-w-[1320px] mx-auto px-6 relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-black text-white mb-10"
                    >
                        Find Your <span className="text-[#00B074]">Career</span>
                    </motion.h1>

                    {/* Integrated Search Bar */}
                    <div className="max-w-4xl mx-auto bg-white p-3 rounded-2xl shadow-2xl flex flex-wrap md:flex-nowrap gap-3">
                        <div className="flex-grow flex items-center bg-gray-50 rounded-xl px-5 border border-gray-100 group focus-within:ring-2 focus-within:ring-[#00B074]">
                            <Search className="text-gray-400 group-focus-within:text-[#00B074] transition-colors" />
                            <input
                                type="text"
                                placeholder="Job title, keywords, company..."
                                className="w-full py-5 bg-transparent border-0 focus:ring-0 text-gray-800 font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="hidden md:flex flex-grow items-center bg-gray-50 rounded-xl px-5 border border-gray-100 group focus-within:ring-2 focus-within:ring-[#00B074]">
                            <MapPin className="text-gray-400 group-focus-within:text-[#00B074] transition-colors" />
                            <select
                                className="w-full py-5 bg-transparent border-0 focus:ring-0 text-gray-500 font-medium cursor-pointer"
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                            >
                                <option value="">Location</option>
                                <option value="Remote">Remote</option>
                                <option value="Mumbai">Mumbai</option>
                                <option value="Pune">Pune</option>
                                <option value="Bangalore">Bangalore</option>
                                <option value="Delhi">Delhi</option>
                            </select>
                        </div>
                        <button
                            className="bg-[#00B074] text-white px-10 py-5 rounded-xl font-black uppercase tracking-wider hover:bg-[#009663] transition-all shadow-xl shadow-emerald-400/20"
                            onClick={() => { /* search is live/reactive */ }}
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <section className="py-24 max-w-[1320px] mx-auto px-6 w-full grid lg:grid-cols-4 gap-12">
                {/* Filters Sidebar */}
                <div className="hidden lg:flex flex-col gap-10">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-[#2B3940]">Filters</h3>
                            <Filter size={18} className="text-[#00B074]" />
                        </div>

                        {/* Filter Group: Job Type */}
                        <div className="flex flex-col gap-4">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Job Type</h4>
                            <div className="flex flex-wrap gap-2">
                                {["Full Time", "Part Time", "Internship", "Contract"].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => toggleFilter(type)}
                                        className={`px-5 py-2.5 rounded-full text-xs font-black transition-all border uppercase tracking-wider ${filterTypes.includes(type)
                                                ? 'bg-[#00B074] text-white border-[#00B074] shadow-lg shadow-emerald-100'
                                                : 'bg-white text-gray-400 border-gray-100 hover:border-[#00B074] hover:text-[#00B074]'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filter Group: Salary Range */}
                        <div className="flex flex-col gap-4">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Salary Range (Max: ₹{salaryMax}L)</h4>
                            <input
                                type="range"
                                min={1}
                                max={50}
                                value={salaryMax}
                                onChange={e => setSalaryMax(Number(e.target.value))}
                                className="w-full accent-[#00B074]"
                            />
                            <div className="flex justify-between text-xs font-bold text-gray-400">
                                <span>₹1L</span>
                                <span>₹{salaryMax}L</span>
                                <span>₹50L+</span>
                            </div>
                            {salaryMax < 50 && (
                                <button
                                    onClick={() => setSalaryMax(50)}
                                    className="text-xs font-bold text-[#00B074] hover:underline text-left"
                                >
                                    Clear salary filter
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Job Listings Area */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-gray-500 font-bold">Showing <span className="text-[#00B074]">{filteredJobs.length}</span> of <span className="text-gray-700">{jobs.length}</span> jobs</p>
                        <select className="bg-transparent border-0 font-bold text-[#2B3940] focus:ring-0 cursor-pointer">
                            <option>Latest Updates</option>
                            <option>Salary: High to Low</option>
                        </select>
                    </div>

                    {filteredJobs.length === 0 ? (
                        <div className="bg-white p-20 rounded-[3rem] text-center border border-dashed border-gray-200">
                            <p className="text-xl font-black text-gray-400">No jobs found matching your filters.</p>
                            <button
                                onClick={() => { setSearchTerm(''); setFilterTypes([]); setSalaryMax(50); setSelectedLocation('') }}
                                className="mt-4 text-[#00B074] font-bold hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    ) : filteredJobs.map((job, i) => (
                        <motion.div
                            key={i}
                            className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-6 hover:shadow-xl hover:border-[#00B074]/20 transition-all group"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            {/* Company Logo / Initial */}
                            <div className="w-24 h-24 bg-gray-50 border border-gray-100 rounded-3xl flex items-center justify-center p-5 shrink-0 group-hover:bg-emerald-50 transition-all font-black text-3xl text-[#00B074]">
                                {job.company_name ? job.company_name.charAt(0).toUpperCase() : 'J'}
                            </div>
                            <div className="flex-grow text-center md:text-left">
                                <h3 className="text-2xl font-black text-[#2B3940] transition-colors group-hover:text-[#00B074]">{job.title}</h3>
                                {/* Full company name visible */}
                                <p className="text-sm font-bold text-[#00B074] mt-1">{job.company_name || 'Company'}</p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-sm font-bold text-gray-400">
                                    <span className="flex items-center gap-1.5"><MapPin size={16} className="text-[#00B074]" /> {job.location || 'Remote'}</span>
                                    <span className="flex items-center gap-1.5"><Briefcase size={16} className="text-[#00B074]" /> {job.job_type || 'Full Time'}</span>
                                    <span className="flex items-center gap-1.5"><TrendingUp size={16} className="text-[#00B074]" /> {job.salary || job.salary_range || 'Not Disclosed'}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-4 group/id">
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
                            </div>
                            <div className="flex flex-col md:items-end gap-3 text-right shrink-0">
                                <div className="flex gap-3 flex-wrap justify-center md:justify-end">
                                    <Link 
                                        to={`/jobs/${job.job_id}`} 
                                        className="bg-white text-[#00B074] border border-[#00B074] py-4 px-8 rounded-2xl font-black text-lg hover:bg-[#00B074] hover:text-white transition-all shadow-sm flex items-center justify-center"
                                    >
                                        View More
                                    </Link>
                                    {appliedJobs.includes(job.job_id) ? (
                                        <button disabled className="bg-gray-100 text-gray-400 py-4 px-8 rounded-2xl font-black text-lg border border-gray-200 cursor-not-allowed flex items-center justify-center gap-2">
                                            Already Applied <CheckCircle size={20} />
                                        </button>
                                    ) : (
                                        <Link 
                                            to={userId ? `/jobs/${job.job_id}` : '/login'} 
                                            className="bg-[#00B074] text-white py-4 px-8 rounded-2xl font-black text-lg hover:bg-[#009663] transition-all shadow-xl shadow-emerald-400/20 flex items-center justify-center"
                                        >
                                            Apply Now
                                        </Link>
                                    )}
                                    {/* Wishlist button */}
                                    <button
                                        onClick={() => toggleWishlist(job.job_id)}
                                        className={`p-4 rounded-2xl transition-all shadow-sm ${wishlist.includes(job.job_id) ? 'bg-[#00B074] text-white' : 'bg-gray-50 text-[#00B074] hover:bg-[#00B074] hover:text-white'}`}
                                        title={wishlist.includes(job.job_id) ? "Remove from Wishlist" : "Save to Wishlist"}
                                    >
                                        <Heart size={22} fill={wishlist.includes(job.job_id) ? "currentColor" : "none"} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    )
}
