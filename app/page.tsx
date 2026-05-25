'use client'

import { useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import PaymentModal from '@/components/payment-modal'

type Plan = {
  id: string
  label: string
  price: number
}

export default function HomePage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

  const dailyPlans: Plan[] = [
    { id: 'd1', label: '1GB', price: 300 },
    { id: 'd2', label: '2GB', price: 450 },
    { id: 'd3', label: '4GB', price: 600 },
    { id: 'd4', label: '7GB', price: 1000 },
  ]

  const weeklyPlans: Plan[] = [
    { id: 'w1', label: '3.5GB', price: 500 },
    { id: 'w2', label: '5GB', price: 800 },
    { id: 'w3', label: '10GB', price: 2500 },
    { id: 'w4', label: '15GB', price: 4500 },
  ]

  const monthlyPlans: Plan[] = [
    { id: 'm1', label: '10GB', price: 3000 },
    { id: 'm2', label: '12GB', price: 4000 },
    { id: 'm3', label: '20GB', price: 8000 },
    { id: 'm4', label: '30GB', price: 11000 },
  ]

  const handlePlanClick = (plan: Plan) => {
    setSelectedPlan(plan)
    toast.success(`${plan.label} selected - ₦${plan.price.toLocaleString()}`)
  }

  const handlePaymentSuccess = (reference: string, macAddress: string) => {
    setSelectedPlan(null)
    toast.success(`Payment initiated! Redirecting to Payvessel...`)
  }

  const handlePaymentClose = () => {
    setSelectedPlan(null)
  }

  const PlanCard = ({ plan, bgColor, duration }: { plan: Plan; bgColor: string; duration: string }) => (
    <div onClick={() => handlePlanClick(plan)} className="group cursor-pointer">
      <div className={`rounded-xl lg:rounded-3xl p-2 lg:p-6 h-full min-h-24 lg:min-h-40 flex flex-col ${bgColor} transition-all duration-300 ease-out hover:scale-95 hover:shadow-2xl transform`}>
        <p className="text-black font-bold text-xs lg:text-sm text-center mb-1 lg:mb-2 opacity-75">
          {duration}
        </p>
        <p className="text-black font-bold text-sm lg:text-2xl text-center mb-1 lg:mb-6">
          {plan.label}
        </p>
        <div className="flex-1 flex items-end justify-center">
          <p className="text-black text-base lg:text-3xl font-black">
            ₦{plan.price.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-green-950 relative overflow-hidden">
      <Toaster />
      
      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentModal
          planId={selectedPlan.id}
          planLabel={selectedPlan.label}
          price={selectedPlan.price}
          onClose={handlePaymentClose}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Decorative elements */}
      <div className="absolute top-8 right-16 w-32 h-32 border-4 border-green-400 rounded-full opacity-40"></div>
      <div className="absolute bottom-40 left-8 w-40 h-40 rounded-full bg-red-500 opacity-20 blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Mobile Hero Section - Top on Mobile, Side on Desktop */}
        <div className="lg:hidden mb-8">
          <div className="text-white mb-6">
            <p className="text-sm font-light italic mb-2 opacity-90">
              Get Your Affordable
            </p>
            <h1 className="text-3xl font-black text-yellow-300 mb-3 leading-tight">
              Data
              <br />
              Deals
            </h1>
            <p className="text-xs mb-4 opacity-95 animate-pulse" style={{
              textShadow: '0 0 15px rgb(255, 0, 127), 0 0 30px rgb(0, 255, 200), 0 0 45px rgb(255, 127, 0), 0 0 60px rgb(0, 127, 255)'
            }}>
              Waveman Integrated Solutions Limited
            </p>
            <div className="w-24 h-1 bg-yellow-300 rounded-full"></div>
          </div>
          <div className="flex justify-center">
            <img
              src="/phone-guy.jpg"
              alt="Guy holding phone"
              className="w-full max-w-xs h-auto object-cover rounded-2xl shadow-2xl"
            />
          </div>
        </div>

        {/* Main Section - Data Groups and Hero Image Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Plans Section - All Three Categories */}
          <div>
            <h2 className="text-white font-bold text-2xl lg:text-4xl mb-4 lg:mb-6">Data Deals</h2>
            <div className="grid grid-cols-3 gap-2 lg:gap-4">
              {/* Daily Plans */}
              <div>
                <div className="flex justify-center mb-1 lg:mb-3">
                  <div className="px-2 py-0.5 lg:px-4 lg:py-2 bg-yellow-400 rounded-lg animate-pulse shadow-lg text-center" style={{
                    boxShadow: '0 0 20px rgb(255, 193, 7), 0 0 40px rgb(255, 193, 7)'
                  }}>
                    <h3 className="text-black font-bold text-xs lg:text-lg">DAILY</h3>
                  </div>
                </div>
                <div className="grid gap-1 lg:gap-2">
                  {dailyPlans.map((plan) => (
                    <PlanCard key={plan.id} plan={plan} bgColor="bg-yellow-400" duration="1 Day" />
                  ))}
                </div>
              </div>

              {/* Weekly Plans */}
              <div>
                <div className="flex justify-center mb-1 lg:mb-3">
                  <div className="px-2 py-0.5 lg:px-4 lg:py-2 bg-green-500 rounded-lg animate-pulse shadow-lg text-center" style={{
                    boxShadow: '0 0 20px rgb(34, 197, 94), 0 0 40px rgb(34, 197, 94)'
                  }}>
                    <h3 className="text-white font-bold text-xs lg:text-lg">WEEKLY</h3>
                  </div>
                </div>
                <div className="grid gap-1 lg:gap-2">
                  {weeklyPlans.map((plan) => (
                    <PlanCard key={plan.id} plan={plan} bgColor="bg-green-500" duration="7 Days" />
                  ))}
                </div>
              </div>

              {/* Monthly Plans */}
              <div>
                <div className="flex justify-center mb-1 lg:mb-3">
                  <div className="px-2 py-0.5 lg:px-4 lg:py-2 bg-red-600 rounded-lg animate-pulse shadow-lg text-center" style={{
                    boxShadow: '0 0 20px rgb(220, 38, 38), 0 0 40px rgb(220, 38, 38)'
                  }}>
                    <h3 className="text-white font-bold text-xs lg:text-lg">MONTHLY</h3>
                  </div>
                </div>
                <div className="grid gap-1 lg:gap-2">
                  {monthlyPlans.map((plan) => (
                    <PlanCard key={plan.id} plan={plan} bgColor="bg-red-600" duration="30 Days" />
                  ))}
                </div>
              </div>
            </div>

            {/* Glowing Horizontal Lines - RGB */}
            <style>{`
              @keyframes rgbGlow {
                0% {
                  box-shadow: 0 0 20px rgb(255, 0, 127), 0 0 40px rgb(255, 0, 127);
                }
                25% {
                  box-shadow: 0 0 20px rgb(0, 255, 200), 0 0 40px rgb(0, 255, 200);
                }
                50% {
                  box-shadow: 0 0 20px rgb(255, 127, 0), 0 0 40px rgb(255, 127, 0);
                }
                75% {
                  box-shadow: 0 0 20px rgb(0, 127, 255), 0 0 40px rgb(0, 127, 255);
                }
                100% {
                  box-shadow: 0 0 20px rgb(255, 0, 127), 0 0 40px rgb(255, 0, 127);
                }
              }
              .rgb-glow {
                animation: rgbGlow 4s ease-in-out infinite;
              }
            `}</style>
            <div className="hidden lg:flex flex-col gap-3 mt-8">
              <div className="h-1 w-full bg-gradient-to-r from-purple-400 to-transparent rounded-full rgb-glow"></div>
              <div className="h-1 w-full bg-gradient-to-r from-cyan-400 to-transparent rounded-full rgb-glow"></div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-white border-opacity-20 bg-blue-900 bg-opacity-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Details */}
            <div>
              <h3 className="font-bold text-lg mb-4 animate-pulse" style={{
                textShadow: '0 0 10px rgb(255, 0, 127), 0 0 20px rgb(0, 255, 200), 0 0 30px rgb(255, 127, 0)'
              }}>
                <span className="text-white">Contact Us</span>
              </h3>
              <div className="space-y-2 text-sm opacity-90">
                <p className="text-white animate-pulse" style={{
                  textShadow: '0 0 8px rgb(0, 255, 200), 0 0 16px rgb(0, 127, 255)'
                }}>Phone: +234 (0) 706 123 4567</p>
                <p className="text-white animate-pulse" style={{
                  textShadow: '0 0 8px rgb(255, 127, 0), 0 0 16px rgb(255, 0, 127)'
                }}>Email: info@waveman.com.ng</p>
                <p className="text-white animate-pulse" style={{
                  textShadow: '0 0 8px rgb(0, 127, 255), 0 0 16px rgb(0, 255, 200)'
                }}>Address: Lagos, Nigeria</p>
              </div>
            </div>

            {/* Spacer on desktop */}
            <div className="hidden md:block"></div>

            {/* Social Media */}
            <div className="flex justify-center md:justify-end gap-6">
              <a href="#" className="text-white hover:text-yellow-400 transition-colors" title="Facebook">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-white hover:text-yellow-400 transition-colors" title="Twitter">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 002.856-3.915 10 10 0 01-2.856.975 5 5 0 00-8.656 3.15 5 5 0 00.13 1.13A14.1 14.1 0 012.06 4.75a5 5 0 001.55 6.68c-.48 0-.96-.12-1.41-.36a5 5 0 004 4.93 5 5 0 01-2.26.08 5 5 0 004.67 3.48A10 10 0 010 19.54a14.1 14.1 0 007.66 2.24c9.183 0 14.188-7.61 14.188-14.21 0-.216 0-.432-.013-.648a10.1 10.1 0 002.475-2.574z"/>
                </svg>
              </a>
              <a href="#" className="text-white hover:text-yellow-400 transition-colors" title="Instagram">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 6.63 5.37 12 12 12s12-5.37 12-12S18.63 0 12 0zm0 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm3.5 12a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zm1.5-5.5a1 1 0 11-2 0 1 1 0 012 0z"/>
                </svg>
              </a>
              <a href="#" className="text-white hover:text-yellow-400 transition-colors" title="LinkedIn">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.047-8.733 0-9.633h3.554v1.365c.426-.658 1.189-1.592 2.894-1.592 2.113 0 3.695 1.381 3.695 4.352v5.508zM5.337 8.855c-1.144 0-1.915-.762-1.915-1.715 0-.953.771-1.715 1.962-1.715 1.191 0 1.915.762 1.915 1.715 0 .953-.771 1.715-1.962 1.715zm1.581 11.597H3.656V9.674h3.262v10.778zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-white border-opacity-10 mt-8 pt-8 text-center text-sm">
            <p className="text-white animate-pulse" style={{
              textShadow: '0 0 10px rgb(255, 0, 127), 0 0 20px rgb(0, 255, 200), 0 0 30px rgb(255, 127, 0), 0 0 40px rgb(0, 127, 255)'
            }}>&copy; 2024 Waveman Integrated Solutions Limited. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
