import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  /* Simplified Next.js 15.3.1 configuration for stability */
  reactStrictMode: false, // Disable in dev for faster startup
  outputFileTracingRoot: __dirname,
  
  // Basic compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Essential experimental features only
  experimental: {
    // Package import optimization for key dependencies
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
    ],
    // Basic performance features
    optimisticClientCache: true,
  },
};
export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
