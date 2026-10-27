import { eveChannel } from "eve/channels/eve";
import { extractBearerToken, type AuthFn } from "eve/channels/auth";
import { createRemoteJWKSet, jwtVerify } from "jose";

const clerkFrontendApiUrl = process.env.CLERK_FRONTEND_API_URL?.replace(/\/+$/, "");
const clerkIssuer = clerkFrontendApiUrl ? new URL(clerkFrontendApiUrl).origin : undefined;
const clerkJwks = clerkIssuer
  ? createRemoteJWKSet(new URL(".well-known/jwks.json", `${clerkIssuer}/`))
  : undefined;

const allowedOrigins = new Set(
  (process.env.EVE_ALLOWED_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

for (const vercelHost of [
  process.env.VERCEL_URL,
  process.env.VERCEL_PROJECT_PRODUCTION_URL,
]) {
  if (vercelHost) allowedOrigins.add(`https://${vercelHost}`);
}

const clerkSession: AuthFn<Request> = async (request) => {
  const token = extractBearerToken(request.headers.get("authorization"));
  if (!token || !clerkJwks || !clerkIssuer) return null;

  try {
    const { payload } = await jwtVerify(token, clerkJwks, {
      issuer: clerkIssuer,
      audience: "convex",
    });
    const userId = payload.sub;
    const authorizedParty = payload.azp;

    if (
      typeof userId !== "string" ||
      typeof authorizedParty !== "string" ||
      !allowedOrigins.has(authorizedParty)
    ) {
      return null;
    }

    return {
      authenticator: "clerk",
      issuer: clerkIssuer,
      principalId: userId,
      principalType: "user",
      attributes: {},
    };
  } catch {
    return null;
  }
};

export default eveChannel({
  auth: clerkSession,
  cors: {
    origin: [...allowedOrigins],
    methods: ["GET", "POST"],
    allowHeaders: ["authorization", "content-type"],
  },
});
