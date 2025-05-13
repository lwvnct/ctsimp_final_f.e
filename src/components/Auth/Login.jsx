"use client"

import { useState, useEffect } from "react"
import { useNavigate, NavLink } from "react-router-dom"

const ADMIN_EMAIL = "admin@sys.cs" // Replace with your actual admin email
const COOKIE_NAME = "tourism_remembered_email"

// Helper functions for cookie management
const setCookie = (name, value, days) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`
}

const getCookie = (name) => {
  const nameEQ = name + "="
  const ca = document.cookie.split(";")
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === " ") c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

const eraseCookie = (name) => {
  document.cookie = name + "=; Max-Age=-99999999; path=/"
}

const Login = ({ onToggle }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [error, setError] = useState("")
  const [animationLoaded, setAnimationLoaded] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [modal, setModal] = useState({ open: false, title: "", message: "" });
  const navigate = useNavigate()

  // Check for remembered email on component mount
  useEffect(() => {
    const rememberedEmail = getCookie(COOKIE_NAME)
    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }))
    }

    // Trigger entrance animations after a short delay
    const timer = setTimeout(() => {
      setAnimationLoaded(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
    // Clear error when user types
    if (error) setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setLoginSuccess(false)

    // Handle remember me functionality using cookies
    if (formData.rememberMe) {
      setCookie(COOKIE_NAME, formData.email, 30) // Remember for 30 days
    } else {
      eraseCookie(COOKIE_NAME)
    }

    const loginData = {
      email: formData.email,
      password: formData.password,
      remember_me: formData.rememberMe,
    }

    try {
      const response = await fetch("http://ctsimp_backend.test/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      })

      const data = await response.json()
      console.log("API Response:", data)

      if (response.ok && data.token) {
        // Save JWT & user data to localStorage
        localStorage.setItem("jwt", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        sessionStorage.setItem("name", data.user.name)

        // Check user status
        if (data.user.status === "Accepted") {
          setIsLoading(false)
          setLoginSuccess(true)
          setTimeout(() => {
            if (data.user.email === ADMIN_EMAIL) {
              navigate("/admin")
            } else {
              navigate("/dashboard")
            }
          }, 3000)
        } else if (data.user.status === "Pending") {
          setIsLoading(false)
          setModal({
            open: true,
            title: "Account Verification",
            message: "Account verification is still in progress. Please wait for admin approval.",
          })
        } else if (data.user.status === "Rejected") {
          setIsLoading(false)
          setModal({
            open: true,
            title: "Account Registration Rejected",
            message: data.user.remarks
              ? `Your registration was rejected. Remarks: ${data.user.remarks}`
              : "Your registration was rejected.",
          })
        } else {
          setIsLoading(false)
          setError("Unknown account status. Please contact support.")
        }
      } else {
        setError(data.message || "Invalid email or password. Please try again.")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Network error. Please check your connection and try again.")
      setIsLoading(false)
    }
  }

  const StatusModal = () => (
    modal.open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full text-center border border-emerald-200">
          <h2 className="text-lg font-semibold text-emerald-700 mb-2">{modal.title}</h2>
          <p className="text-gray-700 mb-4">{modal.message}</p>
          <button
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
            onClick={() => setModal({ open: false, title: "", message: "" })}
          >
            Close
          </button>
        </div>
      </div>
    )
  );

  return (
    <>
      <StatusModal />
      <div className="relative w-full min-w-[280px] max-w-md mx-auto p-3 sm:p-6 md:p-8 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 shadow-lg border border-emerald-200 overflow-hidden">
        {/* Background animated elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Animated waves */}
          <div className="absolute bottom-0 left-0 right-0 h-40 opacity-10">
            <div
              className="absolute bottom-0 left-0 right-0 h-16 bg-emerald-500 animate-wave"
              style={{ animationDelay: "0s", animationDuration: "7s" }}
            ></div>
            <div
              className="absolute bottom-0 left-0 right-0 h-16 bg-teal-500 animate-wave"
              style={{ animationDelay: "0.5s", animationDuration: "8s" }}
            ></div>
            <div
              className="absolute bottom-0 left-0 right-0 h-16 bg-cyan-500 animate-wave"
              style={{ animationDelay: "1s", animationDuration: "9s" }}
            ></div>
          </div>

          {/* Floating particles */}
          <div
            className="absolute top-[10%] left-[10%] w-2 h-2 bg-emerald-400 rounded-full opacity-30 animate-float"
            style={{ animationDuration: "6s" }}
          ></div>
          <div
            className="absolute top-[20%] right-[15%] w-1.5 h-1.5 bg-teal-400 rounded-full opacity-20 animate-float"
            style={{ animationDuration: "8s", animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-[50%] left-[20%] w-1 h-1 bg-cyan-400 rounded-full opacity-20 animate-float"
            style={{ animationDuration: "7s", animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-[30%] right-[10%] w-2 h-2 bg-emerald-400 rounded-full opacity-30 animate-float"
            style={{ animationDuration: "9s", animationDelay: "0.5s" }}
          ></div>
        </div>

        {/* Success animation overlay - only shows when loginSuccess is true */}
        {loginSuccess && (
          <div className="absolute inset-0 bg-emerald-50/90 flex flex-col items-center justify-center z-50 animate-fadeIn">
            <div className="relative w-16 h-16 mb-4">
              <svg
                className="absolute animate-ping h-16 w-16 text-emerald-300"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
              </svg>
              <svg
                className="relative h-16 w-16 text-emerald-600 animate-zoomIn"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-emerald-800 font-medium text-lg animate-fadeIn">Login Successful!</p>
            <p className="text-emerald-600 text-sm animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
              Preparing your journey...
            </p>

            {/* Countdown indicator */}
            <div className="mt-4 flex space-x-2">
              <div
                className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse"
                style={{ animationDuration: "1s" }}
              ></div>
              <div
                className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse"
                style={{ animationDuration: "1s", animationDelay: "0.3s" }}
              ></div>
              <div
                className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse"
                style={{ animationDuration: "1s", animationDelay: "0.6s" }}
              ></div>
            </div>
          </div>
        )}

        <div
          className={`flex items-center justify-between mb-3 sm:mb-6 transition-all duration-700 ${animationLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
        >
          <NavLink
            to="/"
            className="flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-emerald-300/30"
          >
            {/* Back Arrow Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 sm:h-5 sm:w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5"></path>
              <path d="M12 19l-7-7 7-7"></path>
            </svg>
          </NavLink>
          <div className="flex items-center group">
            {/* Map Icon with animation */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-6 sm:w-6 md:h-7 md:w-7 text-emerald-600 mr-1 sm:mr-2 transition-transform duration-700 group-hover:rotate-[15deg] animate-pulse"
              style={{ animationDuration: "3s" }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
              <line x1="8" y1="2" x2="8" y2="18"></line>
              <line x1="16" y1="6" x2="16" y2="22"></line>
            </svg>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-800 group-hover:text-emerald-700 transition-colors">
              Welcome Back
            </h1>
          </div>
          <div className="w-7 sm:w-9"></div> {/* Empty div for balance */}
        </div>

        <div
          className={`text-center mb-3 sm:mb-6 transition-all duration-700 delay-100 ${animationLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-emerald-700">Sign In</h2>
          <p
            className="text-xs sm:text-sm text-emerald-600 mt-0.5 sm:mt-1 animate-fadeIn"
            style={{ animationDelay: "0.5s" }}
          >
            Continue your journey in Caraga
          </p>
        </div>

        {error && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-md flex items-start sm:items-center gap-1.5 sm:gap-2 text-red-700 text-xs sm:text-sm animate-shake">
            {/* AlertCircle Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5 sm:mt-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5">
          <div
            className={`space-y-1 transition-all duration-700 delay-200 ${animationLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <label htmlFor="email" className="text-xs sm:text-sm font-medium text-emerald-700 block">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                {/* Mail Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-emerald-500 transition-transform duration-300 group-focus-within:text-emerald-600 group-hover:scale-110"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="pl-7 sm:pl-10 w-full px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-emerald-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 group-hover:shadow-md"
                placeholder="example@email.com"
                required
              />
            </div>
          </div>

          <div
            className={`space-y-1 transition-all duration-700 delay-300 ${animationLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <label htmlFor="password" className="text-xs sm:text-sm font-medium text-emerald-700 block">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                {/* Lock Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-emerald-500 transition-transform duration-300 group-focus-within:text-emerald-600 group-hover:scale-110"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className="pl-7 sm:pl-10 w-full px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-emerald-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 group-hover:shadow-md"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center"
              >
                {showPassword ? (
                  /* EyeOff Icon */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-emerald-500 hover:text-emerald-700 transition-colors"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  /* Eye Icon */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-emerald-500 hover:text-emerald-700 transition-colors"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div
            className={`flex items-center justify-between transition-all duration-700 delay-400 ${animationLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <label className="flex items-center text-xs sm:text-sm text-emerald-700 group cursor-pointer">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 transition-all duration-300 group-hover:border-emerald-500"
              />
              <span className="group-hover:text-emerald-800 transition-colors duration-300">Remember Me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || loginSuccess}
            className={`w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-1.5 sm:py-2.5 px-3 sm:px-4 text-xs sm:text-sm md:text-base rounded-md transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group ${
              animationLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            } ${loginSuccess || isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            style={{ transitionDelay: "0.5s" }}
          >
            {/* Button background animation */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-400/0 via-teal-300/30 to-emerald-400/0 -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out"></span>

            {isLoading ? (
              <>
                {/* Loader Icon */}
                <svg
                  className="animate-spin -ml-1 mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="relative">Signing In...</span>
              </>
            ) : (
              <>
                {/* Login Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 group-hover:translate-x-1 transition-transform duration-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                <span className="relative">Sign In</span>
              </>
            )}
          </button>
        </form>

        <div
          className={`relative flex items-center justify-center mt-4 mb-4 sm:mt-5 sm:mb-5 transition-all duration-700 ${animationLoaded ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "0.6s" }}
        >
          <div className="absolute border-t border-emerald-200 w-full"></div>
          <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 px-2 sm:px-4 text-xs sm:text-sm text-emerald-600">
            or
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          disabled={loginSuccess}
          className={`w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium py-1.5 sm:py-2.5 px-3 sm:px-4 text-xs sm:text-sm md:text-base rounded-md transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group ${
            animationLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          } ${loginSuccess ? "opacity-70 cursor-not-allowed" : ""}`}
          style={{ transitionDelay: "0.7s" }}
        >
          {/* Button background animation */}
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-400/0 via-yellow-300/30 to-amber-400/0 -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out"></span>

          {/* UserPlus Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2 group-hover:scale-110 transition-transform duration-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          <span className="relative">Create an Account</span>
        </button>

        <div
          className={`mt-4 pt-2 sm:mt-5 sm:pt-3 border-t border-emerald-200 text-center transition-all duration-700 ${animationLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "0.8s" }}
        >
          <p className="text-[10px] sm:text-xs text-emerald-700">Department of Tourism - Caraga Region</p>
          <p
            className="text-[10px] sm:text-xs text-emerald-600 mt-0.5 sm:mt-1 animate-pulse"
            style={{ animationDuration: "3s" }}
          >
            Discover the beauty and culture of Caraga Region
          </p>
        </div>

        {/* Add CSS animations */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
  @keyframes wave {
    0%, 100% {
      transform: translateY(0) scaleY(1);
    }
    50% {
      transform: translateY(-10px) scaleY(0.9);
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeInUp {
    from { 
      opacity: 0;
      transform: translateY(10px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  
  @keyframes zoomIn {
    from {
      opacity: 0;
      transform: scale3d(0.3, 0.3, 0.3);
    }
    50% {
      opacity: 1;
    }
  }
  
  .animate-wave {
    animation: wave 8s ease-in-out infinite;
  }
  
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.6s ease-out forwards;
  }
  
  .animate-fadeInUp {
    animation: fadeInUp 0.6s ease-out forwards;
  }
  
  .animate-shake {
    animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
  }
  
  .animate-zoomIn {
    animation: zoomIn 0.5s ease-out forwards;
  }
`,
          }}
        />
      </div>
    </>
  )
}

export default Login

