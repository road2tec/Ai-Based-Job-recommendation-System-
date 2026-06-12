import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Trash2, Briefcase, Search, MapPin, Building, Calendar, Filter } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import { motion } from 'framer-motion'

export default function ManageJobs() {
    const [jobs, setJobs] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const userName = localStorage.getItem('userName') || "Admin"

    useEffect(() => {
        fetchJobs()
    }, [])

    const fetchJobs = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/admin/jobs')
            setJobs(res.data)
        } catch (err) { }
    }

    const deleteJob = async (jobId) => {
        if (!window.confirm("Are you sure you want to remove this job posting?")) return
        try {
            await axios.delete(`http://localhost:8000/api/admin/jobs/${jobId}`)
            fetchJobs()
        } catch (err) {
            alert("Error deleting job")
        }
    }

    const filteredJobs = jobs.filter(job => {
        const query = searchTerm.toLowerCase()
        return (
            job.title?.toLowerCase().includes(query) ||
            job.company_name?.toLowerCase().includes(query) ||
            job.location?.toLowerCase().includes(query) ||
            `#jp-${job.job_id?.substring(0, 4)}`.toLowerCase().includes(query)
        )
    })

    return (
        <DashboardLayout role="admin" userName={userName}>
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Active <span className="text-[#00B074]">Jobs</span></h2>
                        <p className="text-gray-500 font-bold mt-1">Review and manage {jobs.length} listed career opportunities.</p>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-wrap gap-4 shadow-sm items-center">
                    <div className="flex-grow flex items-center bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 group focus-within:ring-2 focus-within:ring-[#00B074]">
                        <Search className="text-gray-400 group-focus-within:text-[#00B074] transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search by job title, company, location, or ID..." 
                            className="w-full bg-transparent border-0 focus:ring-0 font-medium ml-3" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 font-bold text-gray-500 hover:bg-emerald-50 hover:text-[#00B074] transition-all">
                        <Filter size={18} /> Category
                    </button>
                    <button className="flex items-center gap-2 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 font-bold text-gray-500 hover:bg-emerald-50 hover:text-[#00B074] transition-all">
                        <MapPin size={18} /> Location
                    </button>
                </div>

                {/* Jobs List Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredJobs.map((job, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#00B074]/20 transition-all flex flex-col gap-6 group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00B074]/5 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform"></div>

                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-[#00B074]/40 group-hover:bg-[#00B074]/10 group-hover:text-[#00B074] transition-all shadow-sm">
                                        <Briefcase size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 group-hover:text-[#00B074] transition-colors">{job.title}</h3>
                                        <div className="flex items-center gap-2 mt-1 px-1">
                                            <span className="bg-emerald-50 text-[#00B074] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                                Active Job
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs font-bold text-gray-400 relative z-10 px-1">
                                <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-2xl border border-gray-100/50 group-hover:bg-white group-hover:border-[#00B074]/20 transition-all">
                                    <Building size={16} className="text-[#00B074]" />
                                    <span className="truncate">{job.company_name}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-2xl border border-gray-100/50 group-hover:bg-white group-hover:border-[#00B074]/20 transition-all">
                                    <MapPin size={16} className="text-[#00B074]" />
                                    <span>{job.location}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-2xl border border-gray-100/50 group-hover:bg-white group-hover:border-[#00B074]/20 transition-all">
                                    <Calendar size={16} className="text-[#00B074]" />
                                    <span>Updated recently</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-50 relative z-10">
                                <p className="text-xs font-bold text-gray-400">Apply ID: <span className="text-gray-900">#JP-{job.job_id?.substring(0, 4)}</span></p>
                                <button
                                    onClick={() => deleteJob(job.job_id)}
                                    className="flex items-center gap-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-sm hover:shadow-lg hover:shadow-red-100 active:scale-95"
                                >
                                    <Trash2 className="w-4 h-4" /> Remove Job
                                </button>
                            </div>
                        </motion.div>
                    ))}
                    {filteredJobs.length === 0 && (
                        <div className="col-span-full p-20 text-center flex flex-col items-center gap-4 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                            <div className="p-6 bg-gray-50 rounded-full text-gray-300">
                                <Briefcase size={48} />
                            </div>
                            <h3 className="text-xl font-black text-gray-400 italic">
                                {jobs.length === 0 ? "No job posts available to manage." : `No results found for "${searchTerm}"`}
                            </h3>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
