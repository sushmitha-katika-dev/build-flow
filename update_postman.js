const fs = require('fs');

const collectionPath = './docs/BuildFlow_Postman_Collection.json';
let data = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

// Helper to add Content-Type header
const addJsonHeader = (request) => {
    if (request.method === 'POST' || request.method === 'PUT') {
        let hasContentType = request.header.find(h => h.key.toLowerCase() === 'content-type');
        if (!hasContentType) {
            request.header.push({ key: 'Content-Type', value: 'application/json', type: 'text' });
        }
    }
};

data.item.forEach(folder => {
    if (folder.name === 'Authentication') {
        folder.item.forEach(req => addJsonHeader(req.request));
    }
    if (folder.name === 'Projects') {
        folder.item.forEach(req => addJsonHeader(req.request));
    }
    if (folder.name === 'Workforce') {
        // Rewrite Workforce collection
        folder.item = [
            {
                name: 'Add Labour',
                request: {
                    method: 'POST',
                    header: [{ key: 'Content-Type', value: 'application/json', type: 'text' }],
                    body: {
                        mode: 'raw',
                        raw: JSON.stringify({
                            firstName: "John",
                            lastName: "Doe",
                            gender: "MALE",
                            role: "MASON",
                            compensationType: "DAILY",
                            dailyRate: 150.00,
                            projectId: 1
                        }, null, 2)
                    },
                    url: { raw: "{{baseUrl}}/api/v1/workforce/labour", host: ["{{baseUrl}}"], path: ["api","v1","workforce","labour"] }
                }
            },
            {
                name: 'Get Labour Summary',
                request: {
                    method: 'GET',
                    header: [],
                    url: { raw: "{{baseUrl}}/api/v1/workforce/labour/summary", host: ["{{baseUrl}}"], path: ["api","v1","workforce","labour","summary"] }
                }
            }
        ];
    }
    if (folder.name === 'Inventory') {
        folder.item.forEach(req => addJsonHeader(req.request));
    }
    if (folder.name === 'Equipment') {
        folder.item.forEach(req => addJsonHeader(req.request));
    }
    if (folder.name === 'Finance') {
        folder.item.forEach(req => addJsonHeader(req.request));
    }
    if (folder.name === 'Reporting') {
        folder.item.forEach(req => addJsonHeader(req.request));
    }
});

fs.writeFileSync(collectionPath, JSON.stringify(data, null, 2));
console.log("Postman collection updated.");
