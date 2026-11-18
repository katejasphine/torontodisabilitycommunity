import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { CHALLENGE_MAX_CHARS, CHALLENGE_MIN_CHARS } from "./recommend";

/** Public: suggests community stories and appeals for a visitor's described accessibility interest. Nothing is stored. */
export const recommendSupport = createServerFn({ method: "POST" })
  .inputValidator((input: { challenge: string }) =>
    z.object({ challenge: z.string().trim().min(CHALLENGE_MIN_CHARS).max(CHALLENGE_MAX_CHARS) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { recommendForChallenge } = await import("./recommend.server");
    return recommendForChallenge(data.challenge, getRequest().signal);
  });
