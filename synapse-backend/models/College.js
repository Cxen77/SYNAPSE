import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema({
    canonicalName: { type: String, required: true, index: true },
    aliases: [{ type: String, index: true }], // e.g. "IITB", "IIT Bombay"
    city: String,
    state: String,
    country: { type: String, default: "India" },
    verified: { type: Boolean, default: true },
    domain: String // optional, from the world list
}, { timestamps: true });

// Text index for weighted search
collegeSchema.index({ canonicalName: 'text', aliases: 'text' });

export default mongoose.model("College", collegeSchema);
