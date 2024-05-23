import express from 'express';
import { createPool, sql } from 'slonik';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';  // For handling multipart/form-data
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

const server = createServer(app);

// Create PostgreSQL pool
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@localhost:${5432}/${process.env.DB_NAME}`;
const pool = await createPool(connectionString);

async function testQuery() {
    try {
        const { rows } = await pool.query(sql.unsafe`SELECT 1 AS value`);
        if (rows[0]?.value === 1) {
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

// Configure Multer for handling file uploads and other fields
const storage = multer.diskStorage({
  destination: './uploads/', // Directory to store uploaded images
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Existing fetchWorkerOptions function
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

// New route for creating a worker
app.post('/createWorker', upload.single('profilePic'), async (req, res) => {
    console.log('createWorker called');

    const { fullName, programmingLanguagesIds, generalizedAiBranches, specializedAiApplicationsIds, aiToolsIds } = req.body;
    const profilePic = req.file;

    try {
        // Insert user data into workers table with default values for email and password
        const createWorkerQuery = sql.fragment`
            INSERT INTO workers (name, email, password, github_url, profile_picture_url, wallet_address)
            VALUES (${fullName}, '', '', '', ${null}, '')
            RETURNING id
        `;
        const result = await pool.query(createWorkerQuery);
        const workerId = result.rows[0].id;

        // If profile picture is provided, rename the file and update the worker record
        if (profilePic) {
            const sanitizedFullName = fullName.replace(/\s+/g, '-').toLowerCase();
            const profilePicUrl = `${workerId}-${sanitizedFullName}${path.extname(profilePic.originalname)}`;
            const oldPath = profilePic.path;
            const newPath = path.join('./uploads/', profilePicUrl);

            fs.renameSync(oldPath, newPath);

            // Update worker with the profile picture URL
            const updateWorkerQuery = sql.fragment`
                UPDATE workers
                SET profile_picture_url = ${profilePicUrl}
                WHERE id = ${workerId}
            `;
            await pool.query(updateWorkerQuery);
        }

        // Insert data into relational tables with correct column names
        const insertRelationalData = async (tableName, workerId, ids, columnName) => {
            for (const id of ids) {
                const query = sql.fragment`
                    INSERT INTO ${sql.identifier([tableName])} (worker_id, ${sql.identifier([columnName])})
                    VALUES (${workerId}, ${id})
                `;
                await pool.query(query);
            }
        };

        await insertRelationalData('worker_programming_languages', workerId, JSON.parse(programmingLanguagesIds), 'programming_language_id');
        await insertRelationalData('worker_generalized_ai_branches', workerId, JSON.parse(generalizedAiBranches), 'ai_branch_id');
        await insertRelationalData('worker_specialized_ai_applications', workerId, JSON.parse(specializedAiApplicationsIds), 'ai_application_id');
        await insertRelationalData('worker_ai_tools', workerId, JSON.parse(aiToolsIds), 'ai_tool_id');

        console.log('Worker created successfully');
        res.json({ success: true, message: 'Worker created successfully', workerId });
    } catch (error) {
        console.error('Error creating worker:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });

        // Remove the uploaded file if it exists and there was an error
        if (profilePic && fs.existsSync(profilePic.path)) {
            fs.unlinkSync(profilePic.path);
        }
    }
});

io.on('connection', (socket) => {
    console.log('a user connected');
});

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});
