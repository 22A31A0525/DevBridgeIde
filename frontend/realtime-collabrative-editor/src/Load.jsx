import { useState, useEffect } from "react";
import api from "./services/axios";
import { useNavigate } from "react-router";
import toast, { Toaster } from "react-hot-toast";
import LoadingSpinner from "./animations/LoadingSpinner";

function Load() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Start loading
        const res = await api.get("/");
        setData(res.data);
        setError(null); // Clear any previous errors
      } catch (err) {
        setError(err); // Store the error
        toast.error("User not logged in, redirecting to login page...");
        setTimeout(() => {
          navigate("/auth");
        }, 800);
      } finally {
        setLoading(false); // Stop loading regardless of success or failure
      }
    };

    fetchData();
  }, [navigate]);

  return (
    // Add these Tailwind classes to the outer div
    <div className="flex items-center justify-center min-h-screen ">
      {loading ? (
        <LoadingSpinner information={"Content Loading"} /> // Show spinner while loading
      ) : error && !data ? (
        // If there's an error and no data (meaning redirect is happening)
        <div className="text-white text-center p-4">
          <p>Loading failed. Redirecting...</p>
        </div>
      ) : (
        // If loading is false and there's data, display the data
        <h1 className="text-white text-2xl font-semibold">{data}</h1>
      )}
      <Toaster position="top-center" /> {/* Toaster is typically placed high in the tree */}
    </div>
  );
}

export default Load;