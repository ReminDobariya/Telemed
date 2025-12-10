/** @type {import('next').NextConfig} */
const isDoctorApp = process.env.APP_TARGET === 'doctor'
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  distDir: isDoctorApp ? '.next-doctor' : '.next-patient',
}

export default nextConfig
