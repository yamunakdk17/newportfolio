import { Router } from 'express';
import { createProjectController, deleteMessageController, deleteProjectController, getAdminCollectionController, getAdminProjectsController, listMessagesController, publishProjectController, saveAdminCollectionController, updateMessageController, updateProjectController, uploadImageController } from '../controllers/portfolioController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateProject, validatePublishStatus } from '../middleware/projectValidation.js';

const router = Router();
router.use(requireAuth);

router.post('/uploads', uploadImageController);
router.get('/projects', getAdminProjectsController);
router.get('/messages', listMessagesController);
router.get('/:collection', getAdminCollectionController);
router.post('/projects', validateProject, createProjectController);
router.patch('/projects/:id/publish', validatePublishStatus, publishProjectController);
router.put('/projects/:id', validateProject, updateProjectController);
router.delete('/projects/:id', deleteProjectController);
router.put('/:collection', saveAdminCollectionController);
router.put('/messages/:id', updateMessageController);
router.delete('/messages/:id', deleteMessageController);

export default router;
