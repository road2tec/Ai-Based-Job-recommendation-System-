import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { UserCircle, Mail, Target, Briefcase, Globe, Download, Search } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import { motion } from 'framer-motion'

export default function ShortlistedTalent() {
    const [shortlisted, setShortlisted] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const userName = localStorage.getItem('userName') || "Admin"

    useEffect(() => {
        const fetchShortlisted = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/admin/shortlisted')
                setShortlisted(res.data)
            } catch (err) { }
            setLoading(false)
        }
        fetchShortlisted()
    }, [])

    const filtered = shortlisted.filter(item => 
        item.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.job?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout role="admin" userName={userName}>
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, y: 0 }}>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Shortlisted <span className="text-[#00B074]">Talent</span></h2>
                        <p className="text-gray-500 font-bold mt-1">Viewing all candidates who have moved to the next round.</p>
                    </motion.div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-grow">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text"
                                placeholder="Search by name, job, or company..."
                                className="w-full md:w-80 bg-white border border-gray-100 pl-12 pr-6 py-3 rounded-2xl focus:ring-2 focus:ring-[#00B074] transition-all font-bold shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-emerald-50 border-t-[#00B074] rounded-full animate-spin"></div>
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading talent pool...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center gap-6 bg-white rounded-[3rem] border border-dashed border-gray-200">
                        <div className="bg-gray-50 p-6 rounded-full text-gray-300">
                            <UserCircle size={48} />
                        </div>
                        <h3 className="text-xl font-black text-gray-400 italic">No shortlisted candidates found.</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#00B074]/30 transition-all group flex flex-col gap-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#00B074] shadow-inner font-black text-xl">
                                            {item.user?.name?.charAt(0) || "U"}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900 group-hover:text-[#00B074] transition-colors">{item.user?.name}</h3>
                                            <p className="text-gray-400 font-bold text-xs lowercase flex items-center gap-1.5"><Mail size={12} /> {item.user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                        <span className="text-[10px] font-black text-[#00B074] uppercase tracking-widest">{item.match_score}% Fit</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                        <Briefcase size={16} className="text-gray-400" />
                                        <span>{item.job?.title}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-400">
                                        <Globe size={16} className="text-gray-300" />
                                        <span>{item.job?.company_name}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Shortlisted</span>
                                    <button className="text-[#00B074] hover:bg-emerald-50 p-2 rounded-xl transition-all" title="View Details">
                                        <Target size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
