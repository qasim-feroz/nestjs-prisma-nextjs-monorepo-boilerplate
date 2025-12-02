/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  reactStrictMode: true,
  // Explicitly use webpack for PWA support (next-pwa requires webpack)
  // Turbopack is disabled in dev via --webpack flag
  turbopack: {},
};

module.exports = withPWA(nextConfig);
