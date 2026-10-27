import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description:
    "Return the Clerk user ID for the signed-in owner of this conversation. Use this when the user asks which account is signed in. Do not use it to guess identity from message text.",
  inputSchema: z.object({}),
  outputSchema: z.object({
    userId: z.string(),
    signedIn: z.literal(true),
  }),
  execute(_input, ctx) {
    const { current, initiator } = ctx.session.auth;

    if (
      current?.authenticator !== "clerk" ||
      current.principalType !== "user" ||
      !current.principalId ||
      current.principalId !== initiator?.principalId ||
      current.issuer !== initiator?.issuer
    ) {
      throw new Error("An authenticated conversation owner is required.");
    }

    return { userId: current.principalId, signedIn: true as const };
  },
});
