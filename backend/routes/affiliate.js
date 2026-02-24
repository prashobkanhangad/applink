import { Router } from 'express';
import { joinAffiliate } from '../controllers/affiliate/affiliate.controller.js';

const affiliateRoute = Router();

affiliateRoute.post('/join', joinAffiliate);

export default affiliateRoute;
