const net = require('net');

const ipAddress = '188.241.90.11';
const ports = [22, 80, 88, 443, 2022, 3000, 5000, 5001, 6690, 8080, 8081, 8888, 9900, 9901, 27017, 27018, 27019, 27107];
const timeout = 5000; // Timeout in milliseconds

async function checkPort(port) {
    return new Promise((resolve, reject) => {
        const socket = new net.Socket();

        socket.setTimeout(timeout);
        socket.on('timeout', () => {
            socket.destroy();
            resolve(false); // Closed (timed out)
        });

        socket.on('connect', () => {
            socket.destroy();
            resolve(true); // Open
        });

        socket.on('error', () => {
            socket.destroy();
            resolve(false); // Closed (error)
        });

        socket.connect(port, ipAddress);
    });
}

async function scanPorts() {
    const results = [];

    for (const port of ports) {
        const isOpen = await checkPort(port);
        results.push({ "IP Address": ipAddress, "Port": port, "Open": isOpen });
    }

    console.table(results); // Display results in a table
}

scanPorts();
