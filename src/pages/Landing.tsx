import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { UtensilsCrossed, Calendar, Bot, TrendingUp, ChefHat, Apple, Salad } from "lucide-react";
import mealielogo from "@/assets/mealie-logo.png";
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
        <div className="absolute inset-0 bg-[var(--gradient-hero)] opacity-10" />
        
        {/* Floating Food Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <ChefHat className="absolute top-20 left-10 w-16 h-16 text-primary/20 animate-float" style={{ animationDelay: '0s' }} />
          <Apple className="absolute top-40 right-20 w-12 h-12 text-secondary/20 animate-float" style={{ animationDelay: '2s' }} />
          <Salad className="absolute bottom-40 left-20 w-14 h-14 text-primary/20 animate-float" style={{ animationDelay: '1s' }} />
          <UtensilsCrossed className="absolute bottom-32 right-32 w-10 h-10 text-secondary/20 animate-float" style={{ animationDelay: '3s' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-block animate-fade-in">
            <img src={mealielogo} alt="Mealie Logo" className="w-24 h-24 mx-auto mb-6" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold animate-fade-in gradient-text" style={{ animationDelay: '0.1s' }}>
            Mealie
          </h1>
          
          <p className="text-3xl md:text-4xl font-semibold text-foreground animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Nutrition Simplified
          </p>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Your smart nutrition companion for healthy living
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                Get Started
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 shadow-md hover:shadow-lg transition-all hover:scale-105"
              onClick={scrollToFeatures}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Powerful features to help you achieve your nutrition goals
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-all hover:scale-105 animate-fade-in border-2"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Get started in three simple steps
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="text-center space-y-4 animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-6xl font-bold gradient-text mb-4">
                  {step.number}
                </div>
                <h3 className="text-2xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground text-lg">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 bg-[var(--gradient-hero)] overflow-hidden">
        {/* Floating Food Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <Apple className="absolute top-10 left-10 w-20 h-20 text-white animate-float" style={{ animationDelay: '0s' }} />
          <UtensilsCrossed className="absolute top-20 right-16 w-16 h-16 text-white animate-float" style={{ animationDelay: '1.5s' }} />
          <Salad className="absolute bottom-20 left-1/4 w-18 h-18 text-white animate-float" style={{ animationDelay: '0.5s' }} />
          <ChefHat className="absolute bottom-16 right-20 w-14 h-14 text-white animate-float" style={{ animationDelay: '2s' }} />
          <Calendar className="absolute top-1/2 left-12 w-12 h-12 text-white animate-float" style={{ animationDelay: '1s' }} />
          <TrendingUp className="absolute top-1/3 right-24 w-14 h-14 text-white animate-float" style={{ animationDelay: '2.5s' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-10">
          <h2 className="text-4xl md:text-6xl font-bold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            Ready to Transform Your Nutrition?
          </h2>
          <p className="text-xl md:text-2xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] font-medium">
            Join thousands of users achieving their health goals with Mealie
          </p>
          <div className="pt-4">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 shadow-xl hover:scale-105 transition-all">
                Start Your Journey
              </Button>
            </Link>
          </div>
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
