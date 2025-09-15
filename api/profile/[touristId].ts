import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../lib/storage';
import { insertTouristProfileSchema } from '../../shared/schema';
import { randomBytes } from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { touristId } = req.query;

  if (typeof touristId !== 'string') {
    return res.status(400).json({ message: 'Invalid tourist ID' });
  }

  if (req.method === 'GET') {
    try {
      const profile = await storage.getTouristProfile(touristId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to get profile" });
    }
  } else if (req.method === 'POST') {
    try {
      const updateData = insertTouristProfileSchema.parse(req.body);
      
      // NEW: Validate mandatory accommodation field
      if (!updateData.accommodation || updateData.accommodation.trim().length === 0) {
        return res.status(400).json({ 
          message: "Place of Stay (accommodation) is mandatory for safety purposes" 
        });
      }
      
      const existingProfile = await storage.getTouristProfile(touristId);
      if (!existingProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const updatedProfile = await storage.updateTouristProfile(existingProfile.id, {
        ...updateData,
        profileCompleted: true,
      });

      if (!updatedProfile) {
        return res.status(404).json({ message: "Failed to update profile" });
      }

      // Generate digital ID if profile is completed
      if (updatedProfile.profileCompleted) {
        const existingDigitalId = await storage.getDigitalId(touristId);
        
        if (!existingDigitalId) {
          const issueDate = new Date().toISOString().split('T')[0];
          const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          const blockchainHash = `0x${randomBytes(32).toString('hex')}`;
          
          await storage.createDigitalId({
            touristProfileId: updatedProfile.id,
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
      }

      res.json(updatedProfile);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}