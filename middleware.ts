import withAuth from "next-auth/middleware";

export default withAuth({
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/((?!api/auth|api-health-check|login|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2)$).*)",
  ],
};
