import { Router } from 'express';
import { verifyJWT } from '../services/jwt.js';
import { listKeys, createKey, revokeKey } from '../controllers/keys/keys.controller.js';

const keysRoute = Router();
keysRoute.use(verifyJWT);

keysRoute.get('/', listKeys);
keysRoute.post('/', createKey);
keysRoute.delete('/:id', revokeKey);

export default keysRoute;
