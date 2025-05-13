"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

const Register = ({ onToggle }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
    validId: null,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [animationLoaded, setAnimationLoaded] = useState(false)
  const navigate = useNavigate()

  // Trigger entrance animations after component mount
  useState(() => {
    const timer = setTimeout(() => {
      setAnimationLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, files } = e.target
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    })

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }

    // Calculate password strength when password changes
    if (name === "password") {
      calculatePasswordStrength(value)
    }
  }

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    setPasswordStrength(strength)
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required"
    }
    if (!formData.validId) {
      newErrors.validId = "Valid ID is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    // Prepare FormData for file upload
    const registrationData = new FormData()
    registrationData.append("name", formData.fullName)
    registrationData.append("email", formData.email)
    registrationData.append("password", formData.password)
    registrationData.append("location", formData.location)
    registrationData.append("valid_id", formData.validId)

    try {
      const response = await fetch("http://ctsimp_backend.test/api/register", {
        method: "POST",
        body: registrationData,
      })

      if (response.ok) {
        const result = await response.json()
        console.log("Registration successful:", result)
        setIsLoading(false)
        setRegistrationSuccess(true)

        // Show success state for 3 seconds before toggling to login
        setTimeout(() => {
          onToggle()
        }, 3000)
      } else {
        const error = await response.json()
        setErrors({
          ...errors,
          form: error.message || "Registration failed. Please try again.",
        })
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error registering:", error)
      setErrors({
        ...errors,
        form: "Network error. Please check your connection and try again.",
      })
      setIsLoading(false)
    }
  }

  // Get strength color
  const getStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200"
    if (passwordStrength === 1) return "bg-red-500"
    if (passwordStrength === 2) return "bg-yellow-500"
    if (passwordStrength === 3) return "bg-emerald-500"
    return "bg-green-600"
  }

  // Get strength text
  const getStrengthText = () => {
    if (!formData.password) return ""
    if (passwordStrength === 1) return "Weak"
    if (passwordStrength === 2) return "Fair"
    if (passwordStrength === 3) return "Good"
    return "Strong"
  }

  return (
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

      {/* Success animation overlay - only shows when registrationSuccess is true */}
      {registrationSuccess && (
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
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <p className="text-emerald-800 font-medium text-lg animate-fadeIn">Registration Successful!</p>
          <p className="text-emerald-600 text-sm animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
            Welcome to Caraga Tourist Spots Interactive Map Portal!
          </p>
          <p className="text-emerald-600 text-sm animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
            Redirecting you to login...
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
        className={`flex items-center justify-center mb-3 sm:mb-6 transition-all duration-700 ${animationLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
      >
        {/* Improved Coconut Palm Tree Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600 mr-1.5 sm:mr-2 animate-pulse"
          style={{ animationDuration: "3s" }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Trunk */}
          <path d="M12 22V8" />
          {/* Palm fronds */}
          <path d="M12 8C12 8 9 4 6 6C3 8 7 10 7 10" />
          <path d="M12 8C12 8 15 4 18 6C21 8 17 10 17 10" />
          <path d="M12 6C12 6 10 2 7 3C4 4 8 7 8 7" />
          <path d="M12 6C12 6 14 2 17 3C20 4 16 7 16 7" />
          {/* Coconuts */}
          <circle cx="10" cy="10" r="1" />
          <circle cx="14" cy="10" r="1" />
          <circle cx="12" cy="12" r="1" />
        </svg>
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-center text-emerald-800">Explore Caraga Region</h1>
      </div>

      <div
        className={`text-center mb-3 sm:mb-6 transition-all duration-700 delay-100 ${animationLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-emerald-700">Create an Account</h2>
        <p className="text-xs sm:text-sm text-emerald-600 mt-0.5 sm:mt-1">Join us to explore the beauty of Caraga</p>
      </div>

      {errors.form && (
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
          <span>{errors.form}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5">
        <div
          className={`space-y-1 transition-all duration-700 delay-200 ${animationLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <label htmlFor="fullName" className="text-xs sm:text-sm font-medium text-emerald-700 block">
            Full Name
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
              {/* User Icon */}
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
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              className={`pl-7 sm:pl-10 w-full px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border ${
                errors.fullName ? "border-red-500" : "border-emerald-300"
              } bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 group-hover:shadow-md`}
              placeholder="John Doe"
            />
          </div>
          {errors.fullName && <p className="text-red-500 text-[10px] sm:text-xs mt-0.5 sm:mt-1">{errors.fullName}</p>}
        </div>

        <div
          className={`space-y-1 transition-all duration-700 delay-300 ${animationLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
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
              className={`pl-7 sm:pl-10 w-full px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border ${
                errors.email ? "border-red-500" : "border-emerald-300"
              } bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 group-hover:shadow-md`}
              placeholder="example@email.com"
            />
          </div>
          {errors.email && <p className="text-red-500 text-[10px] sm:text-xs mt-0.5 sm:mt-1">{errors.email}</p>}
        </div>

        <div
          className={`space-y-1 transition-all duration-700 delay-400 ${animationLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
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
              className={`pl-7 sm:pl-10 w-full px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border ${
                errors.password ? "border-red-500" : "border-emerald-300"
              } bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 group-hover:shadow-md`}
              placeholder="Create a password"
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
          {errors.password && <p className="text-red-500 text-[10px] sm:text-xs mt-0.5 sm:mt-1">{errors.password}</p>}

          {formData.password && (
            <div className="mt-1 sm:mt-2 animate-fadeIn">
              <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                <div className="text-[10px] sm:text-xs text-emerald-700">Password strength:</div>
                <div
                  className="text-[10px] sm:text-xs font-medium"
                  style={{ color: passwordStrength > 2 ? "#047857" : "#ca8a04" }}
                >
                  {getStrengthText()}
                </div>
              </div>
              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getStrengthColor()} transition-all duration-300 ease-in-out`}
                  style={{ width: `${passwordStrength * 25}%` }}
                ></div>
              </div>
              <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-emerald-700">
                Use 8+ characters with a mix of letters, numbers & symbols
              </div>
            </div>
          )}
        </div>

        <div
          className={`space-y-1 transition-all duration-700 delay-500 ${animationLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <label htmlFor="confirmPassword" className="text-xs sm:text-sm font-medium text-emerald-700 block">
            Confirm Password
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
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`pl-7 sm:pl-10 w-full px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border ${
                errors.confirmPassword ? "border-red-500" : "border-emerald-300"
              } bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 group-hover:shadow-md`}
              placeholder="Confirm your password"
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-[10px] sm:text-xs mt-0.5 sm:mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        <div
          className={`space-y-1 transition-all duration-700 delay-600 ${animationLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <label htmlFor="location" className="text-xs sm:text-sm font-medium text-emerald-700 block">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
            className={`w-full px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border ${
              errors.location ? "border-red-500" : "border-emerald-300"
            } bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300`}
            placeholder="e.g. Butuan City, Agusan del Norte"
          />
          {errors.location && <p className="text-red-500 text-[10px] sm:text-xs mt-0.5 sm:mt-1">{errors.location}</p>}
        </div>

        <div
          className={`space-y-1 transition-all duration-700 delay-700 ${animationLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <label htmlFor="validId" className="text-xs sm:text-sm font-medium text-emerald-700 block">
            Upload Valid ID <span className="text-red-500">*</span>
          </label>
          <input
            id="validId"
            name="validId"
            type="file"
            accept="image/*,application/pdf"
            onChange={handleChange}
            className="w-full text-xs sm:text-sm border border-emerald-300 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
          />
          {errors.validId && <p className="text-red-500 text-[10px] sm:text-xs mt-0.5 sm:mt-1">{errors.validId}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading || registrationSuccess}
          className={`w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-1.5 sm:py-2.5 px-3 sm:px-4 text-xs sm:text-sm md:text-base rounded-md transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden group ${
            animationLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          } ${registrationSuccess || isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          style={{ transitionDelay: "0.6s" }}
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
              <span className="relative">Creating Account...</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 group-hover:scale-110 transition-transform duration-300"
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
              <span className="relative">Join Caraga Tourism</span>
            </>
          )}
        </button>
      </form>

      <div
        className={`relative flex items-center justify-center mt-4 mb-4 sm:mt-5 sm:mb-5 transition-all duration-700 ${animationLoaded ? "opacity-100" : "opacity-0"}`}
        style={{ transitionDelay: "0.7s" }}
      >
        <div className="absolute border-t border-emerald-200 w-full"></div>
        <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 px-2 sm:px-4 text-xs sm:text-sm text-emerald-600">
          or
        </div>
      </div>

      <div
        className={`text-center transition-all duration-700 ${animationLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        style={{ transitionDelay: "0.8s" }}
      >
        <p className="text-xs sm:text-sm text-emerald-700">Already have an account?</p>
        <button
          type="button"
          onClick={onToggle}
          disabled={registrationSuccess}
          className={`mt-1 sm:mt-2 text-amber-600 hover:text-amber-700 font-medium text-xs sm:text-sm flex items-center justify-center mx-auto transition-colors duration-300 ${registrationSuccess ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {/* MapPin Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1 group-hover:scale-110 transition-transform duration-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          Sign in to continue your journey
        </button>
      </div>

      <div
        className={`mt-4 pt-2 sm:mt-5 sm:pt-3 border-t border-emerald-200 text-center transition-all duration-700 ${animationLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        style={{ transitionDelay: "0.9s" }}
      >
        <p className="text-[10px] sm:text-xs text-emerald-700">Department of Tourism - Caraga Region</p>
        <p
          className="text-[10px] sm:text-xs text-emerald-600 mt-0.5 sm:mt-1 animate-pulse"
          style={{ animationDuration: "3s" }}
        >
          Discover the beauty and culture of Caraga
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
  )
}

export default Register

