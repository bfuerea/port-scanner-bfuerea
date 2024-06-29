const net = require('net');
const http = require('http');
const fs = require('fs');

const timeout = 5000; 

async function checkPort(ipAddress, port) { // Added ipAddress as a parameter
    return new Promise((resolve, reject) => {
        const socket = new net.Socket();

        socket.setTimeout(timeout);
        socket.on('timeout', () => {
            socket.destroy();
            resolve(false); 
        });

        socket.on('connect', () => {
            socket.destroy();
            resolve(true); 
        });

        socket.on('error', () => {
            socket.destroy();
            resolve(false);
        });

        socket.connect(port, ipAddress); 
    });
}

async function scanPorts(ipAddress, ports) { // Added ipAddress and ports as parameters
    const results = [];

    for (const port of ports) {
        const isOpen = await checkPort(ipAddress, port); 
        results.push({ "IP Address": ipAddress, "Port": port, "Open": isOpen });
    }

    return results; 
}

const server = http.createServer(async (req, res) => {
    try {
        const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

        // Send initial HTML with loading icon
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <link rel="stylesheet" href="https://matcha.mizu.sh/matcha.css">
                <title>Port Scan Results</title>
                <style>
                    #loading { 
                        display: flex; 
                        justify-content: center; 
                        align-items: center;
                        height: 100vh; 
                    }
                </style>
            </head>
            <body>
                <h2>Port Scan Results</h2>
                <div id="loading">Loading...</div>
                <div id="results" style="display:none;"></div> 
            </body>
            </html>
        `);

        // Start port scanning and send table when done
        const results = await scanPorts(config.ipAddress, config.ports);
        const tableHtml = `
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
        `;

        // Use res.write to send the table HTML (replaces the old loading content)
        res.write(`<script>document.getElementById('loading').style.display = 'none';</script>`); // Hide loading
        res.write(`<script>document.getElementById('results').innerHTML = \`${tableHtml}\`;</script>`); // Show results
        res.write(`<script>document.getElementById('results').style.display = 'block';</script>`); // Show results
        res.end();

    } catch (error) {
        console.error('Error:', error);
        res.statusCode = 500;
        res.end('Internal Server Error');
    }
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
