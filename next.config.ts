import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Los datos viven en data/ y se leen con fs en tiempo de build.
  // Esto garantiza que Vercel los incluya en el bundle de cada ruta.
  outputFileTracingIncludes: {
    "/**": ["./data/**/*"],
  },
  // La serie se renombró de "De Cuento en Cuento" a "Quinta Escena Podcast"
  // (docs/SEO.md: slug estable, redirección 301 desde el slug antiguo).
  async redirects() {
    return [
      { source: "/de-cuento-en-cuento", destination: "/quinta-escena-podcast", permanent: true },
      { source: "/de-cuento-en-cuento/:path*", destination: "/quinta-escena-podcast/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
