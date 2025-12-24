export type Tier = {
  name: string;
  id: string;
  href: string;
  priceMonthly: string;
  priceYearly: string;
  description: string;
  features: string[];
  featured: boolean;
  cta: string;
  onClick: () => void;
};

export const tiers: Tier[] = [
  {
    name: "Free",
    id: "tier-free",
    href: "#",
    priceMonthly: "$0",
    priceYearly: "$0",
    description: "Perfect for individuals trying out the platform and exploring user insights.",
    features: [
      "3 searches per day",
      "Reddit & X platform support",
      "10 pain points per search",
      "Basic keyword analysis",
      "Email support within 48 hours",
    ],
    featured: false,
    cta: "Get Started",
    onClick: () => {},
  },
  {
    name: "Professional",
    id: "tier-professional",
    href: "#",
    priceMonthly: "$10/mo",
    priceYearly: "$96/yr",
    description: "Ideal for entrepreneurs, marketers, and researchers who need deep insights and unlimited access.",
    features: [
      "Unlimited searches per day",
      "All platforms support",
      "20 pain points per search",
      "AI-powered deep analysis",
      "Direct links to original posts",
      "Export data (CSV/JSON)",
      "Priority email support",
      "Search history saved",
    ],
    featured: true,
    cta: "Subscribe Now",
    onClick: () => {},
  },
];
