import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence for animations
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import Font Awesome
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons'; // Import hamburger and close icons
import icon from '../assets/icon.png'
import Devide from '../assets/DevBridgeIdeWorking.mp4'
import webexp from '../assets/WebsiteExperience.mp4'
// Custom hook for Intersection Observer
const useInView = (options) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      // Set inView to true once the element intersects the viewport
      // And then disconnect the observer if you only want the animation to play once
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect(); // Stop observing after first intersection
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    // Cleanup function
    return () => {
      if (ref.current) { // Ensure ref.current is not null before unobserving
        observer.unobserve(ref.current);
      }
      // Re-create observer if it was disconnected in the current effect run
      // This part ensures that if a component re-renders and the ref changes,
      // a new observer is set up.
      // However, for 'once' animations (disconnecting on first intersect),
      // we don't re-observe unless the component itself unmounts and remounts.
    };
  }, [options]); // Depend only on options, ref is consistent within a component instance

  return [ref, inView];
};

// Main App component for the DevBridge IDE Landing Page (renamed to Home as per user's component name)
const Home = () => {
  // State for mobile menu open/close
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Use useInView for different sections/elements
  const [heroRef, heroInView] = useInView({ threshold: 0.3 }); // When 30% of hero is visible
  const [featuresRef, featuresInView] = useInView({ threshold: 0.15 }); // When 15% of features section is visible
  const [demoRef, demoInView] = useInView({ threshold: 0.1 }); // When 10% of demo section is visible

  // Function to toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Function to close mobile menu (e.g., when a link is clicked)
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Animation variants for the mobile sidebar
  const mobileMenuVariants = {
    hidden: { x: "100%" },
    visible: { x: "0%", transition: { duration: 0.3, ease: "easeOut" } },
    exit: { x: "100%", transition: { duration: 0.2, ease: "easeIn" } },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-inter antialiased overflow-x-hidden">
      {/* Navbar */}
      <nav className="bg-gray-900 p-4 shadow-lg sticky top-0 z-50 rounded-b-xl border-b border-gray-800 backdrop-blur-sm bg-opacity-80">
        <div className="container mx-auto flex justify-between items-center px-4">
          <a href="/" className="text-2xl font-bold text-purple-400 flex items-center group" >
            <img className="w-10 h-10 mr-2" fill="currentColor"  src={icon}/>
             
            DevBridge IDE
          </a>
          {/* Desktop Navigation Links - Hidden on smaller screens */}
          <div className="hidden md:flex space-x-6 text-lg">
            <a href="#features" className="text-gray-300 hover:text-blue-400 transition duration-300 ease-in-out">Features</a>
            <a href="#demo" className="text-gray-300 hover:text-blue-400 transition duration-300 ease-in-out">Demo</a>
            <a href="/auth"  target='_blank' className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 font-thin hover:to-purple-700 text-white py-1 px-4 rounded-full transition duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
               Register/Login
            </a>
          </div>

          {/* Mobile Menu Button (Hamburger Icon) - Visible on smaller screens */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md transition duration-200"
            aria-label="Open mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            <FontAwesomeIcon icon={faBars} size="lg" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu (Off-canvas) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-70 z-40 md:hidden"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={closeMobileMenu} // Close menu when clicking backdrop
            ></motion.div>

            {/* Mobile Sidebar Content */}
            <motion.div
              className="fixed top-0 right-0 h-full w-3/4 bg-gray-900 shadow-2xl p-6 z-50 flex flex-col md:hidden transform"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Close Button */}
              <button
                onClick={closeMobileMenu}
                className="self-end p-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md transition duration-200 mb-6"
                aria-label="Close mobile menu"
              >
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>

              {/* Mobile Navigation Links */}
              <nav className="flex flex-col gap-6 text-xl">
                <a href="#features" onClick={closeMobileMenu} className="text-gray-300 hover:text-blue-400 transition duration-300 ease-in-out">Features</a>
                <a href="#demo" onClick={closeMobileMenu} className="text-gray-300 hover:text-blue-400 transition duration-300 ease-in-out">Demo</a>
                <a href="/auth" onClick={closeMobileMenu} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-full transition duration-300 ease-in-out shadow-md hover:shadow-lg text-center">
                 Register/Login
                </a>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <header ref={heroRef} className="relative py-24 md:py-32 text-center bg-gradient-to-br from-gray-950 to-gray-850 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(ellipse at center, rgba(147,197,253,0.1) 0%, rgba(0,0,0,0) 70%)' }}></div>
        <div className="container mx-auto px-6 relative z-10">
          <h1 className={`text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 ${heroInView ? 'animate-fade-in-up-hero' : 'opacity-0'}`}>
            Collaborate. Code. <span className="text-purple-400">Create.</span>
          </h1>
          <p className={`text-xl md:text-2xl text-gray-300 mb-10 max-w-4xl mx-auto ${heroInView ? 'animate-fade-in-hero delay-300' : 'opacity-0'}`}>
            Real-time collaborative code editor for seamless pair programming, online tutoring, and team development.
          </p>
          <div className={`${heroInView ? 'animate-scale-in-hero delay-600' : 'opacity-0'}`}>
            <a href="/auth" target='_blank' className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-10 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out text-lg pulsate-once">
            Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-20 bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-6 text-center">
          <h2 className={`text-4xl md:text-5xl font-bold text-white mb-16 ${featuresInView ? 'animate-fade-in-up-section' : 'opacity-0'}`}>Unleash Your Team's Potential</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className={`bg-gray-800 p-8 rounded-xl shadow-xl border border-gray-700 transform hover:scale-105 transition duration-300 group ${featuresInView ? 'animate-fade-in-feature delay-100' : 'opacity-0'}`}>
              <div className="text-blue-400 mb-6 group-hover:text-blue-300 transition duration-300 ease-in-out">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM6.5 9a.5.5 0 000 1h7a.5.5 0 000-1h-7z" clipRule="evenodd" />
                  <path d="M15 10a5 5 0 11-10 0 5 5 0 0110 0zM10 4.75a.75.75 0 00-.75.75v1.5a.75.75 0 001.5 0V5.5A.75.75 0 0010 4.75zM10 13.25a.75.75 0 00-.75.75v1.5a.75.75 0 001.5 0v-1.5a.75.75 0 00-.75-.75zM15.25 10a.75.75 0 00-.75-.75h-1.5a.75.75 0 000 1.5h1.5a.75.75 0 00.75-.75zM4.75 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Real-time Synchronization</h3>
              <p className="text-gray-400 text-lg leading-relaxed">Every keystroke is visible, fostering true collaborative programming regardless of location.</p>
            </div>
            {/* Feature 2 */}
            <div className={`bg-gray-800 p-8 rounded-xl shadow-xl border border-gray-700 transform hover:scale-105 transition duration-300 group ${featuresInView ? 'animate-fade-in-feature delay-200' : 'opacity-0'}`}>
              <div className="text-green-400 mb-6 group-hover:text-green-300 transition duration-300 ease-in-out">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-2 2a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1zm3 0a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Integrated Compiler</h3>
              <p className="text-gray-400 text-lg leading-relaxed">Run and test your code instantly. Supports various languages for immediate feedback.</p>
            </div>
            {/* Feature 3 */}
            <div className={`bg-gray-800 p-8 rounded-xl shadow-xl border border-gray-700 transform hover:scale-105 transition duration-300 group ${featuresInView ? 'animate-fade-in-feature delay-300' : 'opacity-0'}`}>
              <div className="text-yellow-400 mb-6 group-hover:text-yellow-300 transition duration-300 ease-in-out">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.767-1.39L2 17l1.395-4.767A7.944 7.944 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Live Chat & User Tracking</h3>
              <p className="text-gray-400 text-lg leading-relaxed">Communicate efficiently with teammates and stay aware of who's actively participating.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Short Demo Section */}
      <section id="demo" ref={demoRef} className="py-20 bg-gray-950 border-t border-b border-gray-800">
        <div className="container mx-auto px-6 text-center">
          <h2 className={`text-4xl md:text-5xl font-bold text-white mb-16 ${demoInView ? 'animate-fade-in-up-section' : 'opacity-0'}`}>DevBridge IDE In Action</h2>
          <p className={`text-lg text-gray-300 mb-12 max-w-2xl mx-auto ${demoInView ? 'animate-fade-in-section delay-200' : 'opacity-0'}`}>
            Explore the core functionalities that make DevBridge IDE your go-to collaborative coding environment.
          </p>

          <div className={`flex flex-col lg:flex-row gap-12 items-center mb-20 ${demoInView ? 'animate-fade-in-section delay-400' : 'opacity-0'}`}>
            <div className={`lg:w-1/2 text-left ${demoInView ? 'animate-slide-in-left-demo' : 'opacity-0'}`}>
              <h3 className="text-3xl font-semibold text-white mb-4">Seamless Real-time Editing</h3>
              <p className="text-gray-400 leading-relaxed text-lg mb-6">
                Witness instant code synchronization across all editors. Every character typed is reflected in real-time, enabling a truly unified coding experience.
              </p>
              <ul className="text-gray-300 list-disc list-inside space-y-2 text-md">
                <li>Instant character-by-character synchronization.</li>
                <li>Intuitive multi-cursor support for clear collaboration.</li>
                <li>Syntax highlighting for diverse programming languages.</li>
              </ul>
            </div>
            <div className={`lg:w-1/2 ${demoInView ? 'animate-slide-in-right-demo' : 'opacity-0'}`}>
              {/* Video Placeholder for Real-time Editing Demo */}
              <video
                className="w-full h-auto rounded-lg shadow-xl border-2 border-gray-700 transition-transform duration-500 hover:scale-102 bg-gray-700"
                autoPlay
                loop
                muted
                playsInline
                controls // Added controls for better user experience
                poster="https://placehold.co/700x450/2d3748/cbd5e0?text=Real-time+Editor+Video" // Thumbnail image
                onError={(e) => { e.target.onerror = null; e.target.poster = "https://placehold.co/700x450/2d3748/cbd5e0?text=Video+Not+Available"; }}
              >
                {/* Replace with your actual video source */}
                <source src={Devide} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          <div className={`flex flex-col lg:flex-row-reverse gap-12 items-center mb-20 ${demoInView ? 'animate-fade-in-section delay-600' : 'opacity-0'}`}>
            <div className={`lg:w-1/2 text-left ${demoInView ? 'animate-slide-in-right-demo' : 'opacity-0'}`}>
              <h3 className="text-3xl font-semibold text-white mb-4">Integrated Chat & Compiler Output</h3>
              <p className="text-gray-400 leading-relaxed text-lg mb-6">
                Communicate effortlessly with your team using the built-in live chat. Get immediate feedback on your code with integrated compiler outputs, highlighting errors and showing results.
              </p>
              <ul className="text-gray-300 list-disc list-inside space-y-2 text-md">
                <li>Real-time messaging within your coding session.</li>
                <li>Clear display of compiler and runtime outputs.</li>
                <li>Efficient workflow: code, chat, and debug in one place.</li>
              </ul>
            </div>
            <div className={`lg:w-1/2 ${demoInView ? 'animate-slide-in-left-demo' : 'opacity-0'}`}>
              {/* Video Placeholder for Chat & Compiler Demo */}
              <video
                className="w-full h-auto rounded-lg shadow-xl border-2 border-gray-700 transition-transform duration-500 hover:scale-102 bg-gray-700"
                autoPlay
                loop
                muted
                playsInline
                controls // Added controls for better user experience
                poster="https://placehold.co/700x450/2d3748/cbd5e0?text=Chat+%26+Output+Video" // Thumbnail image
                onError={(e) => { e.target.onerror = null; e.target.poster = "https://placehold.co/700x450/2d3748/cbd5e0?text=Video+Not+Available"; }}
              >
                {/* Replace with your actual video source */}
                <source src={webexp} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          <p className={`text-xl text-gray-300 max-w-2xl mx-auto mb-8 ${demoInView ? 'animate-fade-in-section delay-800' : 'opacity-0'}`}>
            Ready to experience frictionless collaborative coding?
          </p>
          <a href="/auth" target='_blank' className={`inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out text-lg ${demoInView ? 'pulsate-once delay-900' : 'opacity-0'}`}>
            Get Started Now
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 p-8 text-center text-gray-400 border-t border-gray-800 rounded-t-xl">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} DevBridge IDE. All rights reserved.</p>
        </div>
      </footer>

      {/* Custom CSS for Animations and Scrollbar */}
      <style>{`
        /* Font Import (if not handled globally) */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

        body {
          font-family: 'Inter', sans-serif;
        }

        /* Base classes for hidden state */
        .opacity-0 { opacity: 0; }
        
        /* Animations for Hero Section (play once on page load) */
        @keyframes fadeInHero {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUpHero {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleInHero {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulsateOnce {
            0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
            70% { box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); }
            100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }

        /* Applying animations for Hero Section */
        .animate-fade-in-hero { animation: fadeInHero 1s ease-out forwards; }
        .animate-fade-in-up-hero { animation: fadeInUpHero 1s ease-out forwards; }
        .animate-scale-in-hero { animation: scaleInHero 0.8s ease-out forwards; }
        .pulsate-once { animation: pulsateOnce 2s ease-out forwards; }


        /* Animations for Features and Demo Sections (scroll-triggered) */
        @keyframes fadeInSection {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUpSection {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInFeature {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeftDemo {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRightDemo {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }


        /* Applying animations with delays using custom class modifiers for scroll-triggered elements */
        /* These animations will only apply when the parent section is in view */
        .animate-fade-in-section { animation: fadeInSection 1s ease-out forwards; }
        .animate-fade-in-up-section { animation: fadeInUpSection 1s ease-out forwards; }
        .animate-fade-in-feature { animation: fadeInFeature 0.8s ease-out forwards; }
        .animate-slide-in-left-demo { animation: slideInLeftDemo 1s ease-out forwards; }
        .animate-slide-in-right-demo { animation: slideInRightDemo 1s ease-out forwards; }


        /* Delay utility classes (apply these after the animation class) */
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-600 { animation-delay: 0.6s; }
        .delay-800 { animation-delay: 0.8s; }
        .delay-900 { animation-delay: 0.9s; }


        /* Custom Scrollbar for global good looks */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #1f2937; /* Gray-800 equivalent */
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background-color: #4b5563; /* Gray-600 equivalent */
          border-radius: 10px;
          border: 2px solid #1f2937; /* Padding color */
        }
        /* Firefox */
        html {
          scrollbar-width: thin;
          scrollbar-color: #4b5563 #1f2937;
        }

        /* Ensure transform doesn't clip shadow or content */
        .feature-card {
            will-change: transform; /* Optimize for transform animation */
        }
      `}</style>
    </div>
  );
};

export default Home;
