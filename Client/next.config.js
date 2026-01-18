/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["localhost", "supabase.co"],
    },
    eslint: {
        // Allow production builds to successfully complete even with ESLint errors
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Allow production builds to successfully complete even with TypeScript errors
        ignoreBuildErrors: true,
    },
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY:
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
            process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    },
}

module.exports = nextConfig
