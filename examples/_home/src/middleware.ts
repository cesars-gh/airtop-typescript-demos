import { createCsrfMiddleware } from "@edge-csrf/nextjs";

// initalize csrf protection middleware
const csrfMiddleware = createCsrfMiddleware({
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    httpOnly: true,
  },
});

export const middleware = csrfMiddleware;
