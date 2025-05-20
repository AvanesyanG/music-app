import express from 'express';
import {addAlbum,listAlbum,removeAlbum} from "../controllers/albumController.js"
import upload from "../middleware/multer.js"
import { protectRoute } from "../middleware/authMiddleware.js"

const albumRouter = express.Router();

// All routes are protected with Clerk authentication
albumRouter.post("/add", protectRoute, upload.single("image"), addAlbum)
albumRouter.get("/list", protectRoute, listAlbum)
albumRouter.delete("/remove/:id", protectRoute, removeAlbum)

export default albumRouter;