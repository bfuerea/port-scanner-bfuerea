const net = require('net');
const http = require('http'); 

const ipAddress = '188.241.90.11';
const ports = [22, 80, 88, 443, 2022, 3000, 5000, 5001, 6690, 8080, 8081, 8888, 9900, 9901, 27017, 27018, 27019, 27107];
const timeout = 5000; 

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

    return results; 
}

const server = http.createServer(async (req, res) => {
    const results = await scanPorts();
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <link rel="stylesheet" href="https://matcha.mizu.sh/matcha.css">
            <title>Port Scan Results</title>
        </head>
        <body>
            <h2>Port Scan Results</h2>
            <table>
                <tr><th>IP Address</th><th>Port</th><th>Open</th></tr>
                ${results.map(result => `
                    <tr>
                        <td>${result['IP Address']}</td>
                        <td>${result['Port']}</td>
                        <td>${result['Open'] ? 'Yes' : 'No'}</td>
                    </tr>
                `).join('')}
            </table>
        </body>
        </html>
    `;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end(html);
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
