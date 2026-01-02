import College from "../models/College.js";

// GET /api/colleges/search?q=...
export const searchColleges = async (req, res) => {
    try {
        const q = req.query.q?.trim();
        if (!q) return res.json([]);

        // Using regex for partial matching (simple autocomplete)
        // For production with millions, valid text search/aggregation is better, 
        // but for <50k docs, regex on indexed field is okay-ish or text search.
        // User requested regex example:
        const regex = new RegExp(q, "i");

        const colleges = await College.find({
            $or: [
                { canonicalName: regex },
                { aliases: regex }
            ]
        })
            .limit(20) // Limit results
            .select("_id canonicalName city state country");

        res.json(colleges);
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ message: "Search failed" });
    }
};

// POST /api/colleges/request
// Payload: { name, city, state? }
export const requestCollege = async (req, res) => {
    try {
        const { name, city, state } = req.body;
        if (!name) return res.status(400).json({ message: "College name is required" });

        // Check if exists
        const existing = await College.findOne({
            canonicalName: { $regex: new RegExp(`^${name}$`, "i") }
        });

        if (existing) {
            return res.status(200).json({ message: "College already exists", college: existing });
        }

        // Create unverified college
        const newCollege = await College.create({
            canonicalName: name,
            city: city || "",
            state: state || "",
            verified: false,
            aliases: []
        });

        res.status(201).json({ message: "Request submitted", college: newCollege });

    } catch (error) {
        console.error("Request college error:", error);
        res.status(500).json({ message: "Request failed" });
    }
};
