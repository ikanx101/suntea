// Middleware (Edge runtime) dan halaman/API route (Node runtime) harus sepakat
// persis pada satu nama cookie sesi. Membiarkan next-auth mendeteksi otomatis
// dari NEXTAUTH_URL/protokol request terbukti bisa berbeda antara kedua runtime
// itu di belakang proxy Railway, menyebabkan redirect loop /login <-> /.
// NODE_ENV diisi otomatis & konsisten oleh Next.js sendiri, jadi lebih aman
// dijadikan acuan dibanding NEXTAUTH_URL yang bisa diisi belakangan oleh user.
export const useSecureAuthCookies = process.env.NODE_ENV === "production";

export const authSessionCookieName = useSecureAuthCookies
  ? "__Secure-next-auth.session-token"
  : "next-auth.session-token";
