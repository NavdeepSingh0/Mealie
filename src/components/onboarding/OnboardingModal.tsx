import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingDown, Activity } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onComplete: (data: OnboardingData) => void;
}

interface OnboardingData {
  weight_goal: 'lose' | 'maintain' | 'gain';
  current_weight: number;
  target_weight: number;
  weekly_goal: 'mild' | 'moderate' | 'aggressive';
  primary_nutrition_goal: 'weight_loss' | 'muscle_building' | 'maintenance' | 'general_health';
}

export const OnboardingModal = ({ open, onComplete }: OnboardingModalProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    weight_goal: 'maintain',
    weekly_goal: 'moderate',
    primary_nutrition_goal: 'maintenance'
  });

  const totalSteps = 2;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    if (formData.weight_goal && formData.current_weight && formData.target_weight && 
        formData.weekly_goal && formData.primary_nutrition_goal) {
      onComplete(formData as OnboardingData);
    }
  };

  const isStepValid = () => {
    if (step === 1) {
      return formData.weight_goal && formData.current_weight && formData.target_weight && formData.weekly_goal;
    }
    return formData.primary_nutrition_goal;
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[600px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Welcome to Mealie! Let's Set Up Your Goals
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Progress value={progress} className="h-2" />

          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-4">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  What's your weight goal?
                </Label>
                <RadioGroup
                  value={formData.weight_goal}
                  onValueChange={(value) => setFormData({ ...formData, weight_goal: value as any })}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:border-primary cursor-pointer">
                    <RadioGroupItem value="lose" id="lose" />
                    <Label htmlFor="lose" className="cursor-pointer">Lose Weight</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:border-primary cursor-pointer">
                    <RadioGroupItem value="maintain" id="maintain" />
                    <Label htmlFor="maintain" className="cursor-pointer">Maintain Weight</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:border-primary cursor-pointer">
                    <RadioGroupItem value="gain" id="gain" />
                    <Label htmlFor="gain" className="cursor-pointer">Gain Muscle</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current_weight">Current Weight (kg)</Label>
                  <Input
                    id="current_weight"
                    type="number"
                    step="0.1"
                    placeholder="70.0"
                    value={formData.current_weight || ''}
                    onChange={(e) => setFormData({ ...formData, current_weight: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_weight">Target Weight (kg)</Label>
                  <Input
                    id="target_weight"
                    type="number"
                    step="0.1"
                    placeholder="65.0"
                    value={formData.target_weight || ''}
                    onChange={(e) => setFormData({ ...formData, target_weight: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">Weekly Goal</Label>
                <RadioGroup
                  value={formData.weekly_goal}
                  onValueChange={(value) => setFormData({ ...formData, weekly_goal: value as any })}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:border-primary cursor-pointer">
                    <RadioGroupItem value="mild" id="mild" />
                    <Label htmlFor="mild" className="cursor-pointer flex-1">
                      <div className="font-medium">Mild (0.25kg/week)</div>
                      <div className="text-sm text-muted-foreground">Gentle and sustainable</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:border-primary cursor-pointer">
                    <RadioGroupItem value="moderate" id="moderate" />
                    <Label htmlFor="moderate" className="cursor-pointer flex-1">
                      <div className="font-medium">Moderate (0.5kg/week)</div>
                      <div className="text-sm text-muted-foreground">Balanced approach</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3 hover:border-primary cursor-pointer">
                    <RadioGroupItem value="aggressive" id="aggressive" />
                    <Label htmlFor="aggressive" className="cursor-pointer flex-1">
                      <div className="font-medium">Aggressive (1kg/week)</div>
                      <div className="text-sm text-muted-foreground">Faster results</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-4">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  What's your primary nutrition focus?
                </Label>
                <RadioGroup
                  value={formData.primary_nutrition_goal}
                  onValueChange={(value) => setFormData({ ...formData, primary_nutrition_goal: value as any })}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:border-primary cursor-pointer">
                    <RadioGroupItem value="weight_loss" id="weight_loss" />
                    <Label htmlFor="weight_loss" className="cursor-pointer flex-1">
                      <div className="font-medium">Weight Loss</div>
                      <div className="text-sm text-muted-foreground">Focus on calorie deficit and fat loss</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:border-primary cursor-pointer">
                    <RadioGroupItem value="muscle_building" id="muscle_building" />
                    <Label htmlFor="muscle_building" className="cursor-pointer flex-1">
                      <div className="font-medium">Muscle Building</div>
                      <div className="text-sm text-muted-foreground">Optimize protein and strength gains</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:border-primary cursor-pointer">
                    <RadioGroupItem value="maintenance" id="maintenance" />
                    <Label htmlFor="maintenance" className="cursor-pointer flex-1">
                      <div className="font-medium">Maintenance</div>
                      <div className="text-sm text-muted-foreground">Stay at current weight and health level</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:border-primary cursor-pointer">
                    <RadioGroupItem value="general_health" id="general_health" />
                    <Label htmlFor="general_health" className="cursor-pointer flex-1">
                      <div className="font-medium">General Health</div>
                      <div className="text-sm text-muted-foreground">Overall wellness and balanced nutrition</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </Button>
            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!isStepValid()}
                className="bg-primary hover:bg-primary/90"
              >
                Start My Journey
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};