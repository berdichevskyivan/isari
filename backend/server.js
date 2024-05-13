import express from 'express';
import { createPool, sql } from 'slonik';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';

import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cors());

const server = createServer(app);

// Create PostgreSQL pool
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@localhost:${5432}/${process.env.DB_NAME}`;
const pool = await createPool(connectionString);

async function testQuery() {
    try {
        const { rows } = await pool.query(sql.unsafe`SELECT 1 AS value`);
        if(rows[0]?.value === 1){
            console.log('Connected to Postgres DB successfully.');
        }
    } catch (error) {
        console.error('Error executing query:', error.message);
    }
}

testQuery();

// const testQuery = "SELECT";
// const { rows: companiesToSend } = await pool.query(loadNotSentMailQuery);

const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

// const __dirname = dirname(fileURLToPath(import.meta.url));

// In case we need to use REST API
// We'll add LLM models and CV models to help us solve issues within the site and code
// app.get('/', (req, res) => {
//   res.sendFile(join(__dirname, 'index.html'));
// });

io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});