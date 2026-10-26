import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js blocks cross-origin requests to dev-only assets/endpoints by
  // default — only localhost and the host `next dev` was started with are
  // allowed automatically. Testing from a phone over the LAN (e.g.
  // http://192.168.1.61:3000) hits that block, which freezes the page at
  // its initial server-rendered state (loading=true forever) since the
  // client JS bundle never finishes loading — the Sign in button just
  // looks permanently disabled with no error. Add this machine's LAN IP so
  // phones on the same network can load dev assets.
  allowedDevOrigins: ["192.168.1.55"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
