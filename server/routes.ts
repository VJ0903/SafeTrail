import express from "express";
import { z } from "zod";
import { storage } from "./storage.js";
import {
  insertUserSchema,
  insertTouristProfileSchema,
  insertDigitalIdSchema,
  type User,
  type TouristProfile,
  type DigitalId,
} from "../shared/schema.js";

const router = express.Router();

// Tourist Profile Login (main authentication method)
router.post("/api/login", async (req, res) => {
  try {
    const loginSchema = z.object({
      touristId: z.string(),
      fullName: z.string(),
    });
    
    const { touristId, fullName } = loginSchema.parse(req.body);
    
    let profile = await storage.getTouristProfile(touristId);
    
    // If profile doesn't exist, create a new one for first-time users
    if (!profile) {
      profile = await storage.createTouristProfile({
        touristId,
        fullName,
        accommodation: "", // Will be updated in profile completion
        profileCompleted: false,
      });
    } else if (profile.fullName.toLowerCase() !== fullName.toLowerCase()) {
      // Verify the name matches for existing profiles
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    res.json({ profile });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ error: "Invalid request data" });
  }
});

router.post("/api/register", async (req, res) => {
  try {
    const userData = insertUserSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }
    
    const user = await storage.createUser(userData);
    res.status(201).json({ user: { id: user.id, username: user.username } });
  } catch (error) {
    res.status(400).json({ error: "Invalid request data" });
  }
});

// Tourist Profile routes
router.get("/api/profile/:touristId", async (req, res) => {
  try {
    const { touristId } = req.params;
    const profile = await storage.getTouristProfile(touristId);
    
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/api/profile", async (req, res) => {
  try {
    const profileData = insertTouristProfileSchema.parse(req.body);
    const profile = await storage.createTouristProfile(profileData);
    res.status(201).json(profile);
  } catch (error) {
    res.status(400).json({ error: "Invalid request data" });
  }
});

// Support both PUT and POST for profile updates (demo flexibility)
router.put("/api/profile/:touristId", async (req, res) => {
  try {
    const { touristId } = req.params;
    let existingProfile = await storage.getTouristProfile(touristId);
    
    if (!existingProfile) {
      // For demo: create profile if it doesn't exist
      existingProfile = await storage.createTouristProfile({
        touristId,
        fullName: req.body.fullName || "Demo User",
        accommodation: req.body.accommodation || "",
        profileCompleted: false,
      });
    }
    
    const updatedProfile = await storage.updateTouristProfile(existingProfile.id, {
      ...req.body,
      profileCompleted: true, // Auto-complete for demo
    });
    res.json(updatedProfile);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(400).json({ error: "Invalid request data" });
  }
});

// Also support POST for profile updates (frontend compatibility)
router.post("/api/profile/:touristId", async (req, res) => {
  try {
    const { touristId } = req.params;
    let existingProfile = await storage.getTouristProfile(touristId);
    
    if (!existingProfile) {
      // For demo: create profile if it doesn't exist
      existingProfile = await storage.createTouristProfile({
        touristId,
        fullName: req.body.fullName || "Demo User",
        accommodation: req.body.accommodation || "",
        profileCompleted: false,
      });
    }
    
    const updatedProfile = await storage.updateTouristProfile(existingProfile.id, {
      ...req.body,
      profileCompleted: true, // Auto-complete for demo
    });
    res.json(updatedProfile);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(400).json({ error: "Invalid request data" });
  }
});

// Digital ID routes
router.get("/api/digital-id/:touristId", async (req, res) => {
  try {
    const { touristId } = req.params;
    let digitalId = await storage.getDigitalId(touristId);
    const profile = await storage.getTouristProfile(touristId);
    
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    
    // Auto-create digital ID if it doesn't exist but profile is completed (demo flow)
    if (!digitalId && profile.profileCompleted) {
      const issueDate = new Date().toISOString().split('T')[0];
      const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const blockchainHash = `0x${Math.random().toString(16).substring(2)}`.padEnd(66, '0');
      
      digitalId = await storage.createDigitalId({
        touristProfileId: profile.id,
        touristId,
        issueDate,
        validUntil,
        blockchainHash,
        triggers: [
          { type: "Profile Completion", source: "Safe Trail Platform", date: issueDate },
          { type: "Identity Verification", source: "North East Tourism Board", date: issueDate },
        ],
      });
    }
    
    if (!digitalId) {
      return res.status(404).json({ error: "Digital ID not found. Please complete your profile first." });
    }
    
    // Return digital ID with profile data (as expected by frontend)
    res.json({
      ...digitalId,
      profile: {
        fullName: profile.fullName,
        nationality: profile.nationality || "Indian",
        travelerType: profile.travelerType || "Domestic",
      }
    });
  } catch (error) {
    console.error("Digital ID error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/api/digital-id", async (req, res) => {
  try {
    const digitalIdData = insertDigitalIdSchema.parse(req.body);
    const digitalId = await storage.createDigitalId(digitalIdData);
    res.status(201).json(digitalId);
  } catch (error) {
    res.status(400).json({ error: "Invalid request data" });
  }
});

export default router;