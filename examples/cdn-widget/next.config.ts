import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  rewrites: () => {
    return [
      {
        source: "/",
        destination: "/index.html",
      },
    ]
  }
};

export default nextConfig;
