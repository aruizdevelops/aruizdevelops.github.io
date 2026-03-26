import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@bluebonnet-tech/core'],
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    // Force all @mui and @emotion imports to resolve from this project's
    // node_modules so the symlinked core package shares a single copy of
    // each library (avoids duplicate React contexts / broken theming).
    const resolve = (pkg) => path.resolve(__dirname, 'node_modules', pkg);
    config.resolve.alias = {
      ...config.resolve.alias,
      '@mui/material': resolve('@mui/material'),
      '@mui/system': resolve('@mui/system'),
      '@mui/styled-engine': resolve('@mui/styled-engine'),
      '@mui/private-theming': resolve('@mui/private-theming'),
      '@mui/utils': resolve('@mui/utils'),
      '@emotion/react': resolve('@emotion/react'),
      '@emotion/styled': resolve('@emotion/styled'),
      '@emotion/cache': resolve('@emotion/cache'),
    };
    return config;
  },
};

export default nextConfig;
