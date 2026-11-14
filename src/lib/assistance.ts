import { z } from "zod";

export const ASSISTANCE_TYPES = [
  { value: "mobility_equipment", label: "Mobility equipment" },
  { value: "wheelchairs_assistive_devices", label: "Wheelchairs and assistive devices" },
  { value: "accessible_transportation", label: "Accessible transportation" },
  { value: "housing_accessibility", label: "Housing accessibility" },
  { value: "essential_living_expenses", label: "Essential living expenses" },
  { value: "daily_support", label: "Disability-related daily support" },
  { value: "other", label: "Other approved needs" },
] as const;

type AssistanceValue = (typeof ASSISTANCE_TYPES)[number]["value"];
const values = ASSISTANCE_TYPES.map((t) => t.value) as [AssistanceValue, ...AssistanceValue[]];

export const assistanceSchema = z.object({
  full_name: z.string().trim().min(1, "Please enter your full name.").max(120, "Please keep your name under 120 characters."),
  email: z.string().trim().email("Please enter a valid email address.").max(255),
  general_location: z.string().trim().min(1, "Please tell us your general area, like Scarborough or Etobicoke.").max(120),
  assistance_type: z.enum(values, { message: "Please choose the type of support you need." }),
  circumstances: z
    .string()
    .trim()
    .min(20, "Please share a little more — at least 20 characters.")
    .max(4000, "Please keep this under 4,000 characters."),
  estimated_need_cad: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^\d+(\.\d{1,2})?$/.test(v), "Please enter a dollar amount, like 1200."),
  consent_given: z.literal(true, { message: "Please agree to the privacy terms to submit." }),
});

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(120),
  email: z.string().trim().email("Please enter a valid email address.").max(255),
  subject: z.string().trim().min(1, "Please add a subject.").max(200),
  message: z.string().trim().min(1, "Please write a message.").max(4000, "Please keep this under 4,000 characters."),
});
