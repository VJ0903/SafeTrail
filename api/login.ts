import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { touristId, fullName } = req.body;
    
    if (!touristId || !fullName) {
      return res.status(400).json({ message: "Tourist ID and Full Name are required" });
    }

    // Check if profile already exists
    let profile = await storage.getTouristProfile(touristId);
    
    if (!profile) {
      // Create new profile with temporary accommodation
      profile = await storage.createTouristProfile({
        touristId,
        fullName,
        nationality: "Indian",
        travelerType: "domestic",
        accommodation: "", // Temporary empty accommodation for initial profile
        profileCompleted: false,
      });
    }

    res.json({ 
      success: true, 
      profile: {
        id: profile.id,
        touristId: profile.touristId,
        fullName: profile.fullName,
        profileCompleted: profile.profileCompleted
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
}