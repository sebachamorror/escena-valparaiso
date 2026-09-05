import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Los datos viven en data/ y se leen con fs en tiempo de build.
  // Esto garantiza que Vercel los incluya en el bundle de cada ruta.
  outputFileTracingIncludes: {
    "/**": ["./data/**/*"],
  },
};

export default nextConfig;
