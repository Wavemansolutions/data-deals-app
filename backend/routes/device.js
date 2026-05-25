const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const { promisify } = require('util');
const os = require('os');

const execAsync = promisify(exec);

/**
 * Detect MAC address from client IP using ARP
 * Works on Linux and macOS
 */
router.post('/detect-mac', async (req, res) => {
  try {
    const { clientIp } = req.body;

    if (!clientIp || !isValidIP(clientIp)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid client IP address'
      });
    }

    let macAddress = null;
    const platform = os.platform();

    try {
      if (platform === 'linux') {
        // Linux: use arp command
        macAddress = await detectMacLinux(clientIp);
      } else if (platform === 'darwin') {
        // macOS: use arp command
        macAddress = await detectMacMac(clientIp);
      } else if (platform === 'win32') {
        // Windows: use arp command
        macAddress = await detectMacWindows(clientIp);
      }
    } catch (error) {
      console.error('[v0] ARP lookup error:', error.message);
    }

    if (macAddress) {
      res.json({
        success: true,
        macAddress: macAddress,
        clientIp: clientIp,
        method: 'arp-lookup'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Could not resolve MAC address from IP'
      });
    }
  } catch (error) {
    console.error('[v0] Device detection error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Detect MAC on Linux using arp command
 */
async function detectMacLinux(ip) {
  try {
    const { stdout } = await execAsync(`arp -n ${ip} 2>/dev/null || cat /proc/net/arp | grep ${ip}`);
    const match = stdout.match(/([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/);
    return match ? match[0] : null;
  } catch (error) {
    console.error('[v0] Linux ARP error:', error);
    return null;
  }
}

/**
 * Detect MAC on macOS using arp command
 */
async function detectMacMac(ip) {
  try {
    const { stdout } = await execAsync(`arp -n ${ip}`);
    const match = stdout.match(/([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/);
    return match ? match[0] : null;
  } catch (error) {
    console.error('[v0] macOS ARP error:', error);
    return null;
  }
}

/**
 * Detect MAC on Windows using arp command
 */
async function detectMacWindows(ip) {
  try {
    const { stdout } = await execAsync(`arp -a ${ip}`);
    const match = stdout.match(/([0-9A-Fa-f]{2}[-]){5}([0-9A-Fa-f]{2})/);
    if (match) {
      // Windows uses hyphens, convert to colons
      return match[0].replace(/-/g, ':');
    }
    return null;
  } catch (error) {
    console.error('[v0] Windows ARP error:', error);
    return null;
  }
}

/**
 * Validate IP address format
 */
function isValidIP(ip) {
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  const parts = ip.split('.');
  
  if (!ipv4Pattern.test(ip)) return false;
  
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

/**
 * Get server's local network MAC addresses
 * Useful for whitelisting/debugging
 */
router.get('/local-macs', (req, res) => {
  try {
    const interfaces = os.networkInterfaces();
    const macs = [];

    Object.values(interfaces).forEach(ifaceList => {
      ifaceList.forEach(iface => {
        if (iface.family === 'IPv4' && !iface.internal) {
          macs.push({
            address: iface.address,
            mac: iface.mac,
            netmask: iface.netmask
          });
        }
      });
    });

    res.json({
      success: true,
      localMacs: macs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
