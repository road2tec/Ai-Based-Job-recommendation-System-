import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    LayoutDashboard, Users, Briefcase,
    ShieldCheck, LogOut, Menu, X,
    FileText, Target, Activity, Send,
    Settings, Bell, ChevronRight, Plus, FileCheck, User, CheckCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function DashboardLayout({ children, role, userName }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const location = useLocation()

    // Sidebar Links based on Role
    const adminLinks = [
        { name: 'Overview', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Review Applicants', path: '/admin/applicants', icon: <FileText size={20} /> },
        { name: 'Shortlisted Pool', path: '/admin/shortlisted', icon: <CheckCircle size={20} /> },
        { name: 'Manage People', path: '/admin/manage-users', icon: <Users size={20} /> },
        { name: 'Manage Jobs', path: '/admin/manage-jobs', icon: <Briefcase size={20} /> },
    ]

    const candidateLinks = [
        { name: 'My Dashboard', path: '/candidate/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'My Profile', path: '/candidate/profile', icon: <User size={20} /> },
        { name: 'Applied Jobs', path: '/candidate/applications', icon: <FileCheck size={20} /> },
        { name: 'My Resume', path: '/candidate/resume-upload', icon: <FileText size={20} /> },
        { name: 'Best Jobs', path: '/candidate/recommendations', icon: <Target size={20} /> },
        { name: 'Skill Check', path: '/candidate/skill-gap', icon: <Activity size={20} /> },
    ]

    const employerLinks = [
        { name: 'Dashboard', path: '/employer/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Add New Job', path: '/employer/post-job', icon: <Plus size={20} /> },
        { name: 'Applicants', path: '/employer/applicants', icon: <Users size={20} /> },
    ]

    const links = role === 'admin' ? adminLinks : role === 'employer' ? employerLinks : candidateLinks

    const handleLogout = () => {
        localStorage.clear()
        window.location.href = '/'
    }

    return (
        <div className="flex min-h-screen bg-[#F8F9FA]">
            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-full bg-white border-r border-gray-100 z-50 transition-all duration-300 ${isSidebarOpen ? 'w-72' : 'w-20'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="p-6 flex items-center justify-between">
                        {isSidebarOpen && (
                            <Link to="/" className="text-3xl font-black text-[#00B074]">Jobify</Link>
                        )}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-emerald-50 text-[#00B074] rounded-xl transition-colors"
                        >
                            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-grow px-4 py-6 flex flex-col gap-2">
                        {links.map((link) => {
                            const isActive = location.pathname === link.path
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group ${isActive ? 'bg-[#00B074] text-white shadow-lg shadow-emerald-200' : 'text-gray-500 hover:bg-emerald-50 hover:text-[#00B074]'}`}
                                >
                                    <div className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#00B074]'} transition-colors`}>
                                        {link.icon}
                                    </div>
                                    {isSidebarOpen && (
                                        <span className="font-bold tracking-tight">{link.name}</span>
                                    )}
                                    {isActive && isSidebarOpen && (
                                        <motion.div layoutId="activeDot" className="ml-auto w-2 h-2 bg-white rounded-full"></motion.div>
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-4 mt-auto">
                        <button
                            onClick={handleLogout}
                            className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all group`}
                        >
                            <LogOut size={20} />
                            {isSidebarOpen && <span className="font-bold tracking-tight">Sign Out</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-grow transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-20'}`}>
                {/* Page Content */}
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
