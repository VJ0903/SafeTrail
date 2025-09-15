import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const Login = () => {
  const [, navigate] = useLocation();
  const [touristId, setTouristId] = useState("");
  const [fullName, setFullName] = useState("");

  const loginMutation = useMutation({
    mutationFn: async ({ touristId, fullName }: { touristId: string; fullName: string }) => {
      const response = await apiRequest("POST", "/api/login", { touristId, fullName });
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("currentUser", JSON.stringify(data.profile));
      
      if (data.profile.profileCompleted) {
        navigate("/digital-id");
      } else {
        navigate("/profile");
      }
      
      toast({
        title: "✅ Login successful!",
        description: "Welcome to Safe Trail.",
      });
    },
    onError: () => {
      toast({
        title: "❌ Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!touristId || !fullName) {
      toast({
        title: "❌ Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Simplified validation for demo - just check if fields are filled
    // Demo: Accept any Tourist ID format for easier testing

    loginMutation.mutate({ touristId, fullName });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-800 flex items-center justify-center p-4">
      {/* Beautiful mountain landscape background for North East India */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20" 
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')" 
        }}
      />
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Shield className="text-2xl text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Safe Trail</CardTitle>
          <CardDescription>
            Smart Tourist Safety Platform
            <br />
            <span className="text-sm">North Eastern States Tourism</span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="touristId" className="flex items-center gap-2">
                Digital Tourist ID
              </Label>
              <Input 
                id="touristId"
                data-testid="input-touristid"
                type="text" 
                placeholder="TID-2024-NE-123456789"
                value={touristId}
                onChange={(e) => setTouristId(e.target.value)}
                className="mt-2"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the Digital Tourist ID received via email
              </p>
            </div>

            <div>
              <Label htmlFor="fullName" className="flex items-center gap-2">
                Full Name
              </Label>
              <Input 
                id="fullName"
                data-testid="input-fullname"
                type="text" 
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-2"
                required
              />
            </div>

            <Button 
              type="submit"
              data-testid="button-login"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Logging in..." : "Login to Safe Trail"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Powered by Blockchain Technology<br />
              🔒 Secure • 🌐 Verified • 🛡️ Protected
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
