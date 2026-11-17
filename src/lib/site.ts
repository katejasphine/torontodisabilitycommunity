export const SITE = {
  name: "Toronto Disability Community Support",
  shortName: "TDCS",
  tagline: "Together We Rise. Together We Support.",
  mission:
    "Building an inclusive Toronto where every person living with a disability has access to dignity, opportunity, independence, and community support.",
  location: "Toronto, Ontario, Canada",
  contactEmail: "katejasphine@gmail.com",
  mastodonUrl: "https://mastodon.social/@jasphinekate",
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
 * General Community Fund. Offline figures are gifts received before online giving opened, as reported
 * by the organizer; confirmed online payments are added on top from the database.
 */
export const GENERAL_FUND = { goal: 25000, offlineRaised: 1000, offlineSupporters: 50 };

/**
 * Community stories, in the storytellers' own words. The organizer has confirmed these people are verified
 * and consented to sharing. `quote` is the story's closing paragraph, shown as a highlight.
 * `campaignSlug` links to a related appeal; stories without one point to the General Community Fund.
 */
export const COMMUNITY_STORIES = [
  {
    id: "sarah",
    name: "Sarah",
    title: "Sarah's Story: All I Want Is a Place I Can Call Home",
    campaignSlug: "safer-more-accessible-home",
    campaignLabel: "Support the accessible home appeal",
    photoAlt: "A smiling woman with long braids sitting in a wheelchair in a bright living room, with a Toronto skyline print on the wall.",
    paragraphs: [
      "My name is Sarah, and living with a mobility disability has taught me that things many people take for granted can sometimes feel like the biggest challenges in the world.",
      "Every day, I dream of having a comfortable home where I can move around freely without constantly worrying about stairs, narrow doorways, or spaces that were never designed for someone like me.",
      "Finding accessible housing in Toronto has been incredibly difficult. I've come across apartments that look perfect until I discover there is no elevator, the bathroom is too small for my wheelchair, or the entrance has steps I simply cannot manage.",
      "Sometimes, I feel exhausted before I even begin another housing search. I want the same things everyone else wants: a safe home, privacy, independence, and a place where I can feel comfortable.",
      "I don't want to depend on someone else every time I need to move around my own home. I want to wake up knowing that my living environment supports me instead of making my life harder.",
      "My biggest dream is simple: to find an affordable, accessible home where I can finally feel independent and secure.",
    ],
    quote: "I hope people understand that accessible housing is not a luxury for people like me. It is a necessity.",
  },
  {
    id: "kely",
    name: "Kely",
    title: "Kely's Story: I Want to Live Life on My Own Terms",
    campaignSlug: "wheelchair-for-greater-independence",
    campaignLabel: "Support the mobility appeal",
    photoAlt: "A woman in a light blue shirt sitting in a wheelchair beside a tall window and a potted palm.",
    paragraphs: [
      "My name is Kely, and one of the hardest things about living with a physical disability is feeling like I have to ask for help with things I wish I could do independently.",
      "I have dreams, ambitions, and goals just like everyone else. I want to go out, meet people, enjoy my community, and make decisions about my own life without constantly worrying about whether I will have the support I need.",
      "There are days when even simple activities become difficult. Getting around, attending appointments, shopping, and completing everyday household tasks can require more planning and assistance than most people realize.",
      "What hurts the most is not always the physical challenges. Sometimes, it is the feeling of being left behind when the world seems to move forward without considering people like me.",
      "I don't want people to look at me and see only my disability. I want them to recognize my personality, my abilities, and everything I still hope to accomplish.",
      "Having access to reliable support, appropriate equipment, and opportunities to participate in the community would make a tremendous difference in my life.",
      "I am not asking anyone to feel sorry for me. I am asking for a fair opportunity to live with dignity, independence, and hope.",
    ],
    quote: "I still have so much life ahead of me, and I want the chance to enjoy it.",
  },
  {
    id: "michael",
    name: "Michael",
    title: "Michael's Story: Everyday Things Are Not Always Easy",
    campaignSlug: null,
    campaignLabel: "Give to the General Community Fund",
    photoAlt: "A person using a white cane walks along the tactile guide strip on a Toronto subway platform beside a TTC train.",
    paragraphs: [
      "My name is Michael, and living with a visual impairment has changed the way I experience the world around me.",
      "Things that other people may do without thinking, such as reading a sign, crossing a busy street, finding a particular building, or navigating public transportation, can require extra time, concentration, and preparation for me.",
      "Toronto is a busy city, and getting around independently can sometimes be overwhelming. Unexpected construction, blocked sidewalks, poorly marked crossings, and inaccessible information can turn an ordinary journey into a stressful experience.",
      "There have been moments when I have felt frustrated because I needed assistance but didn't know whether someone would understand what I needed.",
      "I value my independence more than anything. I want to be able to travel, work, socialize, and participate in everyday activities without feeling like the world is constantly putting obstacles in my way.",
      "Accessible technology, clear public information, better pedestrian infrastructure, and greater awareness would make a real difference.",
      "My visual impairment does not define my intelligence, ambitions, or ability to contribute to society.",
    ],
    quote: "I hope for a community where people with visual disabilities can move around confidently, feel respected, and enjoy the same opportunities as everyone else.",
  },
  {
    id: "emily",
    name: "Emily",
    title: "Emily's Story: I Want to Be Heard, Too",
    campaignSlug: null,
    campaignLabel: "Give to the General Community Fund",
    photoAlt: "Two women laughing together on a sofa; one wears a hearing aid and the other is using sign language.",
    paragraphs: [
      "My name is Emily, and living with a hearing impairment has taught me how important communication and understanding really are.",
      "Sometimes, I find myself smiling and nodding during conversations because I haven't understood everything someone has said. It can be embarrassing to keep asking people to repeat themselves, especially when they become impatient or assume I am not paying attention.",
      "Social gatherings can be particularly challenging. When several people speak at once, background noise makes it difficult for me to follow conversations. I sometimes feel isolated even when I am surrounded by people.",
      "What I wish more people understood is that hearing difficulties do not mean someone has nothing to say or does not want to participate.",
      "I want to enjoy conversations, attend community events, pursue employment opportunities, and build meaningful friendships without constantly feeling excluded.",
      "Simple things can make a huge difference. Facing me while speaking, being patient, providing captions during presentations, and making communication accessible can help me feel included.",
      "I don't expect the world to revolve around my needs. I simply hope people will make room for different ways of communicating.",
    ],
    quote: "Everyone deserves to be heard, understood, and included.",
  },
  {
    id: "daniel",
    name: "Daniel",
    title: "Daniel's Story: My Disability Should Not Decide My Future",
    campaignSlug: null,
    campaignLabel: "Give to the General Community Fund",
    photoAlt: "A young man in a wheelchair working at a wooden desk with a laptop, phone and papers.",
    paragraphs: [
      "My name is Daniel, and I live with cerebral palsy. Like many people, I have dreams of building a successful career, becoming financially independent, and making a meaningful contribution to my community.",
      "Unfortunately, getting access to the same educational and employment opportunities as everyone else has not always been easy.",
      "Some environments are physically inaccessible, while others lack the understanding and flexibility needed to accommodate people with disabilities.",
      "I remember feeling discouraged when I thought about applying for opportunities because I worried that employers might focus more on my physical condition than my qualifications and abilities.",
      "I want people to understand that cerebral palsy does not take away my intelligence, creativity, determination, or desire to succeed.",
      "I want the opportunity to learn, develop my skills, attend interviews, and demonstrate what I can bring to a workplace.",
      "Accessible classrooms, supportive employers, assistive technology, and inclusive recruitment practices can open doors that might otherwise remain closed.",
      "My dream is to build a career that allows me to support myself and feel proud of what I accomplish.",
      "I don't want my future to be limited by other people's assumptions about what I can or cannot do.",
    ],
    quote: "Give me an opportunity, and let my abilities speak for themselves.",
  },
  {
    id: "grace",
    name: "Grace",
    title: "Grace's Story: Every Day Is a Different Kind of Challenge",
    campaignSlug: null,
    campaignLabel: "Give to the General Community Fund",
    photoAlt: "A woman with curly red hair resting her arms on the back of a sofa, looking out of a bright window.",
    paragraphs: [
      "My name is Grace, and I live with multiple sclerosis, commonly known as MS.",
      "One of the most difficult things about this condition is that my abilities and energy levels can change. Some days I feel capable of handling my normal activities, while on other days fatigue, weakness, balance difficulties, or other symptoms make even simple tasks challenging.",
      "People sometimes assume that because I look fine, I must feel fine. But not every disability is visible, and not every struggle can be recognized from someone's appearance.",
      "Planning my day can be difficult because I never know exactly how much energy I will have. I sometimes have to cancel plans, rearrange appointments, or take time to rest when my body needs it.",
      "What I miss most is the feeling of being able to make plans without worrying about whether my health will allow me to follow through.",
      "I want to continue enjoying life, spending time with people I love, and participating in my community.",
      "Flexible employment, accessible transportation, supportive services, and understanding from the people around me would make life much easier.",
      "I have learned that strength is not always about pushing through everything. Sometimes, strength means accepting help, adjusting expectations, and continuing to hope.",
    ],
    quote: "I am still the same person with the same dreams. I just need a little more understanding along the way.",
  },
] as const;
