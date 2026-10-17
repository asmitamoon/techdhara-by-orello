import { useEffect, useLayoutEffect, useState, useMemo } from 'react'
import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route, Navigate, Outlet, useNavigate } from 'react-router'
import { Toaster, toast } from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { login, selectIsLoggedIn, selectUser, selectUserRole } from './store/slices/authSlice'
import api, { refreshAccessToken } from './api/axiosInstance'
import { ROLE_TO_URL } from './utils/constants/roles'

const RequireProfileComplete = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const user = useSelector(selectUser)
  if (isLoggedIn && user?.registrationComplete === false) {
    const role = ROLE_TO_URL[user.role?.toLowerCase()] || user.role?.toLowerCase()
    return <Navigate to={`/register?role=${role}`} replace />
  }
  return <Outlet />
}

const RequireGuest = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const user = useSelector(selectUser)
  if (!isLoggedIn) return <Outlet />
  if (user?.registrationComplete === false) {
    const role = ROLE_TO_URL[user.role?.toLowerCase()] || user.role?.toLowerCase()
    return <Navigate to={`/register?role=${role}`} replace />
  }
  return <Navigate to="/" replace />
}

const RequireRegistrationAllowed = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const user = useSelector(selectUser)
  if (isLoggedIn && user?.registrationComplete !== false) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}

// Admin has no profile model — registrationComplete is always true from backend, no check needed
const RequireSuperAdmin = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const userRole = useSelector(selectUserRole)
  if (!isLoggedIn) return <Navigate to="/admin/login" replace />
  if (userRole !== 'super_admin') return <Navigate to="/admin" replace />
  return <Outlet />
}

const RequireAdmin = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const userRole = useSelector(selectUserRole)
  if (!isLoggedIn) return <Navigate to="/admin/login" replace />
  if (userRole !== 'admin' && userRole !== 'super_admin') return <Navigate to="/" replace />
  return <Outlet />
}

const RequireAdminGuest = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const userRole = useSelector(selectUserRole)
  if (!isLoggedIn) return <Outlet />
  if (userRole === 'admin' || userRole === 'super_admin') return <Navigate to="/admin" replace />
  return <Navigate to="/" replace />
}

const RequireAo = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const userRole = useSelector(selectUserRole)
  const user = useSelector(selectUser)
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (userRole !== 'ao') return <Navigate to="/" replace />
  if (user?.registrationComplete === false) return <Navigate to="/register?role=affiliated_organization" replace />
  return <Outlet />
}

const RequireNo = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const userRole = useSelector(selectUserRole)
  const user = useSelector(selectUser)
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (userRole !== 'no') return <Navigate to="/" replace />
  if (user?.registrationComplete === false) return <Navigate to="/register?role=nodal_organization" replace />
  return <Outlet />
}

const RequireInnovator = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const userRole = useSelector(selectUserRole)
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (userRole !== 'innovator') return <Navigate to="/" replace />
  return <Outlet />
}

const RequireProblemAccess = () => {
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const userRole = useSelector(selectUserRole)
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (!['vle', 'ao', 'no'].includes(userRole)) return <Navigate to="/" replace />
  return <Outlet />
}

const RequireApprovedUser = () => {
  const navigate = useNavigate()
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const user = useSelector(selectUser)

  useLayoutEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true })
    } else if (user?.status !== 'APPROVED') {
      toast.error('Your account is not approved yet')
      navigate(-1)
    }
  }, [isLoggedIn, user, navigate])

  if (!isLoggedIn || user?.status !== 'APPROVED') return null
  return <Outlet />
}

const RootLayout = () => (
  <>
    <ScrollToTop />
    <Outlet />
  </>
)

