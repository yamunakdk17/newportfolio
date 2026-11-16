import { Router } from 'express';
import { getHealthController, getPublicPortfolioController, getPublicCollectionController, getPublicProjectController, submitContactController } from '../controllers/portfolioController.js';
import { loginController, logoutController } from '../controllers/authController.js';

const router = Router();

router.get('/health', getHealthController);
router.get('/portfolio', getPublicPortfolioController);
router.get('/projects', getPublicCollectionController);
router.get('/projects/:slug', getPublicProjectController);
router.get('/about', getPublicCollectionController);
router.get('/capabilities', getPublicCollectionController);
router.get('/experience', getPublicCollectionController);
router.get('/education', getPublicCollectionController);
router.get('/certifications', getPublicCollectionController);
router.post('/contact', submitContactController);
router.post('/auth/login', loginController);
router.post('/auth/logout', logoutController);

export default router;
