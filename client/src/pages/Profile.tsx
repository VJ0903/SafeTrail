import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { PanicButton } from "@/components/PanicButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, Heart, Globe, Calendar, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import hotToast from "react-hot-toast"; // NEW: Import react-hot-toast for additional notifications
import { apiRequest, queryClient } from "@/lib/queryClient";

interface User {
  id: string;
  touristId: string;
  fullName: string;
  profileCompleted: boolean;
}

interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

interface ProfileData {
  id: string;
  touristId: string;
  fullName: string;
  nationality: string;
  travelerType: string;
  emergencyContact1?: EmergencyContact;
  emergencyContact2?: EmergencyContact;
  accommodation?: string;
  itinerary?: string;
  medicalConditions?: string;
  languages?: string;
  travelBudget?: string;
  profileCompleted: boolean;
}

const Profile = () => {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Partial<ProfileData>>({
    emergencyContact1: { name: "", phone: "", relation: "" },
    emergencyContact2: { name: "", phone: "", relation: "" },
  });

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["/api/profile", user?.touristId],
    enabled: !!user?.touristId,
  });

  useEffect(() => {
    if (profileData) {
      setProfile(profileData);
    }
  }, [profileData]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<ProfileData>) => {
      if (!user?.touristId) throw new Error("No tourist ID");
      const response = await apiRequest("POST", `/api/profile/${user.touristId}`, data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Profile completed successfully!",
        description: "Generating your Digital Tourist ID...",
      });
      
      // NEW: Additional notification with react-hot-toast
      hotToast.success("🎉 Profile completed! Digital Tourist ID being generated...");
      
      // Update local storage
      const updatedUser = { ...user!, profileCompleted: true };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      
      // Auto-redirect to Digital ID page
      setTimeout(() => {
        navigate("/digital-id");
        toast({
          title: "🎉 Digital Tourist ID Generated!",
          description: "Your Digital Tourist ID is now ready to use!",
        });
      }, 1500);
    },
    onError: () => {
      toast({
        title: "❌ Failed to update profile",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Demo: Relaxed validation - just need at least one emergency contact
    if (!profile.emergencyContact1?.name || !profile.emergencyContact1?.phone) {
      toast({
        title: "❌ Missing emergency contact",
        description: "Please provide at least one emergency contact.",
        variant: "destructive",
      });
      return;
    }

    updateProfileMutation.mutate(profile);
  };

  // Demo: Create a demo user if none exists
  if (!user && !isLoading) {
    const demoUser = {
      id: "demo-user-123",
      touristId: "TID-2024-NE-123456789",
      fullName: "Demo User",
      profileCompleted: false
    };
    setUser(demoUser);
    localStorage.setItem("currentUser", JSON.stringify(demoUser));
    return <div className="min-h-screen bg-background flex items-center justify-center">Setting up demo...</div>;
  }

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  const getCompletionPercentage = () => {
    let completed = 0;
    let total = 6;
    
    if (profile.emergencyContact1?.name && profile.emergencyContact1?.phone) completed++;
    if (profile.emergencyContact2?.name && profile.emergencyContact2?.phone) completed++;
    if (profile.accommodation) completed++;
    if (profile.itinerary) completed++;
    if (profile.medicalConditions) completed++;
    if (profile.languages) completed++;
    
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} showBackButton />

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-4 rounded-full mr-4">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Tourist Profile</h1>
              <p className="text-muted-foreground">Manage your travel information and emergency contacts</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Profile Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Emergency Contacts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Emergency Contacts
                  </CardTitle>
                  <CardDescription>
                    People to contact in case of emergency (minimum 2 required)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[1, 2].map((num) => (
                    <div key={num} className="border border-border p-4 rounded-lg">
                      <h4 className="font-medium mb-3">Emergency Contact {num}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor={`contact${num}Name`}>Name *</Label>
                          <Input
                            id={`contact${num}Name`}
                            data-testid={`input-contact${num}-name`}
                            placeholder="Contact name"
                            value={(profile[`emergencyContact${num}` as keyof ProfileData] as EmergencyContact)?.name || ""}
                            onChange={(e) => setProfile(prev => ({
                              ...prev,
                              [`emergencyContact${num}`]: {
                                ...(prev[`emergencyContact${num}` as keyof ProfileData] as EmergencyContact || {}),
                                name: e.target.value
                              }
                            }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`contact${num}Phone`}>Phone Number *</Label>
                          <Input
                            id={`contact${num}Phone`}
                            data-testid={`input-contact${num}-phone`}
                            placeholder="+91 XXXXXXXXXX"
                            value={(profile[`emergencyContact${num}` as keyof ProfileData] as EmergencyContact)?.phone || ""}
                            onChange={(e) => setProfile(prev => ({
                              ...prev,
                              [`emergencyContact${num}`]: {
                                ...(prev[`emergencyContact${num}` as keyof ProfileData] as EmergencyContact || {}),
                                phone: e.target.value
                              }
                            }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`contact${num}Relation`}>Relationship</Label>
                          <Input
                            id={`contact${num}Relation`}
                            data-testid={`input-contact${num}-relation`}
                            placeholder="e.g., Father, Friend"
                            value={(profile[`emergencyContact${num}` as keyof ProfileData] as EmergencyContact)?.relation || ""}
                            onChange={(e) => setProfile(prev => ({
                              ...prev,
                              [`emergencyContact${num}`]: {
                                ...(prev[`emergencyContact${num}` as keyof ProfileData] as EmergencyContact || {}),
                                relation: e.target.value
                              }
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Travel Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Travel Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="accommodation">Accommodation Details</Label>
                    <Input
                      id="accommodation"
                      data-testid="input-accommodation"
                      placeholder="Hotel name, address in Guwahati, Shillong, etc. *REQUIRED*"
                      value={profile.accommodation || ""}
                      onChange={(e) => setProfile(prev => ({ ...prev, accommodation: e.target.value }))}
                      required
                    />
                    <p className="text-xs text-red-600 mt-1">
                      * Place of Stay is now mandatory for safety and emergency response purposes
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="itinerary">Travel Itinerary</Label>
                    <Textarea
                      id="itinerary"
                      data-testid="textarea-itinerary"
                      placeholder="Brief description of your North East travel plans..."
                      value={profile.itinerary || ""}
                      onChange={(e) => setProfile(prev => ({ ...prev, itinerary: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="medicalConditions">Medical Conditions</Label>
                    <Input
                      id="medicalConditions"
                      data-testid="input-medical"
                      placeholder="Any medical conditions or allergies"
                      value={profile.medicalConditions || ""}
                      onChange={(e) => setProfile(prev => ({ ...prev, medicalConditions: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="languages">Languages Spoken</Label>
                    <Input
                      id="languages"
                      data-testid="input-languages"
                      placeholder="e.g., English, Hindi, Assamese, Bengali"
                      value={profile.languages || ""}
                      onChange={(e) => setProfile(prev => ({ ...prev, languages: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="travelBudget">Travel Budget (₹)</Label>
                    <Input
                      id="travelBudget"
                      data-testid="input-budget"
                      placeholder="e.g., ₹50,000 for 7 days"
                      value={profile.travelBudget || ""}
                      onChange={(e) => setProfile(prev => ({ ...prev, travelBudget: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button 
                type="submit"
                data-testid="button-complete-profile"
                className="w-full"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? "Saving..." : "Complete Profile & Generate Digital ID"}
              </Button>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Profile Completion</span>
                    <Badge className="bg-green-100 text-green-800">
                      {getCompletionPercentage()}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Emergency Contacts</span>
                    <Badge variant="secondary">
                      {((profile.emergencyContact1?.name && profile.emergencyContact1?.phone) ? 1 : 0) + 
                       ((profile.emergencyContact2?.name && profile.emergencyContact2?.phone) ? 1 : 0)}/2
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Travel Type</span>
                    <Badge className="bg-primary text-primary-foreground">
                      Domestic
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Safety Tips for North East */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Safety Tips for North East
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className="w-6 h-6 rounded-full flex items-center justify-center text-xs mt-1">
                        1
                      </Badge>
                      <span className="text-sm">Carry valid Inner Line Permits for protected areas</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className="w-6 h-6 rounded-full flex items-center justify-center text-xs mt-1">
                        2
                      </Badge>
                      <span className="text-sm">Weather changes rapidly in hill stations like Shillong</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className="w-6 h-6 rounded-full flex items-center justify-center text-xs mt-1">
                        3
                      </Badge>
                      <span className="text-sm">Respect local customs and tribal traditions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Globe className="h-4 w-4 mr-2" />
                    Update Language Preferences
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Set Travel Dates
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="h-4 w-4 mr-2" />
                    Share Location with Contacts
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

      <PanicButton />
    </div>
  );
};

export default Profile;
