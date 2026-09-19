import withAuth from "next-auth/middleware";
import { authSessionCookieName } from "@/lib/auth-cookie";

export default withAuth({
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  cookies: {
    sessionToken: {
      name: authSessionCookieName,
    },
  },
});

export const config = {
  matcher: [
    "/((?!api/auth|api-health-check|login|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2)$).*)",
  ],
};
