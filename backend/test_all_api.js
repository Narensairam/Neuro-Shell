const http = require('http');

const endpoints = [
    '/api/dashboard',
    '/api/manufacturing',
    '/api/supplychain',
    '/api/finance',
    '/api/hr',
    '/api/itops',
    '/api/commercial'
];

async function testAll() {
    for (const ep of endpoints) {
        await new Promise(resolve => {
            http.get(`http://localhost:5000${ep}`, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    console.log(`Endpoint: ${ep} | Status: ${res.statusCode} | Body Length: ${data.length}`);
                    if (data.length < 5) console.log(`  WARNING: Short body for ${ep}: "${data}"`);
                    resolve();
                });
            }).on('error', err => {
                console.error(`Endpoint: ${ep} | Error: ${err.message}`);
                resolve();
            });
        });
    }
}

testAll();
