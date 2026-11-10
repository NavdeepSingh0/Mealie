import {
  Beef, Cake, Carrot, ChefHat, Cookie, CookingPot, Drumstick, Egg, Fish, IceCreamCone,
  Leaf, Milk, Salad, Sandwich, Soup, Wheat, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Dishes in the database have no photos, so each one gets a tile built from
 * its name: a food icon (chosen by keyword) on a tint (chosen by a stable hash).
 */
const ICONS: Array<[RegExp, LucideIcon]> = [
  [/paneer|curd|raita|lassi|milk|dahi|kheer|chaas|buttermilk/i, Milk],
  [/egg|anda|omelette/i, Egg],
  [/chicken|tandoori|tikka|kebab|kabab|afghani|murgh/i, Drumstick],
  [/mutton|lamb|keema|beef|gosht|rogan/i, Beef],
  [/fish|prawn|shrimp|crab|machhi|meen/i, Fish],
  [/dal|daal|sambar|rasam|soup|khichdi|khichri|kadhi|shorba|curry/i, Soup],
  [/roti|naan|paratha|chapati|bread|puri|kulcha|thepla|dosa|idli|uttapam|chilla/i, Wheat],
  [/rice|chawal|rajma|chole|biryani|pulao|pulav|poha|upma/i, CookingPot],
  [/salad|sprout|chaat|bhel/i, Salad],
  [/sabzi|aloo|gobi|palak|bhindi|baingan|mix veg|saag|veg|matar|methi/i, Carrot],
  [/sandwich|burger|roll|wrap|pav|vada pav|samosa/i, Sandwich],
  [/halwa|gulab|jalebi|laddu|ladoo|barfi|burfi|rasgulla|cake|sweet|sheera/i, Cake],
  [/ice cream|kulfi|falooda/i, IceCreamCone],
  [/biscuit|cookie|namkeen|mathri|chikki/i, Cookie],
  [/tea|chai|coffee|juice|smoothie/i, Leaf],
];

const TINTS = [
  "bg-[hsl(12_70%_92%)] text-[hsl(12_62%_36%)] dark:bg-[hsl(12_30%_20%)] dark:text-[hsl(12_72%_72%)]",
  "bg-[hsl(38_90%_89%)] text-[hsl(32_80%_28%)] dark:bg-[hsl(38_40%_19%)] dark:text-[hsl(38_90%_66%)]",
  "bg-[hsl(98_30%_89%)] text-[hsl(98_30%_26%)] dark:bg-[hsl(98_18%_19%)] dark:text-[hsl(98_32%_66%)]",
  "bg-[hsl(340_40%_92%)] text-[hsl(340_42%_34%)] dark:bg-[hsl(340_20%_20%)] dark:text-[hsl(340_52%_74%)]",
  "bg-[hsl(24_40%_89%)] text-[hsl(24_40%_26%)] dark:bg-[hsl(24_20%_19%)] dark:text-[hsl(24_40%_70%)]",
];

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

const iconForDish = (name: string): LucideIcon =>
  ICONS.find(([re]) => re.test(name))?.[1] ?? ChefHat;

interface MealThumbProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const MealThumb = ({ name, size = "md", className }: MealThumbProps) => {
  const Icon = iconForDish(name);
  const tint = TINTS[hash(name || "x") % TINTS.length];
  const box = { sm: "h-11 w-11 rounded-xl", md: "h-14 w-14 rounded-2xl", lg: "h-24 w-full rounded-t-2xl rounded-b-none" }[size];
  const icon = { sm: "h-5 w-5", md: "h-6 w-6", lg: "h-10 w-10" }[size];
  return (
    <div
      aria-hidden="true"
      className={cn("flex shrink-0 items-center justify-center", box, tint, className)}
    >
      <Icon className={icon} strokeWidth={1.6} />
    </div>
  );
};
