import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { UtensilsCrossed, Calendar, Bot, TrendingUp, ChefHat, Apple, Salad } from "lucide-react";
import mealielogo from "@/assets/mealie-logo.png";
import dashboardPreview from "@/assets/dashboard-preview.png";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const Landing = () => {
  const features = [
    {
      icon: <UtensilsCrossed className="w-8 h-8" />,
      title: "Track Meals & Nutrition",
      description: "Log your meals and monitor nutritional intake effortlessly"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Plan Weekly Meals",
      description: "Organize your week with smart meal planning tools"
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: "AI Nutrition Assistant",
      description: "Get personalized nutrition advice powered by AI"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Progress Analytics",
      description: "Track your health journey with detailed insights"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Sign up in seconds",
      description: "Create your account quickly with email or Google"
    },
    {
      number: "02",
      title: "Track your meals",
      description: "Log meals, discover recipes, and plan your week"
    },
    {
      number: "03",
      title: "Achieve your goals",
      description: "Monitor progress and reach your nutrition targets"
    }
  ];

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const { user, loading } = useAuth(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
        <div className="absolute inset-0 hero-gradient opacity-5" />
        
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center space-y-10">
          <div className="inline-block animate-fade-in">
            <img src={mealielogo} alt="Mealie Logo" className="w-28 h-28 mx-auto mb-8 drop-shadow-2xl" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold animate-fade-in gradient-text leading-tight" style={{ animationDelay: '0.1s' }}>
            Mealie
          </h1>
          
          <p className="text-3xl md:text-5xl font-bold text-foreground animate-fade-in leading-tight" style={{ animationDelay: '0.2s' }}>
            Nutrition Made Simple
          </p>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-fade-in leading-relaxed" style={{ animationDelay: '0.3s' }}>
            Track meals, plan your week, and achieve your health goals with AI-powered insights
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link to="/auth">
              <Button size="lg" variant="hero" className="text-lg px-10 py-7 font-semibold">
                Get Started Free →
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-10 py-7 font-semibold border-2 hover:scale-105 transition-all"
              onClick={scrollToFeatures}
            >
              See How It Works
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-12 opacity-70 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Track Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Smart Planning</span>
            </div>
          </div>

          {/* App Preview */}
          <div className="mt-20 relative animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none h-32 bottom-0"></div>
            <img 
              src={dashboardPreview} 
              alt="Mealie Dashboard Preview" 
              className="rounded-2xl shadow-2xl border-2 border-border/50 w-full max-w-5xl mx-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6">
              Everything You Need
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Powerful features to help you achieve your nutrition goals with ease
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="glass-card hover:shadow-2xl transition-all hover:scale-105 hover:-translate-y-2 animate-fade-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8 text-center space-y-5">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6">
              How It Works
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Get started in three simple steps and transform your nutrition journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-primary opacity-20" />
            
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="relative text-center space-y-6 animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="relative inline-block">
                  <div className="text-8xl font-extrabold gradient-text mb-6">
                    {step.number}
                  </div>
                  <div className="absolute -top-4 -right-4 w-4 h-4 bg-primary rounded-full animate-pulse" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-12">
          <h2 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-2xl leading-tight">
            Ready to Transform Your Nutrition?
          </h2>
          <p className="text-2xl md:text-3xl text-white/95 drop-shadow-lg font-semibold max-w-3xl mx-auto leading-relaxed">
            Join thousands of users achieving their health goals with Mealie
          </p>
          <div className="pt-6">
            <Link to="/auth">
              <Button size="lg" variant="hero" className="text-xl px-12 py-8 font-bold">
                Start Your Journey Free →
              </Button>
            </Link>
          </div>
          <p className="text-white/80 text-sm">No credit card required • Free forever</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-muted/50 text-center text-muted-foreground">
        <p>&copy; 2024 Mealie. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;