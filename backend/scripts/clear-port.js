/**
 * clear-port.js
 * Utility to forcefully free up a port on Windows.
 * Usage: node clear-port.js <port_number>
 */

const { execSync } = require('child_process');

const port = process.argv[2] || 5000;

console.log(`[PortManager] Checking if port ${port} is occupied...`);

try {
  // Find the PID using the port
  const output = execSync(`netstat -ano | findstr :${port}`).toString();
  const lines = output.trim().split('\n');
  
  const pids = new Set();
  lines.forEach(line => {
    const parts = line.trim().split(/\s+/);
    // netstat output format: Protocol LocalAddress ForeignAddress State PID
    // We want the last column
    const pid = parts[parts.length - 1];
    if (pid && !isNaN(pid) && pid !== '0') {
      pids.add(pid);
    }
  });

  if (pids.size > 0) {
    console.log(`[PortManager] Found ${pids.size} process(es) using port ${port}: ${Array.from(pids).join(', ')}`);
    pids.forEach(pid => {
      try {
        console.log(`[PortManager] Forcefully terminating process ${pid}...`);
        execSync(`taskkill /F /PID ${pid}`);
        console.log(`[PortManager] Successfully terminated process ${pid}.`);
      } catch (e) {
        console.warn(`[PortManager] Failed to terminate process ${pid}. It might have already exited.`);
      }
    });
  } else {
    console.log(`[PortManager] Port ${port} is free.`);
  }
} catch (error) {
  // If no process is found, findstr returns exit code 1, which throws an error in execSync
  if (error.status === 1) {
    console.log(`[PortManager] Port ${port} is already free.`);
  } else {
    console.error(`[PortManager] Error checking port ${port}:`, error.message);
  }
}

// Exit gracefully
process.exit(0);
