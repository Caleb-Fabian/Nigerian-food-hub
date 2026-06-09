import pg from 'pg';
const client = new pg.default.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const res = await client.query("UPDATE users SET role = 'admin' WHERE email = 'ifedinezicaleb8@gmail.com' RETURNING id, email, role");
console.log(JSON.stringify(res.rows[0]));
await client.end();
