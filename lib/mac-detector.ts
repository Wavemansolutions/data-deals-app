/**
 * MAC Address Detection Utility
 * Detects device MAC address using multiple methods
 */

export interface DetectionResult {
  macAddress: string | null
  method: 'local-endpoint' | 'arp' | 'webrtc-fallback' | 'unknown'
  error: string | null
}

/**
 * Detect MAC address by querying local endpoint
 * Requires device to have a local service running on port 5555
 */
async function detectViaLocalEndpoint(): Promise<DetectionResult> {
  try {
    const response = await fetch('http://localhost:5555/get-mac', {
      method: 'GET',
      timeout: 5000,
    }).catch(() => null)

    if (response?.ok) {
      const data = await response.json()
      if (data.macAddress) {
        return {
          macAddress: formatMacAddress(data.macAddress),
          method: 'local-endpoint',
          error: null
        }
      }
    }
  } catch (error) {
    console.error('[v0] Local endpoint detection failed:', error)
  }

  return { macAddress: null, method: 'local-endpoint', error: 'Local endpoint not available' }
}

/**
 * Detect MAC via backend ARP lookup
 * Backend queries ARP table using client IP
 */
async function detectViaBackendARP(clientIp: string): Promise<DetectionResult> {
  try {
    const response = await fetch('/api/device/detect-mac', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientIp })
    })

    if (response.ok) {
      const data = await response.json()
      if (data.macAddress) {
        return {
          macAddress: formatMacAddress(data.macAddress),
          method: 'arp',
          error: null
        }
      }
    }
  } catch (error) {
    console.error('[v0] Backend ARP detection failed:', error)
  }

  return { macAddress: null, method: 'arp', error: 'Backend ARP lookup failed' }
}

/**
 * Get client IP address using WebRTC
 */
function getClientIP(): Promise<string | null> {
  return new Promise((resolve) => {
    const rtcPeerConnection = new (window.RTCPeerConnection ||
      (window as any).webkitRTCPeerConnection)({
      iceServers: []
    })

    const candidates: string[] = []

    rtcPeerConnection.createDataChannel('')

    rtcPeerConnection.createOffer().then((offer) => {
      rtcPeerConnection.setLocalDescription(offer)
    }).catch(() => resolve(null))

    rtcPeerConnection.onicecandidate = (ice) => {
      if (!ice || !ice.candidate) {
        rtcPeerConnection.close()
        resolve(candidates[0] || null)
        return
      }

      const candidate = ice.candidate.candidate
      const ipMatch = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/)

      if (ipMatch && !candidates.includes(ipMatch[1])) {
        candidates.push(ipMatch[1])
      }
    }

    setTimeout(() => {
      rtcPeerConnection.close()
      resolve(candidates[0] || null)
    }, 2000)
  })
}

/**
 * Format MAC address to standard format
 */
function formatMacAddress(mac: string): string {
  const cleaned = mac.replace(/[:-]/g, '').toUpperCase()
  if (cleaned.length !== 12) return mac

  return cleaned.match(/.{1,2}/g)?.join(':') || mac
}

/**
 * Detect MAC address with fallback methods
 */
export async function detectMacAddress(): Promise<DetectionResult> {
  try {
    // Method 1: Try local endpoint first
    const localResult = await detectViaLocalEndpoint()
    if (localResult.macAddress) {
      console.log('[v0] MAC detected via local endpoint:', localResult.macAddress)
      return localResult
    }

    // Method 2: Get IP and try backend ARP lookup
    const clientIP = await getClientIP()
    if (clientIP) {
      console.log('[v0] Client IP detected:', clientIP)
      const arpResult = await detectViaBackendARP(clientIP)
      if (arpResult.macAddress) {
        console.log('[v0] MAC detected via ARP:', arpResult.macAddress)
        return arpResult
      }
    }

    // Fallback: Return null, let user enter manually
    return {
      macAddress: null,
      method: 'unknown',
      error: 'Could not auto-detect MAC address. Please enter manually.'
    }
  } catch (error) {
    console.error('[v0] MAC detection error:', error)
    return {
      macAddress: null,
      method: 'unknown',
      error: String(error)
    }
  }
}

/**
 * Generate a mock MAC for testing
 */
export function generateTestMac(): string {
  const hex = () => Math.floor(Math.random() * 16).toString(16)
  return Array(6)
    .fill(0)
    .map(() => `${hex()}${hex()}`)
    .join(':')
    .toUpperCase()
}
