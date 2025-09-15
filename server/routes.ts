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

// User routes
router.post("/api/login", async (req, res) => {
  try {
    const { username, password } = insertUserSchema.parse(req.body);
    
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // In a real app, you'd use proper password hashing and session management
    res.json({ user: { id: user.id, username: user.username } });
  } catch (error) {
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

router.put("/api/profile/:touristId", async (req, res) => {
  try {
    const { touristId } = req.params;
    const existingProfile = await storage.getTouristProfile(touristId);
    
    if (!existingProfile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    
    const updatedProfile = await storage.updateTouristProfile(existingProfile.id, req.body);
    res.json(updatedProfile);
  } catch (error) {
    res.status(400).json({ error: "Invalid request data" });
  }
});

// Digital ID routes
router.get("/api/digital-id/:touristId", async (req, res) => {
  try {
    const { touristId } = req.params;
    const digitalId = await storage.getDigitalId(touristId);
    
    if (!digitalId) {
      return res.status(404).json({ error: "Digital ID not found" });
    }
    
    res.json(digitalId);
  } catch (error) {
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