import { Router } from "express";
import { listPublishedPosts, getPublishedPostBySlug } from "../controllers/blog/blog.controller.js";

const blogRoute = Router();

blogRoute.get("/", listPublishedPosts);
blogRoute.get("/:slug", getPublishedPostBySlug);

export default blogRoute;