// Import pages
import Home from './pages/common/Home/Home'
import Innovations_Common from './pages/common/Innovations/Innovations'
import InnovationDetails_Common from './pages/common/InnovationDetails/InnovationDetails'
import Problems_Common from './pages/common/Problems/Problems'
import ProblemDetails_Common from './pages/common/ProblemDetails/ProblemDetails'
import VleListing from './pages/common/VleListing/VleListing'
import UserProfile from './pages/common/UserProfile/UserProfile'
import ProblemSubmissionPage from './pages/common/ProblemSubmission/ProblemSubmissionPage'
import InnovationSubmissionPage from './pages/common/InnovationSubmission/InnovationSubmissionPage'
import RegisterPage from './pages/common/Register/RegisterPage'
import LoginPage from './pages/common/Login/LoginPage'
import EditProfilePage from './pages/common/EditProfile/EditProfilePage'
import ScrollToTop from './helpers/ScrollToTop'
import DashboardOverview from './pages/admin/Overview/DashboardOverview'
import AdminManagement from './pages/admin/AdminManagement/AdminManagement'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import OrganizationLayout from './layouts/OrganizationLayout'
import SavedInnovations from './pages/common/SavedInnovation/SavedInnovation'
import SavedProblems from './pages/common/SavedProblems/SavedProblems'
import MyProblemStatements from './pages/common/MyProblemStatements/MyProblemStatements'
import MyInnovations from './pages/common/MyInnovations/MyInnovations'
import Notifications from './pages/common/Notifications/Notifications'
import Bookkeeping from './pages/common/Bookkeeping/Bookkeeping'
import BookkeepingDetails from './pages/common/BookkeepingDetails/BookkeepingDetails'
import BookkeepingEntries from './pages/common/BookkeepingEntries/BookkeepingEntries'
import BookkeepingEntryView from './pages/common/BookkeepingEntryView/BookkeepingEntryView'
import RegistrationDetails from './pages/common/RegistrationDetails/RegistrationDetails'
import SavedProfiles from './pages/common/SavedProfiles/SavedProfiles'
import Innovators from './pages/admin/Innovators/Innovators.jsx'
import InnovatorDetails from './pages/admin/InnovatorDetails/InnovatorDetails.jsx'
import Innovations from './pages/admin/Innovations/Innovations.jsx'
import InnovationDetails from './pages/admin/InnovationDetails/InnovationDetails.jsx'
import OrganizationInnovationDetails from './pages/organization/InnovationDetails/OrganizationInnovationDetails.jsx'
import OrgProblemView from './pages/organization/ProblemView/OrgProblemView.jsx'
import Problems from './pages/admin/Problems/Problems.jsx'
import ProblemDetails from './pages/admin/ProblemDetails/ProblemDetails.jsx'
import BusinessModel from './pages/admin/BusinessModel/BusinessModel.jsx'
import BookkeepingsAdmin from './pages/admin/Bookkeepings/BookkeepingsAdmin.jsx'
import BookkeepingDetailsAdmin from './pages/admin/BookkeepingDetails/BookkeepingDetailsAdmin.jsx'
import Pilot from './pages/admin/../admin/Pilots/Pilots.jsx'
import ProfileVisits from './pages/admin/ProfileVisits/ProfileVisits.jsx'
import BusinessModels from './pages/common/BusinessModels/BusinessModels'
import BusinessModelDetails from './pages/common/BusinessModelDetails/BusinessModelDetails'

import OrganizationOverview from './pages/organization/OrganizationOverview/OrganizationOverview.jsx'
import AboutUs from './pages/common/AboutUs/AboutUs.jsx'

