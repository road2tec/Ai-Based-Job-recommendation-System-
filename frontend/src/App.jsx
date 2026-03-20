import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import About from './pages/About'
import Contact from './pages/Contact'
import FindJobs from './pages/FindJobs'
import Features from './pages/Features'

// Candidate
import CandidateDashboard from './pages/candidate/Dashboard'
import ResumeUpload from './pages/candidate/ResumeUpload'
import Recommendations from './pages/candidate/Recommendations'
import SkillGap from './pages/candidate/SkillGap'
import MyApplications from './pages/candidate/MyApplications'
import CandidateProfile from './pages/candidate/CandidateProfile'

// Employer
import EmployerDashboard from './pages/employer/Dashboard'
import PostJob from './pages/employer/PostJob'
import Applicants from './pages/employer/Applicants'

// Admin
import AdminDashboard from './pages/admin/Dashboard'
import ManageUsers from './pages/admin/ManageUsers'
import ManageJobs from './pages/admin/ManageJobs'
import AdminApplicants from './pages/admin/AdminApplicants'
import ShortlistedTalent from './pages/admin/ShortlistedTalent'

import Chatbot from './components/Chatbot'

function AppContent() {
  const location = useLocation();
  const hideNavPaths = ['/login', '/signup'];
  const isDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/candidate') || location.pathname.startsWith('/employer');
  const shouldHideNav = hideNavPaths.includes(location.pathname) || isDashboard;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {!shouldHideNav && <Navbar />}
      {location.pathname.startsWith('/candidate') && <Chatbot />}
      <main className={`flex-grow flex flex-col ${!shouldHideNav ? 'pt-16' : ''}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/jobs" element={<FindJobs />} />
          <Route path="/features" element={<Features />} />

          {/* Candidate Routes */}
          <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
          <Route path="/candidate/applications" element={<MyApplications />} />
          <Route path="/candidate/profile" element={<CandidateProfile />} />
          <Route path="/candidate/resume-upload" element={<ResumeUpload />} />
          <Route path="/candidate/recommendations" element={<Recommendations />} />
          <Route path="/candidate/skill-gap" element={<SkillGap />} />

          {/* Employer Routes */}
          <Route path="/employer/dashboard" element={<EmployerDashboard />} />
          <Route path="/employer/post-job" element={<PostJob />} />
          <Route path="/employer/applicants" element={<Applicants />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/applicants" element={<AdminApplicants />} />
          <Route path="/admin/manage-users" element={<ManageUsers />} />
          <Route path="/admin/manage-jobs" element={<ManageJobs />} />
          <Route path="/admin/shortlisted" element={<ShortlistedTalent />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
