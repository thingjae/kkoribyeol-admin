import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 이 앱은 로그인한 사람에 따라 화면이 달라져서, 미리 만들어 두는 기능은 쓰지 않는다.
  cacheComponents: false,
  partialPrefetching: false,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
