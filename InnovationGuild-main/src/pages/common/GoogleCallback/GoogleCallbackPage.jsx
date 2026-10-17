import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { login } from '../../../store/slices/authSlice'
import { setToken } from '../../../utils/tokenStore'
import { ROLE_TO_URL } from '../../../utils/constants/roles'

const GoogleCallbackPage = () => {
  const [searchParams] = useSearchParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const accessToken = searchParams.get('accessToken')
    const registrationComplete = searchParams.get('registrationComplete') === 'true'
    const role = searchParams.get('role')

    if (!accessToken || !role) {
      toast.error('Google sign-in failed. Please try again.')
      navigate('/login')
      return
    }

    const user = {
      id: searchParams.get('id'),
      email: searchParams.get('email'),
      role,
      status: searchParams.get('status'),
      fullName: searchParams.get('fullName'),
      profilePicture: searchParams.get('profilePicture'),
      registrationComplete,
    }

    dispatch(login({ user, accessToken }))
    setToken(accessToken)
    toast.success('Signed in with Google!')

    if (!registrationComplete) {
      const frontendRole = ROLE_TO_URL[role.toLowerCase()] || 'general_user'
      navigate(`/register?role=${frontendRole}`)
    } else {
      navigate('/')
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-light">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-accent-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-muted text-sm">Signing you in...</p>
      </div>
    </div>
  )
}

export default GoogleCallbackPage
