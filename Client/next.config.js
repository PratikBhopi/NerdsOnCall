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
    },
}

module.exports = nextConfig
