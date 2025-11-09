import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from '../config/axios';
import { useLocation } from 'react-router-dom';
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket';
import { UserContext } from '../context/user.context.jsx';
import Particles from "react-tsparticles";
import Markdown from 'markdown-to-jsx';

const gradientStyle = `
@keyframes gradientBG {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.bg-animated-gradient {
  background: linear-gradient(270deg, #111827, #1e3a8a, #9333ea, #10b981);
  background-size: 600% 600%;
  animation: gradientBG 18s ease infinite;
}
`;

const Project = () => {
  const location = useLocation();
  const projectId = location?.state?.project?._id;

  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useContext(UserContext);
  const messageRef = useRef();

  // Fetch project + messages
  const fetchProject = async () => {
    try {
      const res = await axios.get(`/projects/get-project/${projectId}`);
      setProject(res.data.project);

      res.data.project.messages.forEach((msg) => {
        const senderEmail = msg.sender.email || msg.sender;
        if (senderEmail === user.email) appendOutgoingMessage({ sender: senderEmail, message: msg.message });
        else appendIncomingMessage({ sender: senderEmail, message: msg.message });
      });
    } catch (err) {
      console.error('❌ Error fetching project:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/users/all');
      setUsers(res.data.users);
    } catch (err) {
      console.error('❌ Error fetching users:', err);
    }
  };

  useEffect(() => {
    const socket = initializeSocket(projectId);

    receiveMessage('project-message', (data) => {
      if (data.sender !== user.email) appendIncomingMessage(data);
    });

    receiveMessage('user-typing', ({ user: u }) => {
      if (u !== user.email) setTypingUsers(prev => [...new Set([...prev, u])]);
    });

    receiveMessage('user-stop-typing', ({ user: u }) => {
      setTypingUsers(prev => prev.filter(x => x !== u));
    });

    fetchProject();
    fetchUsers();

    return () => {
      socket?.disconnect();
    };
  }, []);

  const addCollaborator = async () => {
    if (!selectedUserId) return alert('Select a collaborator first!');
    try {
      await axios.put('/projects/add-user', { projectId, users: [selectedUserId] });
      setSelectedUserId(null);
      setIsModalOpen(false);
      fetchProject();
    } catch (err) {
      console.error('❌ Error adding collaborator:', err);
    }
  };

  const send = () => {
    if (!message.trim()) return;
    sendMessage('project-message', { message, sender: user.email });
    appendOutgoingMessage({ sender: user.email, message });
    setMessage('');
    sendMessage('stop-typing');
  };

  // Append message to UI
  function appendIncomingMessage(messageObject) {
    const box = messageRef.current;
    if (!box) return;
    const div = document.createElement('div');
    div.classList.add('p-3', 'rounded-xl', 'max-w-[70%]', 'text-white', 'shadow-md', 'bg-gradient-to-r', 'from-indigo-600', 'to-purple-600', 'fade-in');
    div.innerHTML = `
      <small class='opacity-70 text-xs'>${messageObject.sender}</small>
      <p class='text-sm mt-1 leading-snug'>${messageObject.message}</p>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  function appendOutgoingMessage(messageObject) {
    const box = messageRef.current;
    if (!box) return;
    const div = document.createElement('div');
    div.classList.add('p-3', 'rounded-xl', 'max-w-[70%]', 'ml-auto', 'text-white', 'shadow-md', 'bg-gradient-to-r', 'from-green-500', 'to-teal-500', 'fade-in');
    div.innerHTML = `
      <small class='opacity-70 text-xs'>${messageObject.sender}</small>
      <p class='text-sm mt-1 leading-snug'>${messageObject.message}</p>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  if (!project) return <div className="text-center text-white mt-10 text-lg">Loading project...</div>;

  const filteredUsers = project.users?.filter((u) => {
    const name = u.name ? u.name.toLowerCase() : '';
    const email = u.email ? u.email.toLowerCase() : '';
    return name.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
  });

  return (
    <>
      <style>{gradientStyle}</style>
      <main className="h-screen w-screen flex relative bg-animated-gradient">
        <Particles
          options={{
            background: { color: { value: "transparent" } },
            fpsLimit: 60,
            interactivity: { events: { onHover: { enable: true, mode: "repulse" } } },
            particles: {
              color: { value: "#ffffff" },
              links: { enable: true, color: "#ffffff", distance: 140 },
              move: { enable: true, speed: 0.8 },
              number: { value: 70 },
              opacity: { value: 0.3 },
              size: { value: 2 },
            },
          }}
          className="absolute inset-0 z-0 pointer-events-none"
        />

        {/* Sidebar */}
        <aside className="flex flex-col w-72 backdrop-blur-2xl bg-white/10 border-r border-white/20 text-white shadow-2xl p-5 overflow-y-auto z-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold tracking-wide">Collaborators</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg hover:scale-105 transition-all shadow-md"
              >
                + Add
              </button>
              <button
                onClick={() => {
                  logout();
                  window.location.href = '/login';
                }}
                className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg hover:scale-105 transition-all shadow-md"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search user..."
            className="w-full mb-4 px-4 py-2 bg-white/10 text-white placeholder-gray-300 rounded-lg border border-white/20 focus:ring-2 focus:ring-indigo-400 outline-none transition-all duration-200"
          />

          {filteredUsers?.length > 0 ? (
            filteredUsers.map((u) => (
              <div
                key={u._id}
                className="flex gap-3 items-center p-3 mb-2 rounded-xl hover:bg-white/10 transition-all duration-200 cursor-pointer"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md">
                  <i className="ri-user-fill text-lg"></i>
                </div>
                <div className="overflow-hidden">
                  <h1 className="font-semibold text-sm truncate">{u.name || "User"}</h1>
                  <p className="text-xs text-gray-300 truncate">{u.email}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm text-center mt-10">No users found</p>
          )}
        </aside>

        {/* Chat Section */}
        <section className="flex-1 flex flex-col p-6 z-10">
          <div
            ref={messageRef}
            className="flex-1 flex flex-col gap-3 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-800 p-4 rounded-2xl bg-black/20 shadow-inner"
          />

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="text-sm text-gray-300 mt-1 ml-2 italic">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </div>
          )}

          {/* Message Input */}
          <div className="mt-4 flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-lg">
            <input
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (e.target.value.trim() !== '') sendMessage('typing');
                else sendMessage('stop-typing');
              }}
              className="flex-grow p-3 px-5 text-white bg-transparent border-none outline-none placeholder-gray-400"
              type="text"
              placeholder="Type a message..."
            />
            <button
              onClick={send}
              className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 transition-transform hover:scale-105 shadow-md"
            >
              <i className="ri-send-plane-fill text-white text-xl"></i>
            </button>
          </div>
        </section>

        {/* Collaborator Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-gray-900/90 backdrop-blur-2xl rounded-2xl p-8 w-11/12 sm:w-96 text-white shadow-2xl border border-white/10">
              <h2 className="text-2xl font-bold mb-5 text-center text-indigo-300">Select a Collaborator</h2>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {users.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => setSelectedUserId(u._id)}
                    className={`cursor-pointer flex flex-col p-3 rounded-xl border border-white/10 hover:bg-indigo-700/40 transition-all ${
                      selectedUserId === u._id ? 'bg-indigo-600/50 border-indigo-300 shadow-lg' : ''
                    }`}
                  >
                    <p className="text-sm font-semibold">{u.name}</p>
                    <small className="text-gray-300">{u.email}</small>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={addCollaborator}
                  className="flex-1 py-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl hover:scale-105 shadow-md transition-all font-semibold"
                >
                  Add
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl hover:scale-105 shadow-md transition-all font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Project;
