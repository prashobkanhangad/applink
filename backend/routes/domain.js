import { Router } from "express";
import { 
    addDomain, 
    verifyDomainEndpoint, 
    getDomains, 
    getDomain, 
    deleteDomain, 
} from "../controllers/domain/domain.controller.js";
import { verifyJWT } from "../services/jwt.js";

const domainRoute = Router();



// All domain routes require authentication
domainRoute.use(verifyJWT);

// Add a new domain
domainRoute.post("/add", addDomain);

// Verify a domain
domainRoute.post("/verify/:id", verifyDomainEndpoint);

// Get all domains for the user
domainRoute.get("/list", getDomains);

// Get a specific domain by ID
domainRoute.get("/:id", getDomain);

// Delete a domain
domainRoute.delete("/:id", deleteDomain);






export default domainRoute;
