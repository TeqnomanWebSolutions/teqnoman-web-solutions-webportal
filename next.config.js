/** @type {import('next').NextConfig} */
require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
});
const nextConfig = {
  reactStrictMode: false
}

module.exports = nextConfig
