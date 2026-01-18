import { withIronSessionApiRoute, withIronSessionSsr } from "next-iron-session";

const sessionOptions = {
  password: process.env.SESSION_PASSWORD || "change_this_to_a_long_random_string",
  cookieName: "idealclub_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export function withSessionRoute(handler) {
  return withIronSessionApiRoute(handler, sessionOptions);
}

export function withSessionSsr(handler) {
  return withIronSessionSsr(handler, sessionOptions);
}
