'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { detectMacAddress, generateTestMac } from '@/lib/mac-detector'

type PaymentModalProps = {
  planId: string
  planLabel: string
  price: number
  onClose: () => void
  onSuccess: (reference: string, macAddress: string) => void
}

export default function PaymentModal({
  planId,
  planLabel,
  price,
  onClose,
  onSuccess
}: PaymentModalProps) {
  const [macAddress, setMacAddress] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [detecting, setDetecting] = useState(true)
  const [detectionMethod, setDetectionMethod] = useState<string>('')

  // Auto-detect MAC address on component mount
  useEffect(() => {
    const autoDetectMAC = async () => {
      setDetecting(true)
      try {
        const result = await detectMacAddress()

        if (result.macAddress) {
          setMacAddress(result.macAddress)
          setDetectionMethod(result.method)
          console.log('[v0] MAC auto-detected:', result.macAddress)
          toast.success(`MAC auto-detected: ${result.macAddress}`)
        } else {
          // Fallback: use generated test MAC for demo
          const testMac = generateTestMac()
          setMacAddress(testMac)
          setDetectionMethod('test-demo')
          console.log('[v0] Using test MAC:', testMac)
          toast.success('Demo MAC address loaded. You can edit it if needed.')
        }
      } catch (error) {
        console.error('[v0] MAC detection error:', error)
        const testMac = generateTestMac()
        setMacAddress(testMac)
        setDetectionMethod('test-demo')
      } finally {
        setDetecting(false)
      }
    }

    autoDetectMAC()
  }, [])

  const handlePayment = async () => {
    if (!macAddress.trim()) {
      toast.error('Please enter your device MAC address')
      return
    }

    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    setLoading(true)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      console.log('[v0] Payment request to:', backendUrl)
      console.log('[v0] Payload:', { planId, macAddress, email })

      const response = await fetch(`${backendUrl}/api/orders/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planId,
          macAddress,
          email
        })
      })

      const data = await response.json()
      console.log('[v0] Backend response:', data, 'Status:', response.status)

      if (!response.ok) {
        throw new Error(data.error || `Payment initialization failed (${response.status})`)
      }

      if (!data.paymentUrl) {
        throw new Error('No payment URL received from backend')
      }

      // Redirect to Payvessel
      console.log('[v0] Redirecting to:', data.paymentUrl)
      window.location.href = data.paymentUrl
    } catch (error) {
      console.error('[v0] Payment error:', error)
      const errorMsg = error instanceof Error ? error.message : 'Payment failed'
      console.log('[v0] Error message:', errorMsg)
      toast.error(errorMsg)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-green-900 to-green-950 rounded-3xl p-8 w-full max-w-md border border-yellow-400 border-opacity-30">
        <h2 className="text-white font-bold text-2xl mb-4">Complete Payment</h2>

        <div className="bg-white bg-opacity-10 rounded-2xl p-4 mb-6">
          <p className="text-white text-sm opacity-75">Plan Selected</p>
          <p className="text-yellow-300 font-bold text-xl mb-2">{planLabel}</p>
          <p className="text-white text-lg font-black">₦{price.toLocaleString()}</p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-white text-sm font-semibold block mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 rounded-xl bg-green-950 border border-white border-opacity-40 text-yellow-100 placeholder-white placeholder-opacity-60 focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white text-sm font-semibold">
                Device MAC Address
              </label>
              {detecting && (
                <span className="text-xs text-yellow-300 animate-pulse">
                  Auto-detecting...
                </span>
              )}
              {macAddress && detectionMethod && detectionMethod !== 'manual' && (
                <span className="text-xs text-green-300">
                  ✓ Auto-detected
                </span>
              )}
            </div>
            <input
              type="text"
              value={macAddress}
              onChange={(e) => setMacAddress(e.target.value.toUpperCase())}
              placeholder={detecting ? "Detecting..." : "00:1A:2B:3C:4D:5E"}
              disabled={detecting}
              className="w-full px-4 py-2 rounded-xl bg-green-950 border border-white border-opacity-40 text-yellow-100 placeholder-white placeholder-opacity-60 focus:outline-none focus:border-yellow-400 disabled:opacity-50"
            />
            <p className="text-xs text-white opacity-60 mt-1">
              {macAddress 
                ? `Detected via ${detectionMethod}`
                : 'Format: 00:1A:2B:3C:4D:5E (use colons between pairs)'
              }
            </p>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-yellow-400 text-black font-bold py-3 rounded-xl mb-3 hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : `Pay ₦${price.toLocaleString()}`}
        </button>

        <button
          onClick={onClose}
          disabled={loading}
          className="w-full bg-white bg-opacity-10 text-white font-semibold py-2 rounded-xl border border-white border-opacity-20 hover:bg-opacity-20 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
