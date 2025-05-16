"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function Carousel() {
  const navigate = useNavigate()
  const [currentImageId, setCurrentImageId] = useState(null)
  const [translateX, setTranslateX] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [images, setImages] = useState([])
  const carouselRef = useRef(null)
  // Animation states
  const [isImageChanging, setIsImageChanging] = useState(false)
  const [animationDirection, setAnimationDirection] = useState(null)
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(true)

  // Filter states
  const [selectedProvince, setSelectedProvince] = useState("Agusan del Norte")
  const [selectedMunicipality, setSelectedMunicipality] = useState("")
  const [isFilterApplied, setIsFilterApplied] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Caraga region data structure
  const caragaRegion = {
    "Agusan del Norte": [
      "Butuan",
      "Cabadbaran",
      "Buenavista",
      "Carmen",
      "Jabonga",
      "Kitcharao",
      "Las Nieves",
      "Magallanes",
      "Nasipit",
      "Remedios T. Romualdez",
      "Santiago",
      "Tubay",
    ],
    "Agusan del Sur": [
      "Bayugan",
      "Bunawan",
      "Esperanza",
      "La Paz",
      "Loreto",
      "Prosperidad",
      "Rosario",
      "San Francisco",
      "San Luis",
      "Santa Josefa",
      "Sibagat",
      "Talacogon",
      "Trento",
      "Veruela",
    ],
    "Dinagat Islands": ["Basilisa", "Cagdianao", "Dinagat", "Libjo", "Loreto", "San Jose", "Tubajon"],
    "Surigao del Norte": [
      "Surigao City",
      "Alegria",
      "Bacuag",
      "Burgos",
      "Claver",
      "Dapa",
      "Del Carmen",
      "General Luna",
      "Gigaquit",
      "Mainit",
      "Malimono",
      "Pilar",
      "Placer",
      "San Benito",
      "San Francisco",
      "San Isidro",
      "Santa Monica",
      "Sison",
      "Socorro",
      "Tagana‑an",
      "Tubod",
    ],
    "Surigao del Sur": [
      "Bislig",
      "Tandag",
      "Barobo",
      "Bayabas",
      "Cagwait",
      "Cantilan",
      "Carmen",
      "Carrascal",
      "Cortes",
      "Hinatuan",
      "Lanuza",
      "Lianga",
      "Lingig",
      "Madrid",
      "Marihatag",
      "San Agustin",
      "San Miguel",
      "Tagbina",
      "Tago",
    ],
  }

  // Get all provinces
  const provinces = Object.keys(caragaRegion)

  // Get municipalities for selected province
  const municipalities = selectedProvince ? caragaRegion[selectedProvince] : []

  const currentImage = images && images.length > 0 ? images.find((img) => img.id === currentImageId) : null

  const imageSrc = currentImage?.src ? `http://ctsimp_backend.test/storage/${currentImage.src}` : ""

  // Filter images based on selected province and municipality
  const filteredImages = images
    .filter((image) => {
      if (!isFilterApplied) return true

      const address = image.address?.toLowerCase() || ""

      if (selectedMunicipality) {
        return address.includes(selectedProvince.toLowerCase()) && address.includes(selectedMunicipality.toLowerCase())
      } else if (selectedProvince) {
        return address.includes(selectedProvince.toLowerCase())
      }

      return true
    })
    .filter((image) => {
      const searchLower = searchQuery.toLowerCase()
      return (
        image.title?.toLowerCase().includes(searchLower) ||
        image.description?.toLowerCase().includes(searchLower) ||
        image.address?.toLowerCase().includes(searchLower)
      )
    })

  // Sort filtered images alphabetically by title
  const sortedFilteredImages = [...filteredImages].sort((a, b) => (a.title || "").localeCompare(b.title || ""))

  useEffect(() => {
    if (sortedFilteredImages.length > 0 && !sortedFilteredImages.some((img) => img.id === currentImageId)) {
      setCurrentImageId(sortedFilteredImages[0].id)
    }
  }, [sortedFilteredImages, currentImageId])

  // Handle province change
  useEffect(() => {
    if (selectedProvince && municipalities.length > 0) {
      setSelectedMunicipality(municipalities[0])
    }
  }, [selectedProvince])

  const handleNavigation = (direction) => {
    const currentIndex = sortedFilteredImages.findIndex((img) => img.id === currentImageId)
    let newIndex

    if (direction === "next") {
      newIndex = (currentIndex + 1) % sortedFilteredImages.length
      setAnimationDirection("right")
    } else {
      newIndex = (currentIndex - 1 + sortedFilteredImages.length) % sortedFilteredImages.length
      setAnimationDirection("left")
    }

    setIsImageChanging(true)

    // Short delay to allow exit animation to complete
    setTimeout(() => {
      setCurrentImageId(sortedFilteredImages[newIndex].id)
      setTimeout(() => {
        setIsImageChanging(false)
      }, 50)
    }, 300)
  }

  const updateCarouselPosition = () => {
    if (carouselRef.current) {
      const currentIndex = sortedFilteredImages.findIndex((img) => img.id === currentImageId)
      const itemWidth = 192 + 16
      const newTranslateX = -currentIndex * itemWidth
      setTranslateX(newTranslateX)
    }
  }

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  // Apply filters
  const applyFilters = () => {
    setIsFilterApplied(true)
  }

  // Clear all filters
  const clearFilters = () => {
    setIsFilterApplied(false)
    setSelectedProvince("Agusan del Norte")
    setSelectedMunicipality(caragaRegion["Agusan del Norte"][0])
  }

  useEffect(() => {
    fetch("http://ctsimp_backend.test/api/approvedplaces")
      .then((response) => response.json())
      .then((data) => {
        setImages(
          data.map((place) => ({
            id: place.id,
            src: place.image_link,
            alt: place.name,
            title: place.place_name,
            email: place.email_address,
            contact: place.contact_no,
            description: place.description,
            virtual_iframe: place.virtual_iframe,
            map_iframe: place.map_iframe,
            entrance: place.entrance,
            pricing: place.pricing,
            history: place.history,
            activities: place.activities,
            address: place.address,
          })),
        )
        // Simulate loading for animation effect
        setTimeout(() => {
          setImagesLoaded(true)
          setTimeout(() => {
            setShowLoadingAnimation(false)
          }, 600)
        }, 1000)
      })
      .catch((error) => console.error("Error fetching places:", error))
  }, [])

  useEffect(() => {
    if (images.length > 0) {
      setCurrentImageId(images[0].id)
      updateCarouselPosition()

      // Set default municipality based on default province
      if (caragaRegion["Agusan del Norte"] && caragaRegion["Agusan del Norte"].length > 0) {
        setSelectedMunicipality(caragaRegion["Agusan del Norte"][0])
      }
    }
  }, [images])

  useEffect(() => {
    updateCarouselPosition()
  }, [currentImageId])

  useEffect(() => {
    const handleResize = () => {
      updateCarouselPosition()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // CSS for animations
  const fadeInAnimation = "animate-[fadeIn_0.8s_ease-in-out]"
  const fadeOutAnimation = "animate-[fadeOut_0.3s_ease-in-out]"
  const slideInRightAnimation = "animate-[slideInRight_0.5s_ease-out]"
  const slideInLeftAnimation = "animate-[slideInLeft_0.5s_ease-out]"
  const slideOutRightAnimation = "animate-[slideOutRight_0.3s_ease-in]"
  const slideOutLeftAnimation = "animate-[slideOutLeft_0.3s_ease-in]"
  const pulseAnimation = "animate-[pulse_2s_infinite]"
  const bounceAnimation = "animate-[bounce_1s_ease-in-out]"
  const floatAnimation = "animate-[float_3s_ease-in-out_infinite]"

  // Adjust the dropdown content to appear in the middle of the screen
  const dropdownStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 50,
    backgroundColor: "white",
    borderRadius: "0.5rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    padding: "1.25rem",
    animation: "fadeInUp 0.4s ease-out",
  };

  if (!imagesLoaded || images.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-emerald-50">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <svg
              className="animate-spin h-24 w-24 text-emerald-600 opacity-20"
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
            <svg
              className="absolute top-0 left-0 animate-pulse h-24 w-24 text-emerald-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className={`text-2xl font-semibold text-emerald-800 ${bounceAnimation}`}>
            {images.length === 0 ? "No Tourism Places Available" : "Discovering Mindanao's Treasures"}
          </div>
          <p className={`text-emerald-600 mt-2 ${floatAnimation}`}>
            {images.length === 0
              ? "Check back soon for new destinations"
              : "Preparing your virtual journey through paradise"}
          </p>
          <div className="mt-8 flex justify-center space-x-2">
            <span className="h-3 w-3 bg-emerald-500 rounded-full animate-[bounce_0.6s_infinite_0.1s]"></span>
            <span className="h-3 w-3 bg-emerald-500 rounded-full animate-[bounce_0.6s_infinite_0.2s]"></span>
            <span className="h-3 w-3 bg-emerald-500 rounded-full animate-[bounce_0.6s_infinite_0.3s]"></span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative min-h-screen w-full overflow-hidden ${showLoadingAnimation ? fadeInAnimation : ""}`}>
      {/* Filter Section */}
      <div className="absolute top-4 right-4 z-30 bg-white rounded-md shadow-md overflow-hidden">
        {/* Search and Toggle Bar */}
        <div className="flex items-center p-3 border-b border-emerald-100">
          <input
            id="search"
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1 border border-emerald-300 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-grow"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="ml-2 p-2 bg-emerald-100 rounded-md hover:bg-emerald-200 transition-colors"
            aria-label={showFilters ? "Hide filters" : "Show filters"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 text-emerald-700 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>

        {/* Expandable Filter Controls */}
        {showFilters && (
          <div className="p-3 animate-[fadeIn_0.3s_ease-out]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-emerald-800">Filter Options</h3>
              <div className="flex gap-2">
                <button
                  onClick={applyFilters}
                  className="px-3 py-1 bg-emerald-600 text-white rounded-md shadow hover:bg-emerald-700 transition focus:outline-none text-sm"
                >
                  Apply Filter
                </button>
                <button
                  onClick={clearFilters}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md shadow hover:bg-gray-300 transition focus:outline-none text-sm"
                >
                  Show All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Province Dropdown */}
              <div className="flex flex-col">
                <label htmlFor="province" className="text-xs text-gray-600 mb-1">
                  Province
                </label>
                <select
                  id="province"
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="px-3 py-1 border border-emerald-300 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                >
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>

              {/* Municipality/City Dropdown */}
              <div className="flex flex-col">
                <label htmlFor="municipality" className="text-xs text-gray-600 mb-1">
                  Municipality/City
                </label>
                <select
                  id="municipality"
                  value={selectedMunicipality}
                  onChange={(e) => setSelectedMunicipality(e.target.value)}
                  className="px-3 py-1 border border-emerald-300 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                >
                  {municipalities.map((municipality) => (
                    <option key={municipality} value={municipality}>
                      {municipality}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Adjust content to avoid overlap with filter section */}
      <div className="mt-32 md:mt-20">
        {/* Main background image with transition effect */}
        {currentImage && (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src={imageSrc || "/placeholder.svg"}
              alt={currentImage?.alt}
              className={`h-full w-full object-cover transition-all duration-700 ease-in-out ${
                isImageChanging ? "opacity-0 scale-105" : "opacity-100 scale-100"
              } ${
                animationDirection === "right" && !isImageChanging
                  ? "animate-[zoomInRight_0.7s_ease-out]"
                  : animationDirection === "left" && !isImageChanging
                    ? "animate-[zoomInLeft_0.7s_ease-out]"
                    : ""
              }`}
              style={{ filter: "brightness(1.05) contrast(1.05)" }}
            />
          </div>
        )}

        {/* Animated vignette effect */}
        <div className="absolute inset-0 z-5 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none animate-[fadeIn_1.5s_ease-in-out]"></div>
        <div className="absolute inset-0 z-5 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none animate-[pulseGradient_8s_ease-in-out_infinite]"></div>

        {/* Floating particles effect for atmosphere */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute top-[10%] left-[5%] w-2 h-2 bg-white/20 rounded-full animate-[float_8s_ease-in-out_infinite]"></div>
          <div className="absolute top-[15%] left-[15%] w-1 h-1 bg-white/30 rounded-full animate-[float_12s_ease-in-out_infinite_1s]"></div>
          <div className="absolute top-[25%] right-[10%] w-2 h-2 bg-white/20 rounded-full animate-[float_9s_ease-in-out_infinite_0.5s]"></div>
          <div className="absolute top-[40%] right-[20%] w-1 h-1 bg-white/30 rounded-full animate-[float_11s_ease-in-out_infinite_1.5s]"></div>
          <div className="absolute bottom-[30%] left-[25%] w-2 h-2 bg-white/20 rounded-full animate-[float_10s_ease-in-out_infinite_2s]"></div>
        </div>

        {/* Back button with hover effect */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 z-30 text-white p-3 bg-emerald-700/80 rounded-full hover:bg-emerald-800/90 transition-all duration-300 shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-1"
          aria-label="Go back"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        {/* Filter status indicator */}
        {isFilterApplied && (
          <div className="absolute top-24 left-6 z-30 bg-emerald-700/90 text-white px-3 py-1 rounded-full text-sm animate-[fadeIn_0.5s_ease-out]">
            Filtered: {selectedProvince} - {selectedMunicipality} ({sortedFilteredImages.length} results)
          </div>
        )}

        {/* Main content with entrance animation */}
        <div className={`relative z-20 flex min-h-screen flex-col ${fadeInAnimation}`}>
          <div className="flex-1 flex items-center p-6 md:p-12">
            <div
              className={`max-w-2xl backdrop-blur-sm p-8 rounded-lg shadow-xl transition-all duration-500 ${
                isImageChanging
                  ? animationDirection === "right"
                    ? slideOutLeftAnimation
                    : slideOutRightAnimation
                  : animationDirection === "right"
                    ? slideInRightAnimation
                    : animationDirection === "left"
                      ? slideInLeftAnimation
                      : fadeInAnimation
              }`}
            >
              {/* Content with text shadow for readability without obscuring background */}
              <div className="inline-block px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded-full mb-4 shadow-sm animate-[pulse_3s_infinite]">
                {currentImage?.address || "Address not available"}
              </div>

              <h1 className="mb-2 text-4xl md:text-5xl font-bold text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)]">
                {currentImage?.title}
              </h1>

              <div className="w-20 h-1 bg-amber-500 mb-6 shadow-md animate-[growWidth_1s_ease-out]"></div>

              <p className="mb-8 text-white text-lg leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] bg-black/10 p-4 rounded-lg backdrop-blur-sm">
                {currentImage?.description}
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => toggleDropdown("contact")}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 flex items-center shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
                    activeDropdown === "contact"
                      ? "bg-emerald-700 text-white"
                      : "bg-white/90 text-emerald-900 hover:bg-white"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 mr-2 ${activeDropdown === "contact" ? "animate-[pulse_1s_infinite]" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  Contact
                </button>
                <button
                  onClick={() => toggleDropdown("map")}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 flex items-center shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
                    activeDropdown === "map"
                      ? "bg-emerald-700 text-white"
                      : "bg-white/90 text-emerald-900 hover:bg-white"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 mr-2 ${activeDropdown === "map" ? "animate-[pulse_1s_infinite]" : ""}`}
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
                  View Map
                </button>
                <button
                  onClick={() => toggleDropdown("tour")}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 flex items-center shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
                    activeDropdown === "tour"
                      ? "bg-emerald-700 text-white"
                      : "bg-white/90 text-emerald-900 hover:bg-white"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 mr-2 ${activeDropdown === "tour" ? "animate-[spin_4s_linear_infinite]" : ""}`}
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
                  Virtual Tour
                </button>
                <button
                  onClick={() => toggleDropdown("details")}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 flex items-center shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
                    activeDropdown === "details"
                      ? "bg-emerald-700 text-white"
                      : "bg-white/90 text-emerald-900 hover:bg-white"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 mr-2 ${activeDropdown === "details" ? "animate-[pulse_1s_infinite]" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20l9-8-9-8-9 8 9 8z"></path>
                    <line x1="12" y1="12" x2="12" y2="20"></line>
                    <line x1="12" y1="4" x2="12" y2="12"></line>
                  </svg>
                  View Details
                </button>
              </div>

              {/* Dropdown content with animation */}
                      {activeDropdown && (
                      <div style={dropdownStyle}>
                        <button
                        onClick={() => setActiveDropdown(null)}
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label="Close"
                        >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        </button>
                        <div className="max-h-[70vh] overflow-y-auto p-2">
                        {activeDropdown === "contact" && (
                          <div>
                          <h3 className="font-semibold text-emerald-800 mb-3 flex items-center">
                            <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-emerald-600 animate-[pulse_2s_infinite]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            >
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                            Contact Information
                          </h3>
                          <div className="bg-emerald-50 p-4 rounded-md animate-[fadeIn_0.6s_ease-out_0.2s]">
                            <div className="flex items-start mb-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-3 text-emerald-600 mt-0.5"
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
                            <div>
                              <p className="text-sm font-medium text-gray-700">Email</p>
                              <p className="text-emerald-700">{currentImage?.email}</p>
                            </div>
                            </div>
                            <div className="flex items-start">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-3 text-emerald-600 mt-0.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Phone</p>
                              <p className="text-emerald-700">{currentImage?.contact}</p>
                            </div>
                            </div>
                          </div>
                          </div>
                        )}

                        {activeDropdown === "map" && (
                          <div>
                          <h3 className="font-semibold text-emerald-800 mb-3 flex items-center">
                            <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-emerald-600"
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
                            Location Map
                          </h3>
                          <div className="border border-emerald-200 rounded-lg overflow-hidden shadow-md animate-[fadeIn_0.6s_ease-out_0.2s]">
                            <iframe
                            src={currentImage?.map_iframe}
                            title="Location Map"
                            className="w-full h-64 md:h-80"
                            allowFullScreen
                            ></iframe>
                          </div>
                          </div>
                        )}

                        {activeDropdown === "tour" && (
                          <div>
                          <h3 className="font-semibold text-emerald-800 mb-3 flex items-center">
                            <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2 text-emerald-600 animate-[spin_4s_linear_infinite]"
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
                            Virtual Tour Experience
                          </h3>
                          <div className="border border-emerald-200 rounded-lg overflow-hidden shadow-md animate-[fadeIn_0.6s_ease-out_0.2s]">
                            <iframe
                            src={currentImage?.virtual_iframe}
                            title="Virtual Tour"
                            className="w-full h-64 md:h-80"
                            allow="xr-spatial-tracking; vr; gyroscope; accelerometer; fullscreen; autoplay; xr"
                            scrolling="no"
                            allowFullScreen={true}
                            frameBorder="0"
                            allowVR="yes"
                            />
                          </div>
                          </div>
                        )}

                        {activeDropdown === "details" && (
                          <div>
                          <h3 className="font-semibold text-emerald-800 mb-3">Details</h3>
                          <div className="bg-emerald-50 p-4 rounded-md animate-[fadeIn_0.6s_ease-out_0.2s]">
                            <p className="mb-2">
                            <span className="font-medium text-gray-700">Entrance Fee:</span>{" "}
                            {currentImage?.entrance || "N/A"}
                            </p>
                            <p className="mb-2">
                            <span className="font-medium text-gray-700">Pricing:</span> {currentImage?.pricing || "N/A"}
                            </p>
                            <p className="mb-2">
                            <span className="font-medium text-gray-700">History:</span> {currentImage?.history || "N/A"}
                            </p>
                            <p className="mb-2">
                            <span className="font-medium text-gray-700">Activities:</span>
                            </p>
                            <ul className="list-disc list-inside text-gray-700">
                            {currentImage?.activities
                              ? currentImage.activities
                                .split(",")
                                .map((activity, index) => <li key={index}>{activity.trim()}</li>)
                              : "N/A"}
                            </ul>
                          </div>
                          </div>
                        )}
                        </div>
                      </div>
                      )}
                    </div>
                    </div>
          <div className="relative w-full bg-black/40 backdrop-blur-sm p-6 border-t border-white/10 animate-[fadeInUp_0.8s_ease-out]">
            <div className="mx-auto max-w-6xl overflow-hidden" ref={carouselRef}>
              <div
                className="flex gap-4 transition-transform duration-500 ease-out"
                style={{ transform: `translateX(${translateX}px)` }}
              >
                {sortedFilteredImages.map((image, index) => (
                  <div
                    key={image.id}
                    className={`flex-none w-[192px] h-[128px] rounded-lg overflow-hidden shadow-md transition-all duration-300 cursor-pointer animate-[fadeIn_0.5s_ease-out_${index * 0.1}s] ${
                      image.id === currentImageId
                        ? "ring-4 ring-amber-500 scale-105 z-10"
                        : "ring-2 ring-white/30 hover:ring-white/70 hover:scale-102"
                    }`}
                    onClick={() => {
                      if (image.id !== currentImageId) {
                        setAnimationDirection(
                          sortedFilteredImages.findIndex((img) => img.id === currentImageId) < index ? "right" : "left",
                        )
                        setIsImageChanging(true)
                        setTimeout(() => {
                          setCurrentImageId(image.id)
                          setTimeout(() => {
                            setIsImageChanging(false)
                          }, 50)
                        }, 300)
                      }
                    }}
                  >
                    <img
                      src={`http://ctsimp_backend.test/storage/${image.src}`}
                      alt={image.alt}
                      className={`object-cover w-full h-full transition-transform duration-700 ${
                        image.id === currentImageId ? "scale-110" : "scale-100 hover:scale-110"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation buttons with hover effects */}
            <button
              onClick={() => handleNavigation("prev")}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-3 bg-emerald-700/80 rounded-full hover:bg-emerald-800/90 transition-all duration-300 shadow-lg hover:shadow-emerald-500/20 hover:-translate-x-1"
              aria-label="Previous destination"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <button
              onClick={() => handleNavigation("next")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-3 bg-emerald-700/80 rounded-full hover:bg-emerald-800/90 transition-all duration-300 shadow-lg hover:shadow-emerald-500/20 hover:translate-x-1"
              aria-label="Next destination"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            {/* Destination counter with animation */}
            <div className="absolute bottom-6 right-1/2 transform translate-x-1/2 bg-emerald-800/90 text-white text-xs font-medium px-3 py-1 rounded-full animate-[pulse_3s_infinite]">
              {sortedFilteredImages.findIndex((img) => img.id === currentImageId) + 1} / {sortedFilteredImages.length}
            </div>
          </div>

          {/* Footer with subtle animation */}
          <div className="bg-emerald-900/70 backdrop-blur-sm text-center py-3 text-emerald-100 text-xs animate-[fadeIn_1s_ease-out]">
            <p>Department of Tourism - Caraga Region</p>
            <p className="text-emerald-200 mt-1 animate-[float_3s_ease-in-out_infinite]">
              Discover the beauty and culture of Caraga
            </p>
          </div>
        </div>

        {/* Add CSS animations */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          
          @keyframes slideInRight {
            from { transform: translateX(30px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          
          @keyframes slideInLeft {
            from { transform: translateX(-30px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          
          @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(30px); opacity: 0; }
          }
          
          @keyframes slideOutLeft {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(-30px); opacity: 0; }
          }
          
          @keyframes zoomInRight {
            from { transform: scale(1.1) translateX(30px); opacity: 0; }
            to { transform: scale(1) translateX(0); opacity: 1; }
          }
          
          @keyframes zoomInLeft {
            from { transform: scale(1.1) translateX(-30px); opacity: 0; }
            to { transform: scale(1) translateX(0); opacity: 1; }
          }
          
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          
          @keyframes growWidth {
            from { width: 0; }
            to { width: 5rem; }
          }
          
          @keyframes fadeInUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          
          @keyframes pulseGradient {
            0% { opacity: 0.7; }
            50% { opacity: 0.3; }
            100% { opacity: 0.7; }
          }
        `}</style>
      </div>
    </div>
  )
}