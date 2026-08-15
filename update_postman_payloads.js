const fs = require('fs');

const collectionPath = 'c:/java-full-stack/build-flow/docs/BuildFlow_Postman_Collection.json';
const data = fs.readFileSync(collectionPath, 'utf8');
const collection = JSON.parse(data);

// Project Create
const projectFolder = collection.item.find(i => i.name === 'Projects');
const createProject = projectFolder.item.find(i => i.name === 'Create Project');
createProject.request.body.raw = JSON.stringify({
  "projectName": "Skyline Tower",
  "clientName": "Acme Corp",
  "location": "New York",
  "startDate": "2026-09-01",
  "expectedEndDate": "2028-12-31",
  "estimatedBudget": 5000000.00
}, null, 2);

// Inventory
const inventoryFolder = collection.item.find(i => i.name === 'Inventory');
const addMaterial = inventoryFolder.item.find(i => i.name === 'Add Material');
addMaterial.request.url.raw = "{{baseUrl}}/api/v1/inventory/materials";
addMaterial.request.url.path = ["api", "v1", "inventory", "materials"];
addMaterial.request.body.raw = JSON.stringify({
  "name": "Cement Bag",
  "type": "CONSTRUCTION_MATERIAL",
  "unit": "BAGS",
  "unitPrice": 15.50
}, null, 2);

const getMaterials = inventoryFolder.item.find(i => i.name === 'Get Materials');
getMaterials.request.url.raw = "{{baseUrl}}/api/v1/inventory/materials";
getMaterials.request.url.path = ["api", "v1", "inventory", "materials"];

// Equipment
const equipmentFolder = collection.item.find(i => i.name === 'Equipment');
const addEquipment = equipmentFolder.item.find(i => i.name === 'Add Equipment');
addEquipment.request.body.raw = JSON.stringify({
  "name": "Bulldozer",
  "type": "HEAVY_MACHINERY",
  "status": "AVAILABLE",
  "totalQuantity": 2
}, null, 2);

// Finance
const financeFolder = collection.item.find(i => i.name === 'Finance');
const addTransaction = financeFolder.item.find(i => i.name === 'Add Transaction');
addTransaction.name = "Add Expense";
addTransaction.request.url.raw = "{{baseUrl}}/api/v1/expenses";
addTransaction.request.url.path = ["api", "v1", "expenses"];
addTransaction.request.body.raw = JSON.stringify({
  "projectId": 1,
  "amount": 25000.00,
  "category": "MATERIAL",
  "date": "2026-09-10"
}, null, 2);

const getTransactions = financeFolder.item.find(i => i.name === 'Get Transactions');
getTransactions.name = "Get Expenses";
getTransactions.request.url.raw = "{{baseUrl}}/api/v1/expenses/project/1";
getTransactions.request.url.path = ["api", "v1", "expenses", "project", "1"];

// Reporting
const reportingFolder = collection.item.find(i => i.name === 'Reporting');
const generateReport = reportingFolder.item.find(i => i.name === 'Generate Report');
generateReport.name = "Refresh Dashboard";
generateReport.request.url.raw = "{{baseUrl}}/api/v1/reporting/dashboard/refresh";
generateReport.request.url.path = ["api", "v1", "reporting", "dashboard", "refresh"];
generateReport.request.url.query = [];

// Labour 
const workforceFolder = collection.item.find(i => i.name === 'Workforce');
const addLabour = workforceFolder.item.find(i => i.name === 'Add Labour');
// From earlier, the addLabour payload was:
// { "firstName": "John", "lastName": "Doe", "gender": "MALE", "role": "MASON", "compensationType": "DAILY", "dailyRate": 150.00, "projectId": 1 }
// Let's ensure it has exactly what the backend accepts. Wait! Did we change `Labour` to have `name` instead of `firstName`/`lastName` as per business requirements?
// "Labour should support: name, phone (optional), gender (MALE/FEMALE), role, dailyRate"
addLabour.request.body.raw = JSON.stringify({
  "name": "John Doe",
  "gender": "MALE",
  "role": "MASON",
  "compensationType": "DAILY",
  "dailyRate": 150.00
}, null, 2);


fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
console.log("Postman collection updated successfully.");