import SimilarProblemsFaced from './pages/common/SimilarProblemsFaced/SimilarProblemsFaced.jsx'
import AffiliatedOrganizations from './pages/admin/AffiliatedOrganizations/AffiliatedOrganizations.jsx'
import AffiliatedOrganizationDetails from './pages/admin/AffiliatedOrganizationDetails/AffiliatedOrganizationDetails.jsx'
import NodalOrganizations from './pages/admin/NodalOrganizations/NodalOrganizations.jsx'
import NodalOrganizationDetails from './pages/admin/NodalOrganizationDetails/NodalOrganizationDetails.jsx'
import VLEs from './pages/admin/VLEs/VLEs.jsx'
import VLEDetails from './pages/admin/VLEDetails/VLEDetails.jsx'
import OrganizationVLEs from './pages/organization/VLEs/OrganizationVLEs.jsx'
import OrganizationVLEDetails from './pages/organization/VLEDetails/OrganizationVLEDetails.jsx'
import OrganizationProblems from './pages/organization/Problems/OrganizationProblems.jsx'
import OrganizationProblemDetails from './pages/organization/ProblemDetails/OrganizationProblemDetails.jsx'
import OrganizationBusinessModel from './pages/organization/BusinessModel/OrganizationBusinessModel.jsx'
import OrganizationPilots from './pages/organization/Pilots/OrganizationPilots.jsx'
import OrganizationProblemSubmission from './pages/organization/ProblemSubmission/OrganizationProblemSubmission.jsx'
import OrganizationBookkeepings from './pages/organization/Bookkeepings/OrganizationBookkeepings.jsx'
import OrganizationBookkeepingDetails from './pages/organization/BookkeepingDetails/OrganizationBookkeepingDetails.jsx'
import OrganizationFieldReports from './pages/organization/FieldReports/OrganizationFieldReports.jsx'
import OrganizationFieldReportDetails from './pages/organization/FieldReportDetails/OrganizationFieldReportDetails.jsx'
import FieldReports from './pages/admin/FieldReports/FieldReports.jsx'
import FieldReportDetails from './pages/admin/FieldReportDetails/FieldReportDetails.jsx'
import FieldReportSubmission from './pages/admin/FieldReportSubmission/FieldReportSubmission.jsx'
import NOAffiliatedOrganizations from './pages/organization/NOAffiliatedOrganizations/NOAffiliatedOrganizations.jsx'
import NOAffiliatedOrganizationDetails from './pages/organization/NOAffiliatedOrganizationDetails/NOAffiliatedOrganizationDetails.jsx'
import OrganizationFieldReportSubmission from './pages/organization/FieldReportSubmission/OrganizationFieldReportSubmission.jsx'
import VLERegistration from './pages/organization/VLERegistration/VLERegistration.jsx'
import AORegistration from './pages/organization/AORegistration/AORegistration.jsx'
import AdminNotifications from './pages/admin/AdminNotifications/AdminNotifications.jsx'
import OrganizationNotifications from './pages/organization/OrganizationNotifications/OrganizationNotifications.jsx'
import ReportAndAnalitics from './pages/admin/ReportsAndAnaliticts/ReportAndAnalitics.jsx'
import NewsletterSubscriptions from './pages/admin/Newsletter/NewsletterSubscriptions.jsx'
import GoogleCallbackPage from './pages/common/GoogleCallback/GoogleCallbackPage.jsx'
import AdminLoginPage from './pages/admin/Login/AdminLoginPage'
import NotFound from './pages/common/NotFound/NotFound'


