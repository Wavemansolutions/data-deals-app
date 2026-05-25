'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

export function PaymentVerification() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [macAddress, setMacAddress] = useState<string | null>(null)

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference')

      if (!reference) {
        setError('No payment reference found')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/verify-payment`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reference })
          }
        )

        const data = await response.json()

        if (data.success) {
          setVerified(true)
          setMacAddress(data.macAddress)
          toast.success('Payment verified successfully!')
          localStorage.setItem('lastMacAddress', data.macAddress)
        } else {
          setError(data.message || 'Payment verification failed')
          toast.error('Payment verification failed')
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Verification error'
        setError(errorMsg)
        toast.error(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-green-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-xl">Verifying your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-green-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {verified ? (
          <div className="bg-gradient-to-b from-green-800 to-green-900 rounded-3xl p-8 border border-green-400 border-opacity-30">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-black text-yellow-300 mb-2">
                Payment Successful!
              </h1>
              <p className="text-white opacity-90">
                Your data plan has been activated
              </p>
            </div>

            <div className="bg-white bg-opacity-10 rounded-2xl p-6 mb-6 border border-white border-opacity-10">
              <p className="text-white text-sm opacity-75 mb-2">Device MAC Address</p>
              <p className="text-green-300 font-mono font-bold text-lg break-all">
                {macAddress}
              </p>
              <p className="text-white text-xs opacity-60 mt-4">
                Save this MAC address. It will be used to activate your data on the device.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(macAddress || '')
                  toast.success('MAC address copied!')
                }}
                className="w-full bg-yellow-400 text-black font-bold py-3 rounded-xl hover:bg-yellow-300 transition-colors"
              >
                Copy MAC Address
              </button>

              <Link
                href="/"
                className="block w-full bg-white bg-opacity-10 text-white font-semibold py-3 rounded-xl border border-white border-opacity-20 hover:bg-opacity-20 transition-colors text-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-b from-red-800 to-red-900 rounded-3xl p-8 border border-red-400 border-opacity-30">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-black text-white mb-2">
                Payment Failed
              </h1>
              <p className="text-white opacity-90">
                {error || 'Unable to verify your payment'}
              </p>
            </div>

            <Link
              href="/"
              className="block w-full bg-yellow-400 text-black font-bold py-3 rounded-xl hover:bg-yellow-300 transition-colors text-center"
            >
              Try Again
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
