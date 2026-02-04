import { Router } from "express";
import authRoute from "./auth.js";
import appRoute from "./app.js";
import planRoute from "./plan.js";
import domainRoute from "./domain.js";
<<<<<<< HEAD
import trackRoute from "./track.js";
=======
import sdkRoute from "./sdk.js";
>>>>>>> b1991b01ad609020ea0da1f9218a7f8fb3c0792d

const route = Router();




route.use("/auth", authRoute);

route.use("/app", appRoute);

route.use("/plans", planRoute);

route.use("/domain", domainRoute);

<<<<<<< HEAD
route.use("/track", trackRoute);

=======
route.use("/sdk", sdkRoute);
>>>>>>> b1991b01ad609020ea0da1f9218a7f8fb3c0792d



export default route;