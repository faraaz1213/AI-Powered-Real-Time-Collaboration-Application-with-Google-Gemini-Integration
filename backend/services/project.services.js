import projectModel from '../models/project.model.js'
import mongoose from 'mongoose';

export const createProject = async ({
    name,userId
}) => {
    if(!name){
        throw new Error ('Name is required')
    }
    if(!userId){
        throw new Error('User is required')
    }

    let project;
    try {
        project = await projectModel.create({
            name,
            users: [userId]
        });
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
            throw new Error('Project name already exists');
        }
        throw error;
    }

    return project;

}

export const getAllProjectByUserId = async({userId}) =>{
    if(!userId) {
        throw new Error('UserId is required')
    }

    const allUserProjects = await projectModel.find({
        users: userId
    })

    return allUserProjects
}

export const addUsersToProject = async ({ projectId,users,userId}) => {
    if(!projectId){
        throw new Error("projectId is required")
    }

    if(!users){
        throw new Error("users are required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId");
    }

    if (!Array.isArray(users) || users.length === 0) {
        throw new Error("users must be a non-empty array");
    }

    if(!userId) {
        throw new Error("userId is required")
    }

    for (const uid of users) {
    if (!mongoose.Types.ObjectId.isValid(uid)) {
        throw new Error(`Invalid userId: ${uid}`);
    }
}


    const project = await projectModel.findOne({
        _id: projectId,
        users: userId
    })

    if(!project){
        throw new Error("User not belong to this project")
    }

    const updatedProject = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        $addToSet: {
            users: {
                $each: users
            }
        }
    }, {
        new: true
    })

    return updatedProject
}

export const getProjectById = async ({ projectId, userId }) => {
  if (!projectId) {
    throw new Error("projectId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid projectId");
  }

  const project = await projectModel.findOne({
    _id: projectId
  }).populate('users','name email')

  return project;
};

export const deleteProject = async ({ projectId }) => {
  if (!projectId) throw new Error('Project ID required');
  return await projectModel.findByIdAndDelete(projectId);
};
