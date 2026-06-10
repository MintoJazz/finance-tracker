import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
    // Aponta para o arquivo que criamos no passo anterior
    swSrc: "app/sw.ts",
    // Onde o Next.js vai gerar o arquivo final do Service Worker
    swDest: "public/sw.js",
    disable: process.env.NODE_ENV !== "production",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return []
    },
    experimental: {
        serverActions: {
            allowedOrigins: ['localhost:3000', '192.168.2.119:3000']
        }
    }
};

export default withSerwist(nextConfig);