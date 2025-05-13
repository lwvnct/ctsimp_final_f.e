"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Header from "./Header"
import FilePreview from "./FilePreview"
import Modal from "./Modal"

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [snackbar, setSnackbar] = useState({
    show: false,
    text: "",
    color: "",
  })
  const [formData, setFormData] = useState({
    name: "", // This will be populated from sessionStorage
    place_name: "", // User will input this manually
    address: "",
    email_address: "",
    contact_no: "",
    description: "",
    virtual_iframe: "",
    map_iframe: "",
    image_link: null,
    status: "Pending",
    entrance: "",
    history: "",
    pricing: "",
    activities: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activityInput, setActivityInput] = useState("")

  const fileInputRef = useRef(null)


  useEffect(() => {
    const storedName = sessionStorage.getItem("name")
    if (storedName) {
      setFormData((prevData) => ({
        ...prevData,
        name: storedName,
      }))
    }
  }, [])

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
        setFormData((prevData) => ({
          ...prevData,
          image_link: file, // Set the image file for upload
        }))
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
      setFormData((prevData) => ({
        ...prevData,
        image_link: null,
      }))
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const showNotification = (text, color) => {
    setSnackbar({
      show: true,
      text,
      color,
    })

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setSnackbar((prev) => ({ ...prev, show: false }))
    }, 5000)
  }

  const handleActivityAdd = (e) => {
    e.preventDefault();
    if (activityInput.trim() !== "") {
      setFormData((prevData) => ({
        ...prevData,
        activities: [...prevData.activities, activityInput.trim()],
      }));
      setActivityInput("");
    }
  };

  const handleActivityRemove = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      activities: prevData.activities.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formDataToSubmit = new FormData()

    // Append form data
    for (const key in formData) {
      if (key === "activities") {
        formDataToSubmit.append(key, formData[key].join(", "));
      } else {
        formDataToSubmit.append(key, formData[key]);
      }
    }

    try {
      const response = await fetch("http://ctsimp_backend.test/api/places", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formDataToSubmit,
      })

      const data = await response.json()
      if (response.ok) {
        console.log("Place created:", data.place)
        showNotification("Place created successfully", "success")

        // Delay the page refresh to allow time to see the notification
        setTimeout(() => {
          window.location.reload()
        }, 3000) // 3 second delay
      } else {
        console.error("Error:", data.message)
        showNotification(data.message || "Error creating place", "error")
      }
    } catch (error) {
      console.error("Error:", error)
      showNotification("Error submitting form. Please try again.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.5,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  const formVariants = {
    hidden: { scale: 0.98, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="min-h-screen relative bg-cover bg-center" style={{ backgroundImage: "url(bg.jpg)" }}>
      <div className="absolute inset-0 bg-emerald-900 bg-opacity-80"></div>
      <motion.div
        className="relative z-10 container mx-auto px-4 py-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.form
          className="bg-white rounded-lg shadow-xl overflow-hidden"
          variants={formVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
        >
          <motion.div
            className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="flex items-center">
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white mr-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </motion.svg>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <h1 className="text-2xl font-bold text-white">Caraga Tourism</h1>
                <p className="text-emerald-100 text-sm">Submit a New Destination</p>
              </motion.div>
            </div>
          </motion.div>

          <div className="p-6">
            <Header onOpenModal={() => setIsModalOpen(true)} />

            <motion.div
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div className="lg:col-span-2 space-y-6" variants={containerVariants}>
                <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" variants={containerVariants}>
                  {/* Place Name */}
                  <motion.div variants={itemVariants}>
                    <label htmlFor="place_name" className="block text-sm font-medium text-emerald-700 mb-1">
                      Place Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-emerald-500"
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
                      </div>
                      <input
                        id="place_name"
                        type="text"
                        placeholder="e.g, Tinuy-an Falls"
                        value={formData.place_name || ""}
                        onChange={handleChange}
                        name="place_name"
                        className="pl-10 w-full px-4 py-2 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </motion.div>

                  {/* Address */}
                  <motion.div variants={itemVariants}>
                    <label htmlFor="address" className="block text-sm font-medium text-emerald-700 mb-1">
                      Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-emerald-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                      </div>
                      <input
                        id="address"
                        type="text"
                        placeholder="e.g, Bislig, Surigao Del Sur"
                        value={formData.address || ""}
                        onChange={handleChange}
                        name="address"
                        className="pl-10 w-full px-4 py-2 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </motion.div>

                  {/* Email Address */}
                  <motion.div variants={itemVariants}>
                    <label htmlFor="email" className="block text-sm font-medium text-emerald-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-emerald-500"
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
                        type="email"
                        placeholder="e.g, example@gmail.com"
                        value={formData.email_address || ""}
                        onChange={handleChange}
                        name="email_address"
                        className="pl-10 w-full px-4 py-2 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </motion.div>

                  {/* Contact No */}
                  <motion.div variants={itemVariants}>
                    <label htmlFor="contact" className="block text-sm font-medium text-emerald-700 mb-1">
                      Contact No.
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-emerald-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </div>
                      <input
                        id="contact"
                        type="tel"
                        placeholder="e.g, 09518149753"
                        value={formData.contact_no || ""}
                        onChange={handleChange}
                        name="contact_no"
                        className="pl-10 w-full px-4 py-2 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </motion.div>

                    {/* Entrance */}
                    <motion.div variants={itemVariants}>
                      <label htmlFor="entrance" className="block text-sm font-medium text-emerald-700 mb-1">
                        Entrance
                      </label>
                      <input
                        id="entrance"
                        type="text"
                        placeholder="e.g, Main Gate"
                        value={formData.entrance || ""}
                        onChange={handleChange}
                        name="entrance"
                        className="w-full px-4 py-2 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      />
                    </motion.div>
              
                    <motion.div variants={itemVariants}>
                      <label htmlFor="pricing" className="block text-sm font-medium text-emerald-700 mb-1">
                        Pricing
                      </label>
                      <input
                        id="pricing"
                        type="text"
                        placeholder="e.g, 100 PHP per cottage/room"
                        value={formData.pricing || ""}
                        onChange={handleChange}
                        name="pricing"
                        className="w-full px-4 py-2 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      />
                    </motion.div>
                  </motion.div>

                {/* Description */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="description" className="block text-sm font-medium text-emerald-700 mb-1">
                    Description
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-emerald-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </div>
                    <textarea
                      id="description"
                      placeholder="Spot Description..."
                      value={formData.description || ""}
                      onChange={handleChange}
                      name="description"
                      className="pl-10 w-full px-4 py-2 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[120px] transition-all duration-300"
                    />
                  </div>
                </motion.div>

                {/* Google Map iframe */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="googleMap" className="block text-sm font-medium text-emerald-700 mb-1">
                    Google Map iframe
                    <span className="ml-5">
                      <a
                        href="https://youtube.com/watch?v=T5FaFLeERLs&si=3rAhKhMruFZitpAb"
                        className="text-emerald-600 hover:text-emerald-700 underline transition-colors duration-300"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        (For Tutorial, click here)
                      </a>
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-emerald-500"
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
                    </div>
                    <textarea
                      id="googleMap"
                      placeholder="e.g, (https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d126440.1668895862!2d123.76526621796874!3d7.972554395731812!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sph!4v1732520001105!5m2!1sen!2sph)"
                      value={formData.map_iframe || ""}
                      onChange={handleChange}
                      name="map_iframe"
                      className="pl-10 w-full px-4 py-2 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[100px] transition-all duration-300"
                      rows={4}
                    />
                  </div>
                </motion.div>

                {/* Visual Tour iframe */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="visualTour" className="block text-sm font-medium text-emerald-700 mb-1">
                    Visual Tour iframe
                    <span className="ml-5">
                      <a
                        href="https://webobook.com/embedded-virtual-tour"
                        className="text-emerald-600 hover:text-emerald-700 underline transition-colors duration-300"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        (For Tutorial, click here)
                      </a>
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-emerald-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <polygon points="10 8 16 12 10 16 10 8"></polygon>
                      </svg>
                    </div>
                    <textarea
                      id="visualTour"
                      placeholder="e.g, (https://webobook.com/public/67307f5970d3461cbc339ac2,en?ap=true&si=true&sm=false&sp=true&sfr=false&sl=false&sop=false&)"
                      value={formData.virtual_iframe || ""}
                      onChange={handleChange}
                      name="virtual_iframe"
                      className="pl-10 w-full px-4 py-2 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[80px] transition-all duration-300"
                      rows={2}
                    />
                  </div>
                </motion.div>

                {/* Activities Section */}
                <motion.div variants={itemVariants} className="mt-4">
                  <label className="block text-sm font-medium text-emerald-700 mb-1">Activities</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={activityInput}
                      onChange={(e) => setActivityInput(e.target.value)}
                      placeholder="Add an activity"
                      className="w-full px-4 py-2 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleActivityAdd}
                      className="px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                      type="button"
                    >
                      Add
                    </button>
                  </div>
                  <ul className="list-disc pl-6">
                    {formData.activities.map((activity, idx) => (
                      <li key={idx} className="flex items-center gap-2 mb-1">
                        <span>{activity}</span>
                        <button
                          type="button"
                          onClick={() => handleActivityRemove(idx)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>

              {/* Image Preview */}
              <motion.div className="lg:col-span-1" variants={itemVariants}>
                <FilePreview previewUrl={previewUrl} onFileChange={handleFileChange} fileInputRef={fileInputRef} />
              </motion.div>
            </motion.div>

            {/* History (outside the grid, below) */}
            <motion.div variants={itemVariants} className="mt-4">
              <label htmlFor="history" className="block text-sm font-medium text-emerald-700 mb-1">
                History
              </label>
              <textarea
                id="history"
                placeholder="e.g, Established in 1900..."
                value={formData.history || ""}
                onChange={handleChange}
                name="history"
                className="w-full px-4 py-2 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[100px] transition-all duration-300"
                rows={4}
              />
            </motion.div>

            <motion.div className="mt-8 flex justify-end" variants={itemVariants}>
              <motion.button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-md transition duration-300 flex items-center justify-center shadow-md relative overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Submit Destination
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>

          <motion.div
            className="bg-emerald-50 px-6 py-4 border-t border-emerald-100 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <p className="text-xs text-emerald-700">Department of Tourism - Caraga Region</p>
            <p className="text-xs text-emerald-600 mt-1">Discover the beauty and culture of Caraga</p>
          </motion.div>
        </motion.form>
      </motion.div>

      <AnimatePresence>{isModalOpen && <Modal onClose={() => setIsModalOpen(false)} />}</AnimatePresence>

      {/* Notification Snackbar */}
      <AnimatePresence>
        {snackbar.show && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-md shadow-lg flex items-center ${
              snackbar.color === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
            }`}
          >
            <span className="mr-2">
              {snackbar.color === "success" ? (
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, 20, 0] }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </motion.svg>
              ) : (
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </motion.svg>
              )}
            </span>
            <span>{snackbar.text}</span>
            <button
              onClick={() => setSnackbar((prev) => ({ ...prev, show: false }))}
              className="ml-4 text-white hover:text-gray-200 transition-colors duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Dashboard

