# Automatic MAC Address Detection

This guide explains how automatic MAC address detection works in the Waveman Data Deals app.

## Overview

When users select a data plan and open the payment modal, the app automatically detects their device's MAC address through multiple fallback methods. Users are no longer required to manually enter their MAC address.

## Detection Methods (Priority Order)

### 1. Local Endpoint Detection
- **Method**: Queries a local service running on port 5555
- **Reliability**: Highest (if available)
- **Setup**: Requires a local service to expose MAC address via HTTP
- **Endpoint**: `http://localhost:5555/get-mac`
- **Response**: `{ "macAddress": "00:1A:2B:3C:4D:5E" }`

**Example Local Service (Node.js):**
```javascript
const http = require('http');
const { execSync } = require('child_process');

const server = http.createServer((req, res) => {
  if (req.url === '/get-mac') {
    const mac = execSync('getmac').toString().trim();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ macAddress: mac }));
  }
});

server.listen(5555, '127.0.0.1');
```

### 2. Backend ARP Lookup
- **Method**: Backend detects client IP via WebRTC, then queries ARP table
- **Reliability**: Medium (works on same LAN)
- **Platforms**: Linux, macOS, Windows
- **Endpoint**: `POST /api/device/detect-mac`
- **Payload**: `{ "clientIp": "192.168.1.100" }`

**How it works:**
1. Frontend gets client's local IP using WebRTC
2. Frontend sends IP to backend: `POST /api/device/detect-mac`
3. Backend executes ARP command: `arp -n <IP>`
4. Backend extracts MAC from ARP table and returns it

**Example Response:**
```json
{
  "success": true,
  "macAddress": "00:1A:2B:3C:4D:5E",
  "clientIp": "192.168.1.100",
  "method": "arp-lookup"
}
```

### 3. Manual Entry
- **Fallback**: If auto-detection fails, user enters MAC manually
- **Format**: `00:1A:2B:3C:4D:5E` (colons required)

## Frontend Implementation

The detection happens automatically in the PaymentModal component using `lib/mac-detector.ts`:

```typescript
import { detectMacAddress } from '@/lib/mac-detector'

// In component useEffect:
useEffect(() => {
  const result = await detectMacAddress()
  if (result.macAddress) {
    setMacAddress(result.macAddress) // Auto-populated
  }
}, [])
```

## Backend Implementation

### Device Detection Endpoints

**POST /api/device/detect-mac**
- Detects MAC address from client IP using ARP
- Supports Linux, macOS, Windows
- Requires client IP in request body

**GET /api/device/local-macs**
- Returns server's local network MAC addresses
- Useful for debugging and validation

### Required Permissions

For ARP lookup to work:
- **Linux**: Command runs with regular user permissions
- **macOS**: Command runs with regular user permissions
- **Windows**: May require elevated privileges

## Testing

### Manual Testing
1. Open payment modal
2. Check browser console for detection logs
3. Verify MAC address appears automatically
4. MAC shows with "✓ Auto-detected" indicator

### Debug Logs
Look for these messages in browser console:
```
[v0] Client IP detected: 192.168.1.100
[v0] MAC detected via arp: 00:1A:2B:3C:4D:5E
```

### Test with Sample MAC
If detection fails during testing:
```typescript
import { generateTestMac } from '@/lib/mac-detector'

const testMac = generateTestMac() // Returns random MAC
```

## Troubleshooting

### MAC Detection Failed
**Problem**: Modal shows "Could not auto-detect MAC"

**Solutions:**
1. Check if backend is running: `curl http://localhost:3001/api/health`
2. Check if device is on same network as backend
3. Check ARP table manually:
   - Linux/Mac: `arp -a`
   - Windows: `arp -a`
4. Manually enter MAC address as fallback

### ARP Lookup Returns Nothing
**Problem**: Backend cannot find MAC for client IP

**Causes:**
- Device is on different network (VPN, different subnet)
- ARP cache doesn't have entry yet
- Device uses DHCP without active ARP

**Solution**: Wait 30 seconds or manually refresh ARP cache:
```bash
# Linux/Mac
arp -d <ip>  # Clear entry
ping <ip>    # Refresh

# Windows
arp -d <ip>
ping <ip>
```

### Local Endpoint Unreachable
**Problem**: CORS or connection error to localhost:5555

**Solutions:**
1. Ensure local service is running
2. Check if port 5555 is available: `netstat -an | grep 5555`
3. Verify CORS headers in local service
4. Use fallback ARP method instead

## Security Considerations

### MAC Address Privacy
- MAC addresses are transmitted in plain HTTP (no sensitive data)
- Used only for device identification
- Stored in `device_registrations` table with user consent
- Never shared with third parties

### Backend ARP Security
- Only works on same local network
- Cannot access MAC on different networks
- No credentials needed (public ARP protocol)

## Environment Variables

Add to `.env`:
```
# For local endpoint (optional)
LOCAL_MAC_ENDPOINT=http://localhost:5555/get-mac

# For testing - force manual entry
DISABLE_MAC_AUTO_DETECT=false
```

## Performance

- Detection completes in 2-5 seconds
- Non-blocking (shows loading indicator)
- Falls back to manual entry if timeout
- Timeout: 5 seconds per method

## Browser Support

- **Chrome/Edge**: Full support (WebRTC works)
- **Firefox**: Full support
- **Safari**: Limited support (WebRTC may not work on iOS)
- **Mobile**: Limited ARP access

## Production Checklist

- [ ] Test ARP lookup on production network
- [ ] Verify backend permissions for ARP commands
- [ ] Set appropriate CORS headers
- [ ] Monitor detection success rate
- [ ] Have manual entry as reliable fallback
- [ ] Document IP ranges for support

## Advanced Configuration

### Custom Detection Logic
Extend `lib/mac-detector.ts` to add custom methods:

```typescript
async function detectViaCustomMethod(): Promise<DetectionResult> {
  // Your custom logic
  return { macAddress, method: 'custom', error: null }
}
```

### Caching Detected MAC
Store detected MAC in localStorage:

```typescript
const cached = localStorage.getItem('deviceMac')
if (cached) {
  setMacAddress(cached)
}
```

## API Reference

### Frontend: `detectMacAddress()`
```typescript
const result = await detectMacAddress()
// result.macAddress: "00:1A:2B:3C:4D:5E" | null
// result.method: "local-endpoint" | "arp" | "webrtc-fallback" | "unknown"
// result.error: string | null
```

### Backend: POST /api/device/detect-mac
```bash
curl -X POST http://localhost:3001/api/device/detect-mac \
  -H "Content-Type: application/json" \
  -d '{"clientIp":"192.168.1.100"}'
```

Response:
```json
{
  "success": true,
  "macAddress": "00:1A:2B:3C:4D:5E",
  "clientIp": "192.168.1.100",
  "method": "arp-lookup"
}
```

## Support

For issues with MAC detection:
1. Check browser console for error messages
2. Review server logs on backend
3. Test ARP lookup manually on server
4. Use manual entry as temporary workaround
