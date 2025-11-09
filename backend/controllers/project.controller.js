import projectModel from '../models/project.model.js';
import * as projectService from '../services/project.services.js';
import userModel from '../models/user.model.js';
import { validationResult } from 'express-validator';

export const createProject = async (req , res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name } = req.body;

        // 🔹 req.user must be set by auth middleware
        if (!req.user || !req.user.email) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const loggedInUser = await userModel.findOne({ email: req.user.email });
        if (!loggedInUser) return res.status(404).json({ message: "User not found" });

        const userId = loggedInUser._id;

        const newProject = await projectService.createProject({ name, userId });

        res.status(201).json(newProject);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
};

export const getAllProject = async (req, res) => {
    try{
        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })

    const allUserProjects = await projectService.getAllProjectByUserId({
        userId: loggedInUser._id
    })

    return res.status(200).json({
        projects: allUserProjects
    })
    } catch(err){
    console.log(err)
    res.status(400).json({error: err.message})
    }
};

export const addUserToProject = async (req,res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() })
    }

    try {
        const { projectId, users } = req.body

        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })

        const project = await projectService.addUsersToProject({
            projectId,
            users,
            userId: loggedInUser._id
        })
        return res.status(200).json({ message: "Users added successfully", project });

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message})
    }
};

export const getProjectById = async (req, res) => {
  const { projectId } = req.params;
  try {
    const project = await projectService.getProjectById({ projectId });
    res.status(200).json({ project });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Validate project ID
    if (!projectId) return res.status(400).json({ message: "Project ID is required" });

    // Check if user is authorized
    const loggedInUser = await userModel.findOne({ email: req.user.email });
    if (!loggedInUser) return res.status(401).json({ message: "Unauthorized user" });

    // Find project and ensure the user belongs to it
    const project = await projectModel.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const isOwner = project.users.some(
      (u) => u.toString() === loggedInUser._id.toString()
    );
    if (!isOwner)
      return res.status(403).json({ message: "You are not allowed to delete this project" });

    // Delete project
    await projectModel.findByIdAndDelete(projectId);
    return res.status(200).json({ message: "Project deleted successfully" });

  } catch (err) {
    console.error("❌ Error deleting project:", err);
    res.status(500).json({ message: "Internal Server Error while deleting project" });
  }
};
