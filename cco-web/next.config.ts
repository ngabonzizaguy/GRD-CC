import type { NextConfig } from 'next';
import path from 'path';

const grdCcoRoot = path.resolve(__dirname, '..');
const grdCcoSrc = path.join(grdCcoRoot, 'src');
const adminSrc = path.resolve(__dirname, '../../greenride-admin-v.2-1/src');

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname, '../../'),
  transpilePackages: ['@grd/cco'],
  experimental: {
    externalDir: true,
  },
  turbopack: {
    resolveAlias: {
      '@grd/cco/theme.css': path.join(grdCcoSrc, 'theme/lmx-theme.css'),
      '@grd/cco': path.join(grdCcoSrc, 'index.ts'),
      '@cco': grdCcoSrc,
      '@admin': adminSrc,
      '@/types': path.join(adminSrc, 'types'),
    },
  },
  webpack: (config) => {
    const appNodeModules = path.join(__dirname, 'node_modules');
    config.resolve.modules = [
      appNodeModules,
      ...(Array.isArray(config.resolve.modules)
        ? config.resolve.modules
        : config.resolve.modules
          ? [config.resolve.modules]
          : ['node_modules']),
    ];
    config.resolve.alias = {
      ...config.resolve.alias,
      '@grd/cco/theme.css': path.join(grdCcoSrc, 'theme/lmx-theme.css'),
      '@grd/cco$': path.join(grdCcoSrc, 'index.ts'),
      '@cco': grdCcoSrc,
      '@admin': adminSrc,
      '@/types': path.join(adminSrc, 'types'),
    };
    return config;
  },
};

export default nextConfig;
