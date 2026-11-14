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
  { to: "/auth", label: "Organizer sign-in" },
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

/**
 * Illustrative stories: they describe common experiences, not verified individuals.
 * Keep the "Illustrative story" label unless a real person has given written consent.
 */
export const ILLUSTRATIVE_STORIES = [
  {
    id: "daniel",
    title: "Daniel's Story: Every Step Towards Independence Matters",
    campaignSlug: "wheelchair-for-greater-independence",
    campaignLabel: "Support the mobility appeal",
    photoAlt: "A smiling young man in a manual wheelchair on a tree-lined path in a sunny park.",
    paragraphs: [
      "Sometimes, the things many people take for granted can become the biggest challenges in someone else's life.",
      "Daniel is a young man living with a mobility disability who dreams of enjoying greater independence and participating more fully in his community.",
      "For Daniel, everyday activities such as travelling to appointments, visiting friends, and accessing public spaces can require additional planning and support. Having suitable mobility equipment could make a meaningful difference in his daily life.",
      "His story represents the experiences of many people who face barriers not because of their abilities or ambitions, but because they lack access to the resources and support they need.",
      "Through our Mobility and Independence Campaign, we hope to demonstrate how community support can help someone access suitable mobility equipment and opportunities for greater independence.",
    ],
    message: "Every person deserves the opportunity to move through life with dignity, confidence, and freedom.",
    closing: "Together, we can help make that possible.",
  },
  {
    id: "sarah",
    title: "Sarah's Story: Everyone Deserves a Safe Place to Call Home",
    campaignSlug: "safer-more-accessible-home",
    campaignLabel: "Support the accessible home appeal",
    photoAlt: "A woman in a wheelchair in a bright, open apartment with a ramp to the balcony and grab bars on the doors.",
    paragraphs: [
      "A home should be a place of comfort, safety, and independence. But for people living with disabilities, an inaccessible home can make everyday life unnecessarily difficult.",
      "Sarah is a woman living with a physical disability who dreams of having a home that better supports her everyday needs.",
      "Simple features such as accessible entryways, bathroom safety equipment, support rails, and enough space to move around comfortably can make a tremendous difference.",
      "Unfortunately, accessibility improvements can be expensive, leaving many individuals struggling to create an environment where they feel safe and independent.",
      "Our Housing Accessibility Campaign highlights the importance of helping people access the modifications and equipment they need to live more comfortably.",
      "We believe that disability should never prevent anyone from feeling secure and welcome in their own home.",
    ],
    message: "A safe and accessible home is not a luxury. It is an important part of living with dignity.",
    closing: "Together, we can help build a community where everyone belongs.",
  },
] as const;
