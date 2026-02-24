import { Router } from 'express';
import { verifyJWT } from '../services/jwt.js';
import { requireAdmin } from '../services/requireAdmin.js';
import { getStats, getUsers, getApps, updateUserRole, getUserById, getAppById, getPlans, getPlanById, createPlan, updatePlan, deletePlan, getLinks, getLinkById, deleteLink, getAffiliates } from '../controllers/admin/admin.controller.js';

const adminRoute = Router();

adminRoute.use(verifyJWT);
adminRoute.use(requireAdmin);

adminRoute.get('/stats', getStats);
adminRoute.get('/users', getUsers);
adminRoute.get('/users/:id', getUserById);
adminRoute.get('/apps', getApps);
adminRoute.get('/apps/:id', getAppById);
adminRoute.patch('/users/:id/role', updateUserRole);
adminRoute.get('/plans', getPlans);
adminRoute.get('/plans/:id', getPlanById);
adminRoute.post('/plans', createPlan);
adminRoute.patch('/plans/:id', updatePlan);
adminRoute.delete('/plans/:id', deletePlan);
adminRoute.get('/links', getLinks);
adminRoute.get('/links/:id', getLinkById);
adminRoute.delete('/links/:id', deleteLink);
adminRoute.get('/affiliates', getAffiliates);

export default adminRoute;
