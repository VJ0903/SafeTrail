import { type User, type InsertUser, type TouristProfile, type InsertTouristProfile, type DigitalId, type InsertDigitalId } from "../shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getTouristProfile(touristId: string): Promise<TouristProfile | undefined>;
  getTouristProfileById(id: string): Promise<TouristProfile | undefined>;
  createTouristProfile(profile: InsertTouristProfile): Promise<TouristProfile>;
  updateTouristProfile(id: string, profile: Partial<TouristProfile>): Promise<TouristProfile | undefined>;
  
  getDigitalId(touristId: string): Promise<DigitalId | undefined>;
  createDigitalId(digitalId: InsertDigitalId): Promise<DigitalId>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private touristProfiles: Map<string, TouristProfile>;
  private digitalIds: Map<string, DigitalId>;

  constructor() {
    this.users = new Map();
    this.touristProfiles = new Map();
    this.digitalIds = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTouristProfile(touristId: string): Promise<TouristProfile | undefined> {
    return Array.from(this.touristProfiles.values()).find(
      (profile) => profile.touristId === touristId,
    );
  }

  async getTouristProfileById(id: string): Promise<TouristProfile | undefined> {
    return this.touristProfiles.get(id);
  }

  async createTouristProfile(insertProfile: InsertTouristProfile): Promise<TouristProfile> {
    const id = randomUUID();
    const profile: TouristProfile = {
      ...insertProfile,
      id,
      nationality: insertProfile.nationality ?? "Indian",
      travelerType: insertProfile.travelerType ?? "domestic",
      emergencyContact1: insertProfile.emergencyContact1 ?? null,
      emergencyContact2: insertProfile.emergencyContact2 ?? null,
      accommodation: insertProfile.accommodation ?? null,
      itinerary: insertProfile.itinerary ?? null,
      medicalConditions: insertProfile.medicalConditions ?? null,
      languages: insertProfile.languages ?? null,
      travelBudget: insertProfile.travelBudget ?? null,
      profileCompleted: insertProfile.profileCompleted ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.touristProfiles.set(id, profile);
    return profile;
  }

  async updateTouristProfile(id: string, updates: Partial<TouristProfile>): Promise<TouristProfile | undefined> {
    const existing = this.touristProfiles.get(id);
    if (!existing) return undefined;
    
    const updated: TouristProfile = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.touristProfiles.set(id, updated);
    return updated;
  }

  async getDigitalId(touristId: string): Promise<DigitalId | undefined> {
    return Array.from(this.digitalIds.values()).find(
      (digitalId) => digitalId.touristId === touristId,
    );
  }

  async createDigitalId(insertDigitalId: InsertDigitalId): Promise<DigitalId> {
    const id = randomUUID();
    const digitalId: DigitalId = {
      ...insertDigitalId,
      id,
      status: insertDigitalId.status ?? "Active",
      verificationLevel: insertDigitalId.verificationLevel ?? "Verified",
      triggers: (insertDigitalId.triggers as Array<{type: string; source: string; date: string}>) ?? [],
      createdAt: new Date(),
    };
    this.digitalIds.set(id, digitalId);
    return digitalId;
  }
}

export const storage = new MemStorage();