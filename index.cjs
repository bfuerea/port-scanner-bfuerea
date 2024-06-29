const net = require('net');

async function isPortOpen(ipAddress, port, timeout = 5000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, ipAddress);
  });
}

async function scanPorts(ipAddress, ports) {
  const results = [];
  for (const port of ports) {
    const isOpen = await isPortOpen(ipAddress, port);
    results.push({ "IP Address": ipAddress, "Port": port, "Open": isOpen });
  }
  return results;
}

module.exports = {
  scanPorts
};