const App = () => {
  const dispatch = useDispatch();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    refreshAccessToken()
      .then((accessToken) =>
        api.get('/auth/me').then((res) => {
          const user = res.data.data.user;
          dispatch(login({ user, accessToken }));
        })
      )
      .catch(() => { /* no active session — stay logged out */ })
      .finally(() => setAuthReady(true));
  }, []);

  const router = useMemo(() => createBrowserRouter(createRoutesFromElements(
    <Route element={<RootLayout />}>
      <Route element={<PublicLayout />}>
          {/* Auth pages — redirect away if already logged in */}
          <Route element={<RequireRegistrationAllowed />}>
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route element={<RequireGuest />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

          {/* Redirect to profile form if registration incomplete */}
          <Route element={<RequireProfileComplete />}>
            <Route path="/" element={<Home />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/edit-profile" element={<EditProfilePage />} />
            <Route path="/registration-details" element={<RegistrationDetails />} />
            <Route path="/innovations" element={<Innovations_Common />} />
            <Route path="/innovations/:id/:slug?" element={<InnovationDetails_Common />} />
            <Route path="/problems" element={<Problems_Common />} />
            <Route path="/problems/:id/:slug?" element={<ProblemDetails_Common />} />
            <Route path="/myprofile" element={<UserProfile isOwnProfileRoute={true} />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route element={<RequireProblemAccess />}>
              <Route path="/submit-problem" element={<ProblemSubmissionPage />} />
              <Route path="/submit-problem/:type/:id" element={<ProblemSubmissionPage />} />
            </Route>
            <Route element={<RequireInnovator />}>
              <Route path="/submit-innovation" element={<InnovationSubmissionPage />} />
              <Route path="/submit-innovation/:id" element={<InnovationSubmissionPage />} />
            </Route>
            <Route path="/vles" element={<VleListing />} />
            <Route element={<RequireApprovedUser />}>
              <Route path="/profile/:id" element={<UserProfile />} />
            </Route>
            <Route path="/saved-innovations" element={<SavedInnovations />} />
            <Route path="/saved-problems" element={<SavedProblems />} />
            <Route path="/saved-profiles" element={<SavedProfiles />} />
            <Route path="/my-problem-statements" element={<MyProblemStatements />} />
            <Route path="/my-innovations" element={<MyInnovations />} />
            <Route path="/similar-problems-faced" element={<SimilarProblemsFaced />} />
            <Route path="/bookkeeping" element={<Bookkeeping />} />
            <Route path="/bookkeeping/:id" element={<BookkeepingEntries />} />
            <Route path="/bookkeeping/:id/new" element={<BookkeepingDetails />} />
            <Route path="/bookkeeping/:id/:entryId" element={<BookkeepingEntryView />} />
            <Route path="/business-models" element={<BusinessModels />} />
            <Route path="/business-models/:id" element={<BusinessModelDetails />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin login — standalone, outside AdminLayout */}
        <Route element={<RequireAdminGuest />}>
          <Route path="/admin/login" element={<AdminLoginPage />} />
        </Route>

        {/* Admin dashboard */}
        <Route element={<RequireAdmin />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="nodal-organizations" element={<NodalOrganizations />} />
          <Route path="nodal-organizations/:noId" element={<NodalOrganizationDetails />} />
          <Route element={<RequireSuperAdmin />}>
            <Route path="admin-management" element={<AdminManagement />} />
          </Route>
          <Route path="affiliated-organizations" element={<AffiliatedOrganizations />} />
          <Route path="affiliated-organizations/:aoId" element={<AffiliatedOrganizationDetails />} />
          <Route path="vles" element={<VLEs />} />
          <Route path="vles/:vleId">
            <Route index element={<VLEDetails />} />
            <Route path="pilots/:pilotId/business-model" element={<BusinessModel />} />
            <Route path="bookkeepings" element={<BookkeepingsAdmin />} />
            <Route path="bookkeepings/:bookkeepingId" element={<BookkeepingDetailsAdmin />} />
            <Route path="field-reports" element={<FieldReports />} />
            <Route path="field-reports/new" element={<FieldReportSubmission />} />
            <Route path="field-reports/:reportId" element={<FieldReportDetails />} />
          </Route>
          <Route path="innovators" element={<Innovators />} />
          <Route path="innovators/:innovatorId" element={<InnovatorDetails />} />
          <Route path="innovations" element={<Innovations />} />
          <Route path="innovations/:innovationId" element={<InnovationDetails />} />
          <Route path="problems" element={<Problems />} />
          <Route path="problems/innovation-request/:problemId" element={<ProblemDetails />} />
          <Route path="problems/service-request/:problemId" element={<ProblemDetails />} />
          <Route path="pilots" element={<Pilot />} />
          <Route path="profile-visits" element={<ProfileVisits />} />
          <Route path="report-analitics" element={<ReportAndAnalitics />} />
          <Route path="newsletter" element={<NewsletterSubscriptions />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        </Route>

        {/* AO dashboard */}
        <Route element={<RequireAo />}>
        <Route path="/ao" element={<OrganizationLayout />}>
          <Route index element={<OrganizationOverview />} />
          <Route path="vles" element={<OrganizationVLEs />} />
          <Route path="vles/register" element={<VLERegistration />} />
          <Route path="notifications" element={<OrganizationNotifications />} />
          <Route path="vles/:id">
            <Route index element={<OrganizationVLEDetails />} />
            <Route path="pilots/:pilotId/business-model" element={<OrganizationBusinessModel />} />
            <Route path="bookkeepings" element={<OrganizationBookkeepings />} />
            <Route path="bookkeepings/:bookkeepingId" element={<OrganizationBookkeepingDetails />} />
            <Route path="field-reports" element={<OrganizationFieldReports />} />
            <Route path="field-reports/new" element={<OrganizationFieldReportSubmission />} />
            <Route path="field-reports/:reportId" element={<OrganizationFieldReportDetails />} />
            <Route path="submit-problem" element={<OrganizationProblemSubmission />} />
          </Route>
          <Route path="problems" element={<OrganizationProblems />} />
          <Route path="problems/innovation-request/:id" element={<OrganizationProblemDetails />} />
          <Route path="problems/innovation-request/:id/view" element={<OrgProblemView />} />
          <Route path="problems/service-request/:id" element={<OrganizationProblemDetails />} />
          <Route path="innovations/:id" element={<OrganizationInnovationDetails />} />
          <Route path="pilots" element={<OrganizationPilots />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        </Route>

        {/* NO dashboard */}
        <Route element={<RequireNo />}>
        <Route path="/no" element={<OrganizationLayout />}>
          <Route index element={<OrganizationOverview />} />
          <Route path="affiliated-organizations" element={<NOAffiliatedOrganizations />} />
          <Route path="affiliated-organizations/register" element={<AORegistration />} />
          <Route path="affiliated-organizations/:id" element={<NOAffiliatedOrganizationDetails />} />
          <Route path="notifications" element={<OrganizationNotifications />} />
          <Route path="vles" element={<OrganizationVLEs />} />
          <Route path="vles/:id">
            <Route index element={<OrganizationVLEDetails />} />
            <Route path="pilots/:pilotId/business-model" element={<OrganizationBusinessModel />} />
            <Route path="bookkeepings" element={<OrganizationBookkeepings />} />
            <Route path="bookkeepings/:bookkeepingId" element={<OrganizationBookkeepingDetails />} />
            <Route path="field-reports" element={<OrganizationFieldReports />} />
            <Route path="field-reports/new" element={<OrganizationFieldReportSubmission />} />
            <Route path="field-reports/:reportId" element={<OrganizationFieldReportDetails />} />
            <Route path="submit-problem" element={<OrganizationProblemSubmission />} />
          </Route>
          <Route path="problems" element={<OrganizationProblems />} />
          <Route path="problems/innovation-request/:id" element={<OrganizationProblemDetails />} />
          <Route path="problems/innovation-request/:id/view" element={<OrgProblemView />} />
          <Route path="problems/service-request/:id" element={<OrganizationProblemDetails />} />
          <Route path="innovations/:id" element={<OrganizationInnovationDetails />} />
          <Route path="pilots" element={<OrganizationPilots />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        </Route>
        {/* Root-level catch-all */}
        <Route path="*" element={<NotFound />} />
      </Route>
    )), [])

  if (!authReady) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #8BAD8E', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#FFFFFF',
            color: '#123E39',
            border: '1px solid #8BAD8E',
            borderRadius: '12px',
            padding: '16px 20px',
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 4px 12px rgba(18, 62, 57, 0.1)',
          },
          success: {
            iconTheme: { primary: '#649769', secondary: '#FFFFFF' },
            style: { border: '1px solid #649769' },
          },
          error: {
            iconTheme: { primary: '#A3733E', secondary: '#FFFFFF' },
            style: { border: '1px solid #A3733E' },
          },
        }}
      />
      <RouterProvider router={router} />
    </>
  )
}

export default App
