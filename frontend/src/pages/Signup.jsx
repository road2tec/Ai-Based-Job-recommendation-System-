import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, User, Mail, Lock, ChevronDown, ArrowLeft, Building, MapPin, Phone } from 'lucide-react'

export default function Signup() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'candidate' })
    const [loading, setLoading] = useState(false)
    const [showOTP, setShowOTP] = useState(false)
    const [otp, setOtp] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await axios.post('http://localhost:8000/api/auth/signup', formData)
            if (formData.role === 'employer') {
                setShowOTP(true)
                alert("An OTP has been sent to your email for verification.")
            } else {
                alert("Success! Now you can log in.")
                navigate('/login')
            }
        } catch (err) {
            alert("Oops! " + (err.response?.data?.detail || "Something went wrong. Please try again."))
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOTP = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await axios.post('http://localhost:8000/api/auth/verify-otp', { email: formData.email, otp })
            alert("Success! Email verified. You can now log in.")
            navigate('/login')
        } catch (err) {
            alert(err.response?.data?.detail || "Invalid or expired OTP")
        } finally {
            setLoading(false)
        }
    }

    const handleResendOTP = async () => {
        try {
            await axios.post('http://localhost:8000/api/auth/resend-otp', { email: formData.email })
            alert("OTP Resent successfully!")
        } catch (err) {
            alert("Error resending OTP")
        }
    }

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F8F9FA] overflow-hidden relative">
            {/* Floating Back Button */}
            <Link
                to="/"
                className="absolute top-8 left-8 md:left-auto md:right-8 z-30 flex items-center gap-2 text-gray-500 hover:text-[#00B074] font-bold transition-all bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-gray-100 group"
            >
                <motion.span
                    initial={{ x: 0 }}
                    whileHover={{ x: -4 }}
                >
                    <ArrowLeft size={20} />
                </motion.span>
                Back to Home
            </Link>

            {/* Left Side: Solid Green + Image + Bold Text */}
            <div className="hidden md:flex md:w-5/12 bg-[#00B074] relative items-center justify-center p-16 text-white overflow-hidden">
                {/* Background Image overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 scale-110"
                    style={{ backgroundImage: `url(/hero-bg.png)` }}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#00B074]/90 to-black/30"></div>

                <div className="relative z-10 max-w-sm">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <div className="w-16 h-1 bg-white mb-8 rounded-full"></div>
                        <h1 className="text-7xl font-black leading-[1.1] mb-8 tracking-tighter">Start <br /> Today.</h1>
                        <p className="text-xl font-medium opacity-80 leading-relaxed">
                            Join thousands of users finding their dream jobs using our smart AI analysis.
                        </p>

                        <div className="mt-16 space-y-4">
                            {[
                                "AI Resume Scanner",
                                "Instant Job Alerts",
                                "Employer Direct Chat"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    </div>
                                    <span className="font-bold opacity-90">{item}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            </div>

            {/* Right Side: Modern Form */}
            <div className="w-full md:w-7/12 flex items-center justify-center p-8 md:p-20 bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.02)] relative z-20">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-xl"
                >
                    <div className="mb-10 flex flex-col items-center md:items-start text-center md:text-left">
                        <Link to="/" className="bg-emerald-50 p-3 rounded-xl mb-6 inline-block hover:scale-105 transition-transform">
                            <h2 className="text-3xl font-black text-[#00B074]">Jobify</h2>
                        </Link>
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Create Account</h2>
                        <p className="text-gray-500 font-bold text-lg">Quick and simple setup.</p>
                    </div>

                    {!showOTP ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#00B074] transition-colors" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Your name"
                                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00B074]/20 focus:border-[#00B074] focus:bg-white transition-all font-medium"
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#00B074] transition-colors" />
                                        <input
                                            type="email"
                                            required
                                            placeholder="name@email.com"
                                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00B074]/20 focus:border-[#00B074] focus:bg-white transition-all font-medium"
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </motion.div>
                            </div>

                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Set Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#00B074] transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="Min. 6 characters"
                                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00B074]/20 focus:border-[#00B074] focus:bg-white transition-all font-medium"
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </motion.div>

                            <AnimatePresence>
                                {formData.role === 'employer' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-6 pt-2"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Organization Name</label>
                                                <div className="relative group">
                                                    <Building className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#00B074] transition-colors" />
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="e.g. Google, Microsoft, TCS"
                                                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00B074]/20 focus:border-[#00B074] focus:bg-white transition-all font-medium"
                                                        onChange={e => setFormData({ ...formData, organization_name: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Contact Number</label>
                                                <div className="relative group">
                                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#00B074] transition-colors" />
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Phone Number"
                                                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00B074]/20 focus:border-[#00B074] focus:bg-white transition-all font-medium"
                                                        onChange={e => setFormData({ ...formData, contact_number: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Company Address</label>
                                            <div className="relative group">
                                                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#00B074] transition-colors" />
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Street, City, Country"
                                                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00B074]/20 focus:border-[#00B074] focus:bg-white transition-all font-medium"
                                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Account Type</label>
                                <div className="relative mt-2">
                                    <select
                                        className="w-full pl-6 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00B074]/20 focus:border-[#00B074] focus:bg-white transition-all font-bold text-gray-700 appearance-none cursor-pointer"
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="candidate">I want a job</option>
                                        <option value="employer">I want to hire people</option>
                                    </select>
                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                </div>
                            </motion.div>

                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-[#00B074] text-white rounded-2xl font-black text-lg hover:bg-[#009663] transition-all shadow-xl shadow-emerald-200 disabled:opacity-70 mt-6 relative overflow-hidden group"
                            >
                                <span className="relative z-10">{loading ? "Joining..." : "Join Now"}</span>
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-30deg]"></div>
                            </motion.button>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            <div className="text-center">
                                <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-[#00B074] mx-auto mb-6 shadow-sm">
                                    <Mail size={40} />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 mb-2">Verify Email</h2>
                                <p className="text-gray-500 font-bold">We've sent a 6-digit code to <br /><span className="text-[#00B074]">{formData.email}</span></p>
                            </div>

                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                <div className="flex justify-center">
                                    <input
                                        type="text"
                                        maxLength="6"
                                        required
                                        placeholder="······"
                                        className="w-full max-w-[280px] text-center text-4xl tracking-[1.5rem] font-black py-6 bg-gray-50 border border-gray-100 rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#00B074]/20 focus:border-[#00B074] focus:bg-white transition-all text-gray-800 placeholder:text-gray-200"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    type="submit"
                                    disabled={loading || otp.length < 6}
                                    className="w-full py-5 bg-[#00B074] text-white rounded-2xl font-black text-lg hover:bg-[#009663] transition-all shadow-xl shadow-emerald-200 disabled:opacity-50"
                                >
                                    {loading ? "Verifying..." : "Verify & Continue"}
                                </motion.button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        className="text-gray-400 hover:text-[#00B074] font-bold transition-colors"
                                    >
                                        Didn't receive the code? Resend
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowOTP(false)}
                                    className="w-full text-center text-gray-400 font-bold hover:underline"
                                >
                                    Back to Registration
                                </button>
                            </form>
                        </motion.div>
                    )}

                    <p className="mt-8 text-center text-gray-400 font-bold">
                        Already have an account? <Link to="/login" className="text-[#00B074] ml-1 hover:underline underline-offset-4">Log in</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
