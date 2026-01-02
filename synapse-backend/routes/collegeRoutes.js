import express from "express";
import { searchColleges, requestCollege } from "../controllers/collegeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/search", searchColleges);
router.post("/request", protect, requestCollege);

export default router;
