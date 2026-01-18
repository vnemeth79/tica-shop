import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const result = await connection.execute(
  'INSERT INTO orders (customerName, customerEmail, shippingAddress, subtotal, discount, shippingCost, total, status, paymentMethod) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  ['Test', 'test@test.com', 'Test Address', '0.00', '0.00', '10.00', '10.00', 'pending', 'Revolut']
);

console.log('Insert result:', result);
console.log('Insert ID:', result[0].insertId);
console.log('Type:', typeof result[0].insertId);

await connection.end();
