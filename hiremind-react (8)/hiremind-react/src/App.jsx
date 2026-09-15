

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import CandidateLayout from './pages/candidate/CandidateLayout';
import Resume from './pages/candidate/Resume';
import AchievementsUpload from './pages/candidate/AchievementsUpload';
import Jobs from './pages/candidate/Jobs';
import ChooseCompany from './pages/candidate/ChooseCompany';
import CompanyProfile from './pages/candidate/CompanyProfile';
import Applications from './pages/candidate/Applications';
import Assessments from './pages/candidate/Assessments';
import Interviews from './pages/candidate/Interviews';
import SecureAssessment from './pages/candidate/SecureAssessment';
import RecruiterLayout from './pages/recruiter/RecruiterLayout';
import Analytics from './pages/recruiter/Analytics';
import PostJob from './pages/recruiter/PostJob';
import Pipeline from './pages/recruiter/Pipeline';
import AdminLayout from './pages/admin/AdminLayout';
import Overview from './pages/admin/Overview';
import Users from './pages/admin/Users';
import AllJobs from './pages/admin/AllJobs';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/candidate/assessment/:assessmentId"
              element={
                <ProtectedRoute role="candidate">
                  <SecureAssessment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidate"
              element={
                <ProtectedRoute role="candidate">
                  <CandidateLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Resume />} />
              <Route path="achievements" element={<AchievementsUpload />} />
              <Route path="jobs" element={<Jobs />} />
              <Route path="companies" element={<ChooseCompany />} />
              <Route path="companies/:companyId" element={<CompanyProfile />} />
              <Route path="applications" element={<Applications />} />
              <Route path="assessments" element={<Assessments />} />
              <Route path="interviews" element={<Interviews />} />
            </Route>
            <Route
              path="/recruiter"
              element={
                <ProtectedRoute role="recruiter">
                  <RecruiterLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Analytics />} />
              <Route path="post-job" element={<PostJob />} />
              <Route path="pipeline" element={<Pipeline />} />
            </Route>
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Overview />} />
              <Route path="users" element={<Users />} />
              <Route path="jobs" element={<AllJobs />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
