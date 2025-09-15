import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { touristId } = req.query;

  if (typeof touristId !== 'string') {
    return res.status(400).json({ message: 'Invalid tourist ID' });
  }

  try {
    const digitalId = await storage.getDigitalId(touristId);
    const profile = await storage.getTouristProfile(touristId);
    
    if (!digitalId || !profile) {
      return res.status(404).json({ message: "Digital ID not found" });
    }

    res.json({
      ...digitalId,
      profile: {
        fullName: profile.fullName,
        nationality: profile.nationality,
        travelerType: profile.travelerType,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get digital ID" });
  }
}