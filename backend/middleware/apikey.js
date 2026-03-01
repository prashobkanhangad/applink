import * as dotenv from 'dotenv'
import { ApiKey } from '../models/apiKey.model.js';
dotenv.config()

export const apiKeyValidation = async (req, res, next) => {
    if(process.env.NODE_ENV === 'development'){
        return next();
    }
    const apiKey = req.headers['x-api-key'];

    if(!apiKey.startsWith('dl_live_')){
        return res.status(401).json({ error: 'Invalid API key.' });
    }

    if(!apiKey){
        return res.status(401).json({ error: 'API key required. Provide X-Api-Key header or Authorization: Bearer <key>.' });
    }
    const keyHash = apiKey.split('dl_live_')[1];

    const existingApiKey = await ApiKey.findOne({ keyHash });


   if(!existingApiKey){
    return res.status(401).json({ error: 'Invalid API key.' });
   }

   if(existingApiKey.status !== 'active'){
    return res.status(401).json({ error: 'API key is not active.' });
   }

   if(existingApiKey.keyHash === keyHash){
        req.apiKeyUserId = existingApiKey.userId;
        next();
   }

   return res.status(401).json({ error: 'Invalid API key.' });
   
}