import express from 'express';
import { createPool, sql } from 'slonik';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';  // For handling multipart/form-data
import fs from 'fs';
import { dirname, join, extname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from the backend/uploads folder
app.use('/uploads', express.static(join(__dirname, 'uploads')));

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

async function fetchAndEmitWorkerInfo(socket) {
    try {
        const workersQuery = sql.fragment`
            SELECT w.id, w.name, w.profile_picture_url,
                array_agg(DISTINCT pl.id) as programming_languages,
                array_agg(DISTINCT g.id) as generalized_ai_branches,
                array_agg(DISTINCT sa.id) as specialized_ai_applications,
                array_agg(DISTINCT at.id) as ai_tools
            FROM workers w
            LEFT JOIN worker_programming_languages wpl ON w.id = wpl.worker_id
            LEFT JOIN programming_languages pl ON wpl.programming_language_id = pl.id
            LEFT JOIN worker_generalized_ai_branches wgb ON w.id = wgb.worker_id
            LEFT JOIN generalized_ai_branches g ON wgb.ai_branch_id = g.id
            LEFT JOIN worker_specialized_ai_applications wsa ON w.id = wsa.worker_id
            LEFT JOIN specialized_ai_applications sa ON wsa.ai_application_id = sa.id
            LEFT JOIN worker_ai_tools wat ON w.id = wat.worker_id
            LEFT JOIN ai_tools at ON wat.ai_tool_id = at.id
            GROUP BY w.id
            ORDER BY w.id ASC
        `;
        
        const result = await pool.query(workersQuery);
        
        const workers = result.rows.map(row => ({
            id: row.id,
            name: row.name.trim(),
            profile_picture_url: row.profile_picture_url.trim(),
            programming_languages: row.programming_languages.filter(Boolean),
            generalized_ai_branches: row.generalized_ai_branches.filter(Boolean),
            specialized_ai_applications: row.specialized_ai_applications.filter(Boolean),
            ai_tools: row.ai_tools.filter(Boolean)
        }));
        
        console.log('emitting updateWorkers', workers);
        if(socket){
          socket.emit('updateWorkers', workers);
        }else{
          io.emit('updateWorkers', workers);
        }
        console.log('Emitted worker information to all clients');
    } catch (error) {
        console.error('Error fetching worker information:', error.message);
    }
}

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

        const workerOptions = {
            programming_languages: sanitizedProgrammingLanguages,
            generalized_ai_branches: sanitizedGeneralizedAiBranches,
            specialized_ai_applications: sanitizedSpecializedAiApplications,
            ai_tools: sanitizedAiTools
        }
        // console.log('emitting workerOptions: ', workerOptions);
        console.log('emitting workerOptions')
        res.json(workerOptions);
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

    console.log('fullName:', fullName);
    console.log('profilePic:', profilePic);

    try {
        // Ensure fullName is defined and a string
        if (!fullName || typeof fullName !== 'string') {
            throw new Error('Invalid fullName');
        }

        // Insert user data into workers table with default values for email and password
        const createWorkerQuery = sql.fragment`
            INSERT INTO workers (name, email, password, github_url, profile_picture_url, wallet_address)
            VALUES (${fullName}, '', '', '', ${''}, '')
            RETURNING id
        `;
        
        const result = await pool.one(createWorkerQuery);
        const workerId = result.id;

        // If profile picture is provided, rename the file and update the worker record
        if (profilePic) {
            const sanitizedFullName = fullName.replace(/\s+/g, '-').toLowerCase();
            const profilePicUrl = `${workerId}-${sanitizedFullName}${extname(profilePic.originalname)}`;
            const oldPath = profilePic.path;
            const newPath = join(__dirname, 'uploads', profilePicUrl);

            console.log('oldPath:', oldPath);
            console.log('newPath:', newPath);

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
            console.log(`Inserting into ${tableName} for worker ${workerId}:`, ids);

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
        // Emitting the information to the whole network
        fetchAndEmitWorkerInfo();
        res.json({ success: true, message: 'Worker created successfully', workerId });
    } catch (error) {
        console.error('Error creating worker:', error.message);

        // Log detailed error information
        if (error.constraint) {
            console.error(`Constraint violation: ${error.constraint}`);
        }
        if (error.detail) {
            console.error(`Error details: ${error.detail}`);
        }
        if (error.table) {
            console.error(`Table: ${error.table}`);
        }

        res.status(500).json({ success: false, message: 'Internal Server Error' });

        // Remove the uploaded file if it exists and there was an error
        if (profilePic && fs.existsSync(profilePic.path)) {
            fs.unlinkSync(profilePic.path);
        }
    }
});

io.on('connection', (socket) => {
    console.log('a user connected');

    // When user connects, I send the workers info, but to the socket.
    fetchAndEmitWorkerInfo(socket);

    socket.on('disconnect', () => {
        console.log('a user disconnected');
    });
});

// Start emitting worker information periodically
const EMIT_INTERVAL = 30000; // 30 seconds
setInterval(fetchAndEmitWorkerInfo, EMIT_INTERVAL);

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});
