import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/auth/login",
  },
})

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - /auth/* (login & register)
     * - /api/* (API routes)
     * - /_next/* (Next.js internals)
     * - /favicon.ico, /assets/* (static files)
     */
    "/((?!auth|api|_next|favicon\\.ico|assets).*)",
  ],
}
