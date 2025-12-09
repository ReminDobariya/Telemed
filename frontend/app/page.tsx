import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Stethoscope, Video, Calendar, MessageCircle, Shield, Users, Heart } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20 md:py-32">
        {/* AI Neural Network Pattern Background */}
        <div className="absolute inset-0 opacity-[0.090]">
          <svg className="w-full h-full" viewBox="7appointments:1 Access to fetch at 'https://f38c9smc-5000.inc1.devtunnels.ms/api/doctor/prescriptions' from origin 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.Understand this error
f38c9smc-5000.inc1.devtunnels.ms/api/doctor/prescriptions:1  Failed to load resource: net::ERR_FAILEDUnderstand this error
api.ts:48  POST http://localhost:5000/api/doctor/prescriptions 403 (Forbidden)0 0 1500 900" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.4" />
              </radialGradient>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.7" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.7" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              {/* Animations */}
              <style>
                {`
                  @keyframes pulse {
                    0%, 100% { opacity: 0.3; r: 18px; }
                    50% { opacity: 0.7; r: 24px; }
                  }
                  @keyframes nodePulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.15); }
                  }
                  @keyframes flow {
                    0% { opacity: 0; }
                    50% { opacity: 1; }
                    100% { opacity: 0; }
                  }
                  .pulse-ring { animation: pulse 3s ease-in-out infinite; }
                  .pulse-ring-2 { animation: pulse 3s ease-in-out 1s infinite; }
                  .pulse-ring-3 { animation: pulse 3s ease-in-out 2s infinite; }
                  .node-pulse-1 { animation: nodePulse 4s ease-in-out infinite; }
                  .node-pulse-2 { animation: nodePulse 4s ease-in-out 1s infinite; }
                  .node-pulse-3 { animation: nodePulse 4s ease-in-out 2s infinite; }
                  .node-pulse-4 { animation: nodePulse 4s ease-in-out 3s infinite; }
                  .flow-particle-1 { animation: flow 4s ease-in-out infinite; }
                  .flow-particle-2 { animation: flow 4s ease-in-out 1s infinite; }
                  .flow-particle-3 { animation: flow 4s ease-in-out 2s infinite; }
                  .flow-particle-4 { animation: flow 4s ease-in-out 3s infinite; }
                `}
              </style>
            </defs>
            
            {/* Neural Network Connections */}
            <g opacity="0.7" filter="url(#glow)">
              {/* Layer 1 to Layer 2 connections */}
              <line x1="250" y1="250" x2="550" y2="200" stroke="url(#lineGradient)" strokeWidth="2" />
              <line x1="250" y1="250" x2="550" y2="350" stroke="url(#lineGradient)" strokeWidth="2" />
              <line x1="250" y1="250" x2="550" y2="500" stroke="url(#lineGradient)" strokeWidth="2" />
              
              <line x1="250" y1="450" x2="550" y2="200" stroke="url(#lineGradient)" strokeWidth="2" />
              <line x1="250" y1="450" x2="550" y2="350" stroke="url(#lineGradient)" strokeWidth="2" />
              <line x1="250" y1="450" x2="550" y2="500" stroke="url(#lineGradient)" strokeWidth="2" />
              
              <line x1="250" y1="650" x2="550" y2="350" stroke="url(#lineGradient)" strokeWidth="2" />
              <line x1="250" y1="650" x2="550" y2="500" stroke="url(#lineGradient)" strokeWidth="2" />
              <line x1="250" y1="650" x2="550" y2="650" stroke="url(#lineGradient)" strokeWidth="2" />
              
              {/* Layer 2 to Layer 3 connections */}
              <line x1="550" y1="200" x2="850" y2="250" stroke="url(#lineGradient)" strokeWidth="2" />
              <line x1="550" y1="200" x2="850" y2="400" stroke="url(#lineGradient)" strokeWidth="2" />
              <line x1="550" y1="200" x2="850" y2="550" stroke="url(#lineGradient)" strokeWidth="2" />
              
              <line x1="550" y1="350" x2="850" y2="250" stroke="url(#lineGradient)" strokeWidth="2" />
              <line x1="550" y1="350" x2="850" y2="400" stroke="url(#lineGradient)" strokeWidth="2" />
              <line x1="550" y1="350" x2="850" y2="550" stroke="url(#lineGradient)" strokeWidth="2" />
              
              <line x1="550" y1="500" x2="850" y2="250" stroke="url(#lineGradient)" strokeWidth="2" />
              <line x1="550" y1="500" x2="850" y2="400" stroke="url(#lineGradient)" strokeWidth="2" />
              <line x1="550" y1="500" x2="850" y2="550" stroke="url(#lineGradient)" strokeWidth="2" />
              
              <line x1="550" y1="650" x2="850" y2="400" stroke="url(#lineGradient)" strokeWidth="2" />
              <line x1="550" y1="650" x2="850" y2="550" stroke="url(#lineGradient)" strokeWidth="2" />
              
              {/* Layer 3 to Layer 4 connections */}
              <line x1="850" y1="250" x2="1150" y2="300" stroke="url(#lineGradient)" strokeWidth="2" />
              <line x1="850" y1="250" x2="1150" y2="450" stroke="url(#lineGradient)" strokeWidth="2" />
              
              <line x1="850" y1="400" x2="1150" y2="300" stroke="url(#lineGradient)" strokeWidth="2" />
              <line x1="850" y1="400" x2="1150" y2="450" stroke="url(#lineGradient)" strokeWidth="2" />
              <line x1="850" y1="400" x2="1150" y2="600" stroke="url(#lineGradient)" strokeWidth="2" />
              
              <line x1="850" y1="550" x2="1150" y2="450" stroke="url(#lineGradient)" strokeWidth="2" />
              <line x1="850" y1="550" x2="1150" y2="600" stroke="url(#lineGradient)" strokeWidth="2" />
              
              {/* Layer 4 to Output */}
              <line x1="1150" y1="300" x2="1400" y2="400" stroke="url(#lineGradient)" strokeWidth="2" />
              <line x1="1150" y1="450" x2="1400" y2="400" stroke="url(#lineGradient)" strokeWidth="2" />
              <line x1="1150" y1="600" x2="1400" y2="400" stroke="url(#lineGradient)" strokeWidth="2" />
            </g>
            
            {/* Neural Network Nodes */}
            <g filter="url(#glow)">
              {/* Input Layer */}
              <circle cx="250" cy="250" r="14" fill="url(#nodeGradient)" className="node-pulse-1" />
              <circle cx="250" cy="450" r="14" fill="url(#nodeGradient)" className="node-pulse-2" />
              <circle cx="250" cy="650" r="14" fill="url(#nodeGradient)" className="node-pulse-3" />
              
              {/* Hidden Layer 1 */}
              <circle cx="550" cy="200" r="12" fill="url(#nodeGradient)" className="node-pulse-2" />
              <circle cx="550" cy="350" r="12" fill="url(#nodeGradient)" className="node-pulse-3" />
              <circle cx="550" cy="500" r="12" fill="url(#nodeGradient)" className="node-pulse-4" />
              <circle cx="550" cy="650" r="12" fill="url(#nodeGradient)" className="node-pulse-1" />
              
              {/* Hidden Layer 2 */}
              <circle cx="850" cy="250" r="12" fill="url(#nodeGradient)" className="node-pulse-3" />
              <circle cx="850" cy="400" r="12" fill="url(#nodeGradient)" className="node-pulse-4" />
              <circle cx="850" cy="550" r="12" fill="url(#nodeGradient)" className="node-pulse-1" />
              
              {/* Hidden Layer 3 */}
              <circle cx="1150" cy="300" r="12" fill="url(#nodeGradient)" className="node-pulse-4" />
              <circle cx="1150" cy="450" r="12" fill="url(#nodeGradient)" className="node-pulse-1" />
              <circle cx="1150" cy="600" r="12" fill="url(#nodeGradient)" className="node-pulse-2" />
              
              {/* Output Layer */}
              <circle cx="1400" cy="400" r="16" fill="url(#nodeGradient)" className="node-pulse-3" />
            </g>
            
            {/* Pulse animations */}
            <g>
              <circle cx="250" cy="250" r="18" fill="none" stroke="#3b82f6" strokeWidth="2.5" className="pulse-ring" />
              <circle cx="850" cy="400" r="16" fill="none" stroke="#3b82f6" strokeWidth="2.5" className="pulse-ring-2" />
              <circle cx="1400" cy="400" r="20" fill="none" stroke="#3b82f6" strokeWidth="2.5" className="pulse-ring-3" />
            </g>
            
            {/* Medical cross symbols at key nodes */}
            <g opacity="0.6" fill="#3b82f6">
              <rect x="248" y="245" width="4" height="10" />
              <rect x="245" y="248" width="10" height="4" />
              
              <rect x="1148" y="448" width="4" height="10" />
              <rect x="1145" y="451" width="10" height="4" />
              
              <rect x="1398" y="395" width="4" height="10" />
              <rect x="1395" y="398" width="10" height="4" />
            </g>
            
            {/* Data flow particles with animation */}
            <g>
              <circle cx="400" cy="275" r="4" fill="#60a5fa" className="flow-particle-1" />
              <circle cx="700" cy="325" r="4" fill="#60a5fa" className="flow-particle-2" />
              <circle cx="1000" cy="375" r="4" fill="#60a5fa" className="flow-particle-3" />
              <circle cx="1275" cy="425" r="4" fill="#60a5fa" className="flow-particle-4" />
              
              <circle cx="400" cy="400" r="4" fill="#3b82f6" className="flow-particle-2" />
              <circle cx="700" cy="450" r="4" fill="#3b82f6" className="flow-particle-3" />
              <circle cx="1000" cy="525" r="4" fill="#3b82f6" className="flow-particle-4" />
            </g>
          </svg>
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-blue-100 p-4">
                <Stethoscope className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="text-blue-600">Telemed</span> Platform
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Your trusted telemedicine solution. Connect with healthcare professionals, manage your health records, and access medical care from anywhere, anytime.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                <Link href="/login">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Why Choose Telemed?</h2>
            <p className="mt-4 text-base sm:text-lg text-gray-600">Comprehensive healthcare management at your fingertips</p>
          </div>
          <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group p-4 sm:p-6 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <Video className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">Virtual Consultations</h3>
              <p className="text-sm sm:text-base text-gray-600">Connect with doctors through secure video calls from the comfort of your home.</p>
            </div>
            <div className="group p-4 sm:p-6 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">Easy Appointments</h3>
              <p className="text-sm sm:text-base text-gray-600">Book, manage, and track your appointments with ease. Never miss a consultation.</p>
            </div>
            <div className="group p-4 sm:p-6 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <MessageCircle className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">AI Health Assistant</h3>
              <p className="text-sm sm:text-base text-gray-600">Get instant health insights and answers to your medical questions with our AI-powered assistant.</p>
            </div>
            <div className="group p-4 sm:p-6 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">Secure Records</h3>
              <p className="text-sm sm:text-base text-gray-600">Your health data is encrypted and securely stored. Full control over your medical records.</p>
            </div>
            <div className="group p-4 sm:p-6 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <Users className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">Expert Doctors</h3>
              <p className="text-sm sm:text-base text-gray-600">Access a network of verified healthcare professionals across various specialties.</p>
            </div>
            <div className="group p-4 sm:p-6 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">Health Tracking</h3>
              <p className="text-sm sm:text-base text-gray-600">Monitor your medications, lab reports, and health metrics all in one place.</p>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-lg sm:text-xl font-semibold">Telemed</span>
            </div>
            <p className="text-sm sm:text-base text-gray-400 mb-4">Your trusted telemedicine platform</p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-gray-400">
              <Link href="/login" className="hover:text-white transition-colors">Login</Link>
              <Link href="/register" className="hover:text-white transition-colors">Register</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            </div>
            <p className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500">© 2025 Telemed Platform. All rights reserved.</p>
        </div>
      </div>
      </footer>
    </main>
  )
}