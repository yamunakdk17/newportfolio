import { Router } from 'express';
import {
  createProjectController,
  deleteMessageController,
  deleteProjectController,
  getAdminCollectionController,
  getAdminProjectsController,
  listMessagesController,
  publishProjectController,
  saveAdminCollectionController,
  updateMessageController,
  updateProjectController,
  uploadImageController,
} from '../controllers/portfolioController.js';
import { requireAuth } from '../middleware/auth.js';
import {
  validateProject,
  validatePublishStatus,
} from '../middleware/projectValidation.js';

const router = Router();

router.get('/', (_request, response) => {
  const frontendOrigin = (
    process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
  ).replace(/\/+$/, '');

  return response.redirect(302, `${frontendOrigin}/admin/login`);
});

router.use(requireAuth);

router.post('/uploads', uploadImageController);

router.get('/projects', getAdminProjectsController);
router.post('/projects', validateProject, createProjectController);
router.patch(
  '/projects/:id/publish',
  validatePublishStatus,
  publishProjectController,
);
router.put('/projects/:id', validateProject, updateProjectController);
router.delete('/projects/:id', deleteProjectController);

router.get('/messages', listMessagesController);
router.put('/messages/:id', updateMessageController);
router.delete('/messages/:id', deleteMessageController);

router.get('/:collection', getAdminCollectionController);
router.put('/:collection', saveAdminCollectionController);

export default router;
