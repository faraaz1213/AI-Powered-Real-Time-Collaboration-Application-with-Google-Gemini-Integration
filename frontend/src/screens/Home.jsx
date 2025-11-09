import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/user.context";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { RiAddFill, RiLink, RiLogoutCircleRLine, RiDeleteBin6Line, RiSearch2Line } from "react-icons/ri";
import Particles from "react-tsparticles";

const gradientStyle = `
@keyframes gradientBG {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.bg-animated-gradient {
  background: linear-gradient(270deg, #0f172a, #1e3a8a, #9333ea, #10b981);
  background-size: 800% 800%;
  animation: gradientBG 18s ease infinite;
}
.animate-fadeIn { animation: fadeIn 1s ease forwards; opacity: 0; }
@keyframes fadeIn { to { opacity: 1; } }
`;

const Home = () => {
  const { user, logout } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await axios.get("/projects/all");
      setProjects(res.data.projects);
    } catch (err) {
      console.error("❌ Failed to fetch projects:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const createProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/projects/create", { name: projectName });
      setIsModalOpen(false);
      setProjectName("");
      fetchProjects();
    } catch (err) {
      console.error("❌ Project creation failed:", err.response?.data || err.message);
    }
  };

  const deleteProject = async (projectId, name) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete project "${name}"?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`/projects/delete/${projectId}`);
      setProjects(projects.filter((p) => p._id !== projectId));
    } catch (err) {
      console.error("❌ Error deleting project:", err.response?.data || err.message);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen relative bg-animated-gradient flex flex-col items-center justify-center overflow-hidden p-6">
      <style>{gradientStyle}</style>

      {/* Animated Particle Background */}
      <Particles
        options={{
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          particles: {
            color: { value: "#ffffff" },
            links: { enable: true, color: "#ffffff", distance: 120 },
            move: { enable: true, speed: 1 },
            number: { value: 70 },
            opacity: { value: 0.25 },
            size: { value: 2 },
          },
        }}
        className="absolute inset-0 z-0"
      />

      {/* Top Navbar */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center px-8 py-4 gap-4 z-10 backdrop-blur-2xl bg-white/10 border-b border-white/20 rounded-3xl shadow-xl">
        <h1 className="text-2xl font-extrabold text-white tracking-wide">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            CodeGenie
          </span>
        </h1>

        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg border border-white/20 px-4 py-2 rounded-2xl shadow-md w-full md:w-96">
          <RiSearch2Line className="text-white/60 text-lg" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow bg-transparent border-none outline-none text-white placeholder-white/60"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white font-medium shadow-lg hover:scale-105 transition-all"
          >
            + New Project
          </button>
          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl text-white font-medium shadow-lg hover:scale-105 transition-all"
          >
            <RiLogoutCircleRLine /> Logout
          </button>
        </div>
      </div>

      {/* Welcome Header */}
      <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-10 text-center animate-fadeIn">
        Welcome, <span className="text-indigo-300">{user?.name || "Developer"}</span> 👋
      </h2>
      <p className="text-white/70 text-lg text-center max-w-2xl mt-4 mb-10">
        Manage, collaborate, and build smarter projects — all in real time.
      </p>

      {/* Project Cards */}
      {loading ? (
        <div className="text-white/70 text-lg mt-10">Loading your projects...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-white/70 mt-10 text-lg">No projects found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8 w-full max-w-5xl z-10">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="group relative p-6 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-xl hover:scale-105 transform transition-all duration-300 overflow-hidden"
            >
              <div
                onClick={() => navigate(`/project`, { state: { project } })}
                className="cursor-pointer"
              >
                <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
                <p className="text-white/60 text-sm mb-4">
                  {project.users?.length || 0} Collaborators
                </p>
                <div className="flex justify-between items-center text-white/80">
                  <span className="text-sm italic">Click to Open</span>
                  <RiLink className="text-2xl text-indigo-300 group-hover:rotate-12 transition-transform" />
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => deleteProject(project._id, project.name)}
                className="absolute top-3 right-3 p-2 bg-red-600/70 hover:bg-red-700 rounded-full shadow-md transition-all"
              >
                <RiDeleteBin6Line className="text-white text-lg" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 w-96 shadow-2xl z-10 flex flex-col gap-5">
            <h2 className="text-2xl font-bold text-white text-center">
              Create New Project
            </h2>
            <input
              type="text"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-xl font-semibold transition-transform transform hover:scale-105 text-white"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                className="flex-1 py-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 rounded-xl font-semibold transition-transform transform hover:scale-105 text-white"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
