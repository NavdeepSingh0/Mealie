import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Home, Search, Calendar, Bot, TrendingUp, ShoppingCart, X } from "lucide-react";

interface FeatureTourProps {
  open: boolean;
  onComplete: () => void;
}

const tourSteps = [
  {
    icon: Home,
    title: "Today: your daily progress",
    description: "This is your home screen where you'll see daily progress toward your goals. Track calories, protein, and all your nutrition metrics at a glance."
  },
  {
    icon: Search,
    title: "Discover: find a dish",
    description: "Click here to log meals and track your nutrition intake. Search our database or add custom meals to stay on track."
  },
  {
    icon: Calendar,
    title: "Plan: organise your week",
    description: "Plan your weekly meals here to stay organized. Schedule meals in advance and never wonder what's for dinner."
  },
  {
    icon: Bot,
    title: "Assistant: ask anything",
    description: "Get personalized nutrition advice here anytime. Ask questions, get recipe suggestions, and receive tailored recommendations."
  },
  {
    icon: TrendingUp,
    title: "Trends: see how you are doing",
    description: "Track your progress and see trends over time. Visualize your nutrition journey with detailed charts and insights."
  },
  {
    icon: ShoppingCart,
    title: "Grocery: shop from your plan",
    description: "Know exactly what groceries you have to buy and what you have. Create shopping lists based on your meal plans."
  }
];

export const FeatureTour = ({ open, onComplete }: FeatureTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
    }
  }, [open]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('mealie_tour_completed', 'true');
    onComplete();
  };

  const currentTourStep = tourSteps[currentStep];
  const Icon = currentTourStep.icon;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={handleSkip}
          aria-label="Skip tour"
        >
          <X className="h-4 w-4" />
        </Button>

        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-3xl bg-primary/10 p-5 text-primary">
              <Icon className="h-10 w-10" strokeWidth={1.6} />
            </div>
          </div>
          <DialogTitle className="text-center font-display text-3xl">
            {currentTourStep.title}
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {currentTourStep.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="flex justify-center gap-2">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep 
                    ? 'w-8 bg-primary' 
                    : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={handleSkip}>
              Skip Tour
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} of {tourSteps.length}
              </span>
              <Button onClick={handleNext}>
                {currentStep === tourSteps.length - 1 ? "Get Started" : "Next"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};