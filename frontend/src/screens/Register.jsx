import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { UserContext } from "../context/user.context";
import Particles from "react-tsparticles";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  async function submitHandler(e) {
    e.preventDefault();
    setErrors([]);

    if (password !== confirmPassword)
      return setErrors(["Passwords do not match"]);
    if (fullName.trim().length < 2)
      return setErrors(["Please enter your full name"]);

    try {
      const res = await axios.post("/users/register", {
        name: fullName,
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      navigate("/");
    } catch (err) {
      setErrors([err.response?.data?.message || "Registration failed"]);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0f172a]">
      {/* Particle Background */}
      <Particles
        options={{
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          particles: {
            color: { value: "#ffffff" },
            links: { enable: true, color: "#64748b", distance: 140 },
            move: { enable: true, speed: 1 },
            number: { value: 60 },
            opacity: { value: 0.3 },
            size: { value: 2 },
          },
        }}
        className="absolute inset-0 z-0"
      />

      {/* Animated Gradient Blobs */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-indigo-500 opacity-25 blur-3xl rounded-full animate-blob"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-500 opacity-25 blur-3xl rounded-full animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-32 w-72 h-72 bg-purple-600 opacity-20 blur-3xl rounded-full animate-blob animation-delay-4000"></div>

      {/* Register Card */}
      <div className="relative w-full max-w-md bg-white/10 border border-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 flex flex-col items-center z-10">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-pink-400 text-transparent bg-clip-text mb-3">
          Create Your Account
        </h1>
        <p className="text-gray-300 text-sm mb-8 text-center">
          Start collaborating, building, and chatting in real-time 🚀
        </p>

        {/* Register Form */}
        <form onSubmit={submitHandler} className="w-full space-y-5">
          <div className="group">
            <label className="block text-sm text-gray-300 mb-1 ml-1">
              Full Name
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              type="text"
              placeholder="John Doe"
              className="w-full px-5 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 text-white focus:ring-2 focus:ring-indigo-400 outline-none transition-all duration-200 group-hover:border-indigo-400"
              required
            />
          </div>

          <div className="group">
            <label className="block text-sm text-gray-300 mb-1 ml-1">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="example@email.com"
              className="w-full px-5 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 text-white focus:ring-2 focus:ring-indigo-400 outline-none transition-all duration-200 group-hover:border-indigo-400"
              required
            />
          </div>

          <div className="group">
            <label className="block text-sm text-gray-300 mb-1 ml-1">
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="w-full px-5 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 text-white focus:ring-2 focus:ring-indigo-400 outline-none transition-all duration-200 group-hover:border-indigo-400"
              required
            />
          </div>

          <div className="group">
            <label className="block text-sm text-gray-300 mb-1 ml-1">
              Confirm Password
            </label>
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="w-full px-5 py-3 rounded-xl bg-white/10 border border-white/20 placeholder-gray-400 text-white focus:ring-2 focus:ring-indigo-400 outline-none transition-all duration-200 group-hover:border-indigo-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl text-white font-bold shadow-lg hover:shadow-indigo-500/40 hover:scale-105 transform transition-all duration-300"
          >
            Create Account
          </button>
        </form>

        {/* Error messages */}
        {errors.length > 0 && (
          <ul className="mt-4 text-red-400 text-sm list-disc list-inside animate-fadeIn">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        )}

        <p className="text-gray-400 text-sm text-center mt-6">
          Already have an account?{" "}
          <Link
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-200 underline underline-offset-2"
            to="/login"
          >
            Login
          </Link>
        </p>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 8s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}
