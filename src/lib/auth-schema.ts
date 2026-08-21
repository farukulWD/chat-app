import { z } from "zod";
import { DEFAULT_COUNTRY, findCountry } from "./countries";
import { validateName, validatePhone } from "./phone";

export const loginSchema = z
  .object({
    countryIso2: z.string().min(1),
    phone: z.string(),
    name: z.string(),
  })
  .superRefine((values, ctx) => {
    const country = findCountry(values.countryIso2) ?? DEFAULT_COUNTRY;

    const phoneIssue = validatePhone(country, values.phone);
    if (phoneIssue) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: phoneIssue });
    }

    const nameIssue = validateName(values.name);
    if (nameIssue) {
      ctx.addIssue({ code: "custom", path: ["name"], message: nameIssue });
    }
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
