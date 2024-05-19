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

async function fetchWorkerOptions(req, res) {
  console.log('fetchWorkerOptions called');
  try {
      const programmingLanguagesQuery = sql.fragment`SELECT id, name, description, icon_url FROM programming_languages ORDER BY id ASC`;
      const generalizedAiBranchesQuery = sql.fragment`SELECT id, name, description FROM generalized_ai_branches ORDER BY id ASC`;
      const specializedAiApplicationsQuery = sql.fragment`SELECT id, name, icon_url FROM specialized_ai_applications ORDER BY id ASC`;
      const aiToolsQuery = sql.fragment`SELECT id, name, icon_url FROM ai_tools ORDER BY id ASC`;    

      const [programmingLanguages, generalizedAiBranches, specializedAiApplications, aiTools] = await Promise.all([
          pool.query(programmingLanguagesQuery),
          pool.query(generalizedAiBranchesQuery),
          pool.query(specializedAiApplicationsQuery),
          pool.query(aiToolsQuery)
      ]);

      // Ensure all fields are properly handled
      const sanitizedProgrammingLanguages = programmingLanguages.rows.map(row => ({
          ...row,
          name: row.name?.trim() || '',
          description: row.description?.trim() || '',
          icon_url: row.icon_url?.trim() || ''
      }));

      const sanitizedGeneralizedAiBranches = generalizedAiBranches.rows.map(row => ({
          ...row,
          name: row.name?.trim() || '',
          description: row.description?.trim() || ''
      }));

      const sanitizedSpecializedAiApplications = specializedAiApplications.rows.map(row => ({
          ...row,
          name: row.name?.trim() || '',
          icon_url: row.icon_url?.trim() || ''
      }));

      const sanitizedAiTools = aiTools.rows.map(row => ({
          ...row,
          name: row.name?.trim() || '',
          icon_url: row.icon_url?.trim() || ''
      }));

      res.json({
          programming_languages: sanitizedProgrammingLanguages,
          generalized_ai_branches: sanitizedGeneralizedAiBranches,
          specialized_ai_applications: sanitizedSpecializedAiApplications,
          ai_tools: sanitizedAiTools
      });
  } catch (error) {
      console.error('Error fetching worker options:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
}

app.get('/fetchWorkerOptions', fetchWorkerOptions);

io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});