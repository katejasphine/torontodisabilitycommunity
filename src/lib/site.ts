export const SITE = {
  name: "Toronto Disability Community Support",
  shortName: "TDCS",
  tagline: "Together We Rise. Together We Support.",
  mission:
    "Building an inclusive Toronto where every person living with a disability has access to dignity, opportunity, independence, and community support.",
  location: "Toronto, Ontario, Canada",
  contactEmail: "katejasphine@gmail.com",
};

export const FOUNDER_STORY = {
  heading: "The Story Behind Our Founder",
  name: "Kate Jasphine",
  role: "Founder, Toronto Disability Community Support",
  paragraphs: [
    "My name is Kate Jasphine, and I believe that everyone deserves to live with dignity, independence, and a sense of belonging, regardless of their physical abilities or personal circumstances.",
    "The idea behind Toronto Disability Community Support grew from a simple belief: no one living with a disability should have to face life's challenges alone. Too many people struggle to access essential resources, mobility equipment, transportation, food, housing support, and opportunities to build a better future.",
    "I wanted to help create a community where people could come together, share resources, support one another, and make a meaningful difference.",
    "That vision inspired me to start Toronto Disability Community Support — a community-led initiative focused on connecting individuals with assistance, raising awareness, and bringing hope to people who need support.",
    "Our mission is bigger than fundraising. It is about listening, understanding, creating opportunities, and reminding people that their lives matter.",
    "I believe that when a community stands together, meaningful change becomes possible. Every donation, volunteer, shared opportunity, and act of kindness can help someone take another step toward independence.",
    "Together We Rise. Together We Support.",
  ],
};

export const MAIN_NAV = [
  { to: "/about", label: "About" },
  { to: "/campaigns", label: "Campaigns" },
  { to: "/stories", label: "Stories" },
  { to: "/impact", label: "Our Impact" },
  { to: "/transparency", label: "Transparency" },
  { to: "/contact", label: "Contact" },
] as const;

export const FOOTER_NAV = [
  { to: "/about", label: "About Our Mission" },
  { to: "/campaigns", label: "Browse Campaigns" },
  { to: "/request-assistance", label: "Request Assistance" },
  { to: "/donate", label: "Donate" },
  { to: "/stories", label: "Community Stories" },
  { to: "/impact", label: "Our Impact" },
  { to: "/transparency", label: "Financial Transparency" },
  { to: "/updates", label: "Campaign Updates" },
  { to: "/contact", label: "Contact Us" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms and Conditions" },
] as const;

/**
 * Verified community figures. These stay at zero until real, verified data exists —
 * never replace them with invented numbers.
 */
export const IMPACT_STATS = [
  { label: "Individuals supported", value: 0, format: "number" },
  { label: "Active fundraising campaigns", value: 0, format: "number" },
  { label: "Total funds distributed", value: 0, format: "currency" },
  { label: "Community supporters", value: 0, format: "number" },
] as const;

export const GENERAL_FUND = { goal: 25000, raised: 1000, supporters: 50 };
