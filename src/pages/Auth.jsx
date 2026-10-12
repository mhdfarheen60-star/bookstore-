import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { faEye, faEyeSlash, faBook, faArrowRight, faCheckCircle, faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../context/useAuth'
import { homeForRole } from '../components/roleRoutes'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const STRONG_RE = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/

const inputBase =
  'w-full h-12 rounded-lg border bg-white/5 px-4 text-base text-white outline-none transition placeholder:text-white/35 focus:bg-white/10 focus:ring-4 sm:text-sm disabled:opacity-60'
const inputOk = 'border-yellow-400/15 focus:border-yellow-400 focus:ring-yellow-400/10'
const inputBad = 'border-red-500 focus:border-red-500 focus:ring-red-500/10'

function validate(values, isLogin) {
  const errors = {}
  if (!isLogin) {
    if (values.name.trim().length < 2) errors.name = 'Please enter your full name'
    if (!values.confirmPassword) errors.confirmPassword = 'Please confirm your password'
    else if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match'
  }
  if (!values.email.trim()) errors.email = 'Email is required'
  else if (!EMAIL_RE.test(values.email)) errors.email = 'Please enter a valid email address'

  if (!values.password) errors.password = 'Password is required'
  else if (!isLogin && (values.password.length < 8 || !STRONG_RE.test(values.password)))
    errors.password = 'Min 8 characters with uppercase, lowercase and a number'
  return errors
}

function Field({ label, name, error, disabled, children, ...props }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-white/70">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`${inputBase} ${error ? inputBad : inputOk} ${children ? 'pr-12' : ''}`}
          {...props}
        />
        {children}
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

function PasswordToggle({ shown, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? 'Hide password' : 'Show password'}
      className="absolute top-1/2 right-3 -translate-y-1/2 text-white/40 transition-colors hover:text-white/70"
    >
      <FontAwesomeIcon icon={shown ? faEyeSlash : faEye} />
    </button>
  )
}

function Auth({ mode = 'login' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register } = useAuth()
  const isLogin = mode === 'login'

  // Where a route guard wanted us to go before it bounced us here.
  const from = location.state?.from

  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [apiError, setApiError] = useState('')
  const timers = useRef([])

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = validate(values, isLogin)
    setErrors(found)
    if (Object.keys(found).length) return

    setStatus('submitting')
    setApiError('')

    try {
      let response;
      if (isLogin) {
        response = await login(values.email, values.password);
      } else {
        response = await register({
          name: values.name,
          email: values.email,
          password: values.password,
        });
      }

      if (response.success) {
        setStatus('success')
        // Signing in: honour the guarded destination, otherwise send each role
        // to its own landing page. Signing up: go to login, as before.
        let target
        if (isLogin) {
          target = from || homeForRole(response.role)
        } else {
          target = '/login'
        }
        timers.current.push(setTimeout(() => navigate(target), 1200))
      } else {
        setStatus('error')
        setApiError(response.message || 'Authentication failed')
        if (response.errors) {
          const fieldErrors = {}
          response.errors.forEach(err => fieldErrors[err.field] = err.message)
          setErrors(fieldErrors)
        }
      }
    } catch (error) {
      setStatus('error')
      setApiError(error.message || 'Network error. Please try again.')
    }
  }

  const busy = status !== 'idle'

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://retrounite.files.wordpress.com/2022/08/books_on_notenbohm_zaal.jpg"
          alt=""
          fetchPriority="high"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.6)_100%)]" />
      </div>

      {/* Card */}
      <div className="animate-fade-in-up relative w-full max-w-md rounded-2xl border border-yellow-400/10 bg-black/55 p-6 backdrop-blur-xl sm:p-9">
        <div className="mb-5 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-yellow-500/40 bg-black/30">
            <FontAwesomeIcon icon={faBook} className="text-3xl text-yellow-400" />
          </div>
        </div>

        <div className="mb-7 text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl">BOOK STORE</h1>
          <p className="mt-1.5 text-base font-light text-yellow-400/90 sm:text-lg">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {status === 'success' && (
          <div role="alert" className="mb-5 flex items-center justify-center gap-2 rounded-lg border border-green-400/25 bg-green-500/15 p-3">
            <FontAwesomeIcon icon={faCheckCircle} className="text-xl text-green-400" />
            <p className="text-sm text-white">{isLogin ? 'Signed in successfully' : 'Account created'}</p>
          </div>
        )}

        {status === 'error' && apiError && (
          <div role="alert" className="mb-5 flex items-center justify-center gap-2 rounded-lg border border-red-400/25 bg-red-500/15 p-3">
            <FontAwesomeIcon icon={faCircleExclamation} className="text-xl text-red-400" />
            <p className="text-sm text-white">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {!isLogin && (
            <Field label="Full Name" name="name" value={values.name} onChange={handleChange}
              error={errors.name} disabled={busy} placeholder="Enter your full name" autoComplete="name" />
          )}

          <Field label="Email Address" name="email" type="email" value={values.email} onChange={handleChange}
            error={errors.email} disabled={busy} placeholder="you@example.com" autoComplete="email" />

          <div>
            <Field label="Password" name="password" type={showPassword ? 'text' : 'password'}
              value={values.password} onChange={handleChange} error={errors.password} disabled={busy}
              placeholder={isLogin ? 'Enter your password' : 'Create a strong password'}
              autoComplete={isLogin ? 'current-password' : 'new-password'}>
              <PasswordToggle shown={showPassword} onToggle={() => setShowPassword((s) => !s)} />
            </Field>
            {!isLogin && !errors.password && (
              <p className="mt-1 text-xs text-white/30">Min 8 chars: uppercase, lowercase, number</p>
            )}
          </div>

          {!isLogin && (
            <Field label="Confirm Password" name="confirmPassword" type={showConfirm ? 'text' : 'password'}
              value={values.confirmPassword} onChange={handleChange} error={errors.confirmPassword}
              disabled={busy} placeholder="Confirm your password" autoComplete="new-password">
              <PasswordToggle shown={showConfirm} onToggle={() => setShowConfirm((s) => !s)} />
            </Field>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-linear-to-br from-[#ffd700] to-[#e6b800] font-semibold text-black transition hover:shadow-[0_8px_24px_rgba(255,215,0,0.25)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'submitting' ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <FontAwesomeIcon icon={faArrowRight} />
              </>
            )}
          </button>

          <p className="text-center text-sm text-white/50">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link
              to={isLogin ? '/signup' : '/login'}
              className="font-medium text-yellow-400 underline-offset-4 hover:text-yellow-300 hover:underline"
            >
              {isLogin ? 'Register' : 'Login'}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Auth