import { useState, useEffect }from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AuthForm from "./AuthForm";
import AnimatedBackground from '../background/AnimatedBackground';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const backendHost = window.location.hostname;
  const backendPort = import.meta.env.VITE_APP_BACKEND_PORT;

  // Effect to check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // If a token exists, user is already logged in, redirect to dashboard
      navigate("/dashboard");
      toast.success("Already logged in, redirecting to dashboard!"); // Optional: inform user
    }
  }, [navigate]);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -20,
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  const handleGoBack = () => {
    navigate("/");
  };

  const toggleMode = () => {
    setForm({ username: "", email: "", password: "" });
    setMode((prev) => (prev === "login" ? "register" : "login"));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateFields = () => {
    if (!form.username.trim() || !form.password.trim()) {
      toast.error("Username and password are required.");
      return false;
    }
    if (mode === "register" && !form.email.trim()) {
      toast.error("Email is required for registration.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    setLoading(true);
    const url =
      mode === "login"
        ? `http://${backendHost}:${backendPort}/auth/login`
        : `http://${backendHost}:${backendPort}/auth/register`;

    let payload;
    if (mode === "login") {
      payload = { username: form.username.toLowerCase(), password: form.password };
    } else { // mode === "register"
      payload = { username: form.username.toLowerCase(), email: form.email, password: form.password };
    }

    try {
      const res = await axios.post(url, payload);
      if (mode === "login" && res.data) {
        localStorage.setItem("token", res.data);
        toast.success("Logged in successfully!");
        navigate("/dashboard");
      } else {
        toast.success("Registration successful! You can now log in.");
        setMode("login");
      }
    } catch (err) {
      let errorMessage = "Authentication failed! Please try again.";
      if (err.response) {
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.status === 401) {
          errorMessage = "Incorrect username or password.";
        } else if (err.response.status === 409 && mode === "register") {
          errorMessage = "Username or email already exists.";
        } else if (err.response.status >= 400 && err.response.status < 500) {
          errorMessage = `Client error (${err.response.status}): ${err.response.statusText}`;
        } else if (err.response.status >= 500) {
          errorMessage = `Server error (${err.response.status}): Please try again later.`;
        }
      } else if (axios.isAxiosError(err) && err.request) {
        errorMessage = "No response from server. Check your network connection or server status.";
      } else {
        errorMessage = `An unexpected error occurred: ${err.message}`;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center text-gray-100">
      <AnimatedBackground/>
      <Toaster position="top-center" />

      <div className="absolute inset-0 flex items-center justify-center px-4 z-10">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md p-8 rounded-2xl bg-gray-800 bg-opacity-70 backdrop-blur-md shadow-2xl transform hover:scale-[1.02] transition duration-300 flex items-center justify-center text-white text-xl"
              style={{ minHeight: '200px' }}
            >
              Loading...
            </motion.div>
          ) : (
            <motion.div
              key="authForm"
              className="w-full max-w-md p-8 rounded-2xl bg-gray-800 bg-opacity-70 backdrop-blur-md shadow-2xl transform hover:scale-[1.02] transition duration-300 relative"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <button
                onClick={handleGoBack}
                className="absolute top-4 left-4 p-2 bg-gray-700 hover:bg-gray-600 rounded-full text-gray-300 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 z-20"
                aria-label="Back to home"
                title="Back to home"
              >
                <FontAwesomeIcon icon={faArrowLeft} size="lg" />
              </button>

              <h2 className="text-3xl font-bold text-center text-white mb-6 capitalize tracking-wide">
                {mode}
              </h2>
              <AuthForm
                mode={mode}
                form={form}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                loading={loading}
                toggleMode={toggleMode}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login;
