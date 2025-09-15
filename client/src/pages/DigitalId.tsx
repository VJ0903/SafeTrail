import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { PanicButton } from "@/components/PanicButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Shield,
  Clock,
  Download,
  Share,
  Smartphone,
  Check,
  MapPin,
  Plane,
  Hotel,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import hotToast from "react-hot-toast"; // NEW: Import react-hot-toast for additional notifications
import type { DigitalId } from "@shared/schema";

interface User {
  id: string;
  touristId: string;
  fullName: string;
  profileCompleted: boolean;
}

interface DigitalIdWithProfile extends DigitalId {
  profile: {
    fullName: string;
    nationality: string;
    travelerType: string;
  };
}

const DigitalId = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const { data: digitalIdData, isLoading } = useQuery<DigitalIdWithProfile>({
    queryKey: ["/api/digital-id", user?.touristId],
    enabled: !!user?.touristId,
  });

  const handleDownloadId = () => {
    toast({
      title: "📱 ID Downloaded",
      description: "Your Digital Tourist ID has been saved to your device.",
    });
    // NEW: Additional notification
    hotToast.success("📱 Digital Tourist ID downloaded successfully!");
  };

  const handleShareId = () => {
    toast({
      title: "🔗 ID Shared",
      description: "Digital Tourist ID link has been copied to clipboard.",
    });
    // NEW: Additional notification
    hotToast.success("🔗 Digital Tourist ID link copied to clipboard!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-500 text-white";
      case "Expired": return "bg-destructive text-destructive-foreground";
      case "Pending": return "bg-orange-500 text-white";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  // Demo: Create a demo user if none exists
  if (!user && !isLoading) {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      const demoUser = {
        id: "demo-user-123",
        touristId: "TID-2024-NE-123456789",
        fullName: "Demo User",
        profileCompleted: true
      };
      setUser(demoUser);
      localStorage.setItem("currentUser", JSON.stringify(demoUser));
      return <div className="min-h-screen bg-background flex items-center justify-center">Setting up demo...</div>;
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!digitalIdData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation user={user} showBackButton />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Digital Tourist ID Not Found</h1>
          <p className="text-muted-foreground">Please complete your profile first to generate your Digital Tourist ID.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} showBackButton />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-4 rounded-full mr-4">
              <CreditCard className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Digital Tourist ID</h1>
              <p className="text-muted-foreground">Blockchain-based travel identification for North East India</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main ID Card */}
          <div className="lg:col-span-2">
            <Card className="mb-6 bg-gradient-to-br from-primary to-blue-800 text-primary-foreground relative overflow-hidden">
              {/* Scenic background of Tawang Monastery */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20" 
                style={{ 
                  backgroundImage: "url('https://images.unsplash.com/photo-1558005530-a321724613c8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')" 
                }}
              />
              
              <CardContent className="p-8 relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">🇮🇳 Digital Tourist ID</h2>
                    <p className="text-primary-foreground/80">North Eastern States Tourism Board</p>
                  </div>
                  <Badge className={getStatusColor(digitalIdData?.status || "Unknown")}>
                    {digitalIdData?.status || "Unknown"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-primary-foreground/70 text-sm">Full Name</p>
                      <p className="font-semibold text-lg">{digitalIdData?.profile?.fullName || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-primary-foreground/70 text-sm">Tourist ID</p>
                      <p className="font-mono text-sm">{digitalIdData?.touristId || "N/A"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-primary-foreground/70 text-sm">Nationality</p>
                        <p className="font-medium">{digitalIdData?.profile?.nationality || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-primary-foreground/70 text-sm">Type</p>
                        <p className="font-medium">{digitalIdData?.profile?.travelerType || "N/A"}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-primary-foreground/70 text-sm">Issued</p>
                        <p className="font-medium">{digitalIdData?.issueDate || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-primary-foreground/70 text-sm">Valid Until</p>
                        <p className="font-medium">{digitalIdData?.validUntil || "N/A"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-primary-foreground/70 text-sm">Visiting States</p>
                      <p className="font-medium">Assam, Meghalaya, Arunachal Pradesh</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-white p-4 rounded-lg mb-4">
                      <div className="w-24 h-24 bg-gray-900 rounded flex items-center justify-center">
                        <div className="text-white text-xs">QR CODE</div>
                      </div>
                    </div>
                    <p className="text-primary-foreground/80 text-xs text-center">
                      Scan to verify authenticity
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-primary-foreground/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm">Blockchain Verified</span>
                    </div>
                    <div className="text-xs font-mono">
                      Hash: {digitalIdData?.blockchainHash?.substring(0, 16) || "N/A"}...
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ID Generation History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  ID Generation History
                </CardTitle>
                <CardDescription>
                  How your Digital Tourist ID was automatically created
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(digitalIdData?.triggers || []).map((trigger, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border border-border rounded-lg">
                      <div className="bg-primary text-primary-foreground p-2 rounded-full">
                        {trigger.type.includes("Flight") || trigger.type.includes("Identity") ? (
                          <Plane className="h-4 w-4" />
                        ) : trigger.type.includes("Hotel") ? (
                          <Hotel className="h-4 w-4" />
                        ) : (
                          <Shield className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{trigger.type}</h4>
                        <p className="text-muted-foreground">{trigger.source}</p>
                        <p className="text-sm text-muted-foreground">{trigger.date}</p>
                      </div>
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleDownloadId} 
                  data-testid="button-download-id"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download ID
                </Button>
                <Button 
                  onClick={handleShareId} 
                  data-testid="button-share-id"
                  variant="outline" 
                  className="w-full"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share ID
                </Button>
                <Button variant="outline" className="w-full">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Add to Wallet
                </Button>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Identity Verified</span>
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Blockchain Recorded</span>
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Government Approved</span>
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Emergency Contacts</span>
                  <Check className="h-4 w-4 text-green-600" />
                </div>
              </CardContent>
            </Card>

            {/* Travel Destinations */}
            <Card>
              <CardHeader>
                <CardTitle>Approved Destinations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span>Kaziranga National Park</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span>Tawang Monastery</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span>Cherrapunji Waterfalls</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span>Majuli Island</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Information */}
            <Card className="bg-destructive/5 border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Emergency Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Tourist Helpline:</strong> 1363</p>
                <p><strong>Police:</strong> 100</p>
                <p><strong>Medical:</strong> 108</p>
                <p><strong>North East Emergency:</strong> +91-361-2123456</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <PanicButton />
    </div>
  );
};

export default DigitalId;
