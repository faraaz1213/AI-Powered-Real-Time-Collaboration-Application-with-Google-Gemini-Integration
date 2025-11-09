import { Router } from 'express';
import { body } from 'express-validator';
import * as projectController from "../controllers/project.controller.js";
import { getProjectById } from "../controllers/project.controller.js";
import * as authMiddleWare from '../middleware/auth.middleware.js';


const router = Router();

router.post('/create',
    authMiddleWare.authUser,
    body('name').isString().withMessage('Name is required'),
    projectController.createProject
)

router.get('/all',
    authMiddleWare.authUser,
    projectController.getAllProject
)

router.put('/add-user',
    authMiddleWare.authUser,
    body('projectId').isString().withMessage('ProjectId must be a string'),
    body('users').isArray().withMessage('Users must be an array')
        .custom((users) => users.every(user => typeof user === 'string')).withMessage('Each user must be a string'),
    projectController.addUserToProject
)

router.get('/get-project/:projectId', authMiddleWare.authUser, getProjectById);

router.delete(
  '/delete/:projectId',
  authMiddleWare.authUser,
  projectController.deleteProject
);
export default router;