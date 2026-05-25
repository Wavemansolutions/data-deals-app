import { Suspense } from 'react'
import { Toaster } from 'react-hot-toast'
import { PaymentVerification } from '@/components/payment-verification'

export const dynamic = 'force-dynamic'

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-green-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-400 border-t-transparent mx-auto mb-4"></div>
        <p className="text-white text-xl">Loading payment verification...</p>
      </div>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <>
      <Toaster />
      <Suspense fallback={<LoadingFallback />}>
        <PaymentVerification />
      </Suspense>
    </>
  )
}
