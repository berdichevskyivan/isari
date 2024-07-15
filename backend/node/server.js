import express from 'express';
import { createPool, sql } from 'slonik';
import https from 'https';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';  // For handling multipart/form-data
import fs from 'fs';
import { dirname, join, extname } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import path from 'path';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { initTaskManager } from './taskManager.js'

dotenv.config();

console.log(process.env.NODE_ENV)

const isProduction = process.env.NODE_ENV === 'production';

const PORT = isProduction ? 443 : 80;

const app = express();

app.use(cors({
  origin: isProduction ? "https://isari.ai" : 'http://localhost:5000',
  methods: ["GET", "POST", "DELETE"],
  credentials: true
}));

app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(cookieParser()); // Adding cookie-parser middleware

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from the backend/uploads folder
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Configure rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later"
});

// Apply rate limiting to all requests
app.use(limiter);

// Configure logging
app.use(morgan('combined'));

const options = isProduction ? {
  key: fs.readFileSync('/etc/letsencrypt/live/isari.ai/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/isari.ai/fullchain.pem')
} : {};

const server = isProduction
  ? https.createServer(options, app)
  : http.createServer(app);

// Create PostgreSQL pool
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@localhost:${5432}/${process.env.DB_NAME}`;
const pool = await createPool(connectionString);

async function testQuery() {
    try {
        const { rows } = await pool.query(sql.unsafe`SELECT 1 AS value`);
        if (rows[0]?.value === 1) {
            console.log('Connected to Postgres DB successfully.');
            // Initializing Task Manager
            initTaskManager(app, sql, pool);
        }
    } catch (error) {
        console.error('Error executing query:', error.message);
    }
}

testQuery();

const io = new Server(server, {
    cors: {
        origin: isProduction ? "https://isari.ai" : 'http://localhost:5000',
        methods: ["GET", "POST", "DELETE"]
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

function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Access denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid token' });
    }
}

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
        
        if(socket){
          socket.emit('updateWorkers', workers);
        }else{
          io.emit('updateWorkers', workers);
        }
        // console.log('Emitted worker information to all clients');
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

// Serve static files from the dist folder
if (isProduction) {
  const distPath = path.join(__dirname, '../..', 'dist');
  app.use(express.static(distPath));
}

app.get('/fetchWorkerOptions', fetchWorkerOptions);

// New route for creating a worker
app.post('/createWorker', upload.single('profilePic'), async (req, res) => {
    console.log('createWorker called');

    const { fullName, email, password, programmingLanguagesIds, generalizedAiBranches, specializedAiApplicationsIds, aiToolsIds } = req.body;
    const profilePic = req.file;

    console.log('fullName:', fullName);
    console.log('email:', email);
    console.log('profilePic:', profilePic);

    let profilePicUrl = '';

    try {
        // Ensure fullName and email are defined and strings
        if (!fullName || typeof fullName !== 'string') {
            throw new Error('Invalid fullName');
        }
        if (!email || typeof email !== 'string') {
            throw new Error('Invalid email');
        }

        // Generate salt and hash the password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password + salt, 10);

        // Insert user data into workers table
        const createWorkerQuery = sql.fragment`
            INSERT INTO workers (name, email, password, salt, github_url, profile_picture_url, wallet_address)
            VALUES (${fullName}, ${email}, ${hashedPassword}, ${salt}, '', ${''}, '')
            RETURNING id
        `;

        const result = await pool.one(createWorkerQuery);
        const workerId = result.id;

        // If profile picture is provided, rename the file and update the worker record
        if (profilePic) {
            const sanitizedFullName = fullName.replace(/\s+/g, '-').toLowerCase();
            profilePicUrl = `${workerId}-${sanitizedFullName}${extname(profilePic.originalname)}`;
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

        // Generate a token for the newly created worker
        const token = jwt.sign({ id: workerId, email: email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax' });

        res.json({
            success: true,
            message: 'Worker created successfully',
            workerId,
            user: {
                id: workerId,
                name: fullName,
                profile_picture_url: profilePicUrl,
                programming_languages: JSON.parse(programmingLanguagesIds),
                generalized_ai_branches: JSON.parse(generalizedAiBranches),
                specialized_ai_applications: JSON.parse(specializedAiApplicationsIds),
                ai_tools: JSON.parse(aiToolsIds)
            }
        });
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

app.post('/updateWorker', upload.none(), async (req, res) => {
    console.log('updateWorker called');

    const { workerId, programmingLanguagesIds, generalizedAiBranches, specializedAiApplicationsIds, aiToolsIds } = req.body;

    console.log('programmingLanguagesIds is -> ', programmingLanguagesIds);
    console.log('workerId is -> ', workerId);

    try {
        // Ensure workerId is defined and a number
        if (!workerId || isNaN(workerId)) {
            throw new Error('Invalid workerId');
        }

        // Utility function to update relational data
        const updateRelationalData = async (tableName, workerId, ids, columnName) => {
            console.log(`Updating ${tableName} for worker ${workerId}:`, ids);

            // Delete existing entries for the worker
            const deleteQuery = sql.fragment`
                DELETE FROM ${sql.identifier([tableName])}
                WHERE worker_id = ${workerId}
            `;
            await pool.query(deleteQuery);

            // Insert new entries
            for (const id of ids) {
                const insertQuery = sql.fragment`
                    INSERT INTO ${sql.identifier([tableName])} (worker_id, ${sql.identifier([columnName])})
                    VALUES (${workerId}, ${id})
                `;
                await pool.query(insertQuery);
            }
        };

        await updateRelationalData('worker_programming_languages', workerId, JSON.parse(programmingLanguagesIds), 'programming_language_id');
        await updateRelationalData('worker_generalized_ai_branches', workerId, JSON.parse(generalizedAiBranches), 'ai_branch_id');
        await updateRelationalData('worker_specialized_ai_applications', workerId, JSON.parse(specializedAiApplicationsIds), 'ai_application_id');
        await updateRelationalData('worker_ai_tools', workerId, JSON.parse(aiToolsIds), 'ai_tool_id');

        // Fetch the updated worker data
        const updatedWorkerQuery = sql.fragment`
            SELECT * FROM workers WHERE id = ${workerId}
        `;
        const updatedWorker = await pool.one(updatedWorkerQuery);

        console.log('Worker badges updated successfully');
        // Emit the updated information to the network if needed
        fetchAndEmitWorkerInfo();

        res.json({
            success: true,
            message: 'Worker badges updated successfully',
            updatedUser: {
                ...updatedWorker,
                programming_languages: JSON.parse(programmingLanguagesIds),
                generalized_ai_branches: JSON.parse(generalizedAiBranches),
                specialized_ai_applications: JSON.parse(specializedAiApplicationsIds),
                ai_tools: JSON.parse(aiToolsIds)
            }
        });
    } catch (error) {
        console.error('Error updating worker:', error.message);

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
    }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('/login endpoint called');

  try {
    // Query to get user details including password and salt
    const userResult = await pool.query(sql.fragment`SELECT id, email, name, password, salt FROM workers WHERE email = ${email}`);
    if (userResult.rowCount === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = userResult.rows[0];
    const isValidPassword = bcrypt.compareSync(password + user.salt, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Queries to get additional user information
    const programmingLanguagesResult = await pool.query(sql.fragment`SELECT programming_language_id FROM worker_programming_languages WHERE worker_id = ${user.id}`);
    const generalizedAiBranchesResult = await pool.query(sql.fragment`SELECT ai_branch_id FROM worker_generalized_ai_branches WHERE worker_id = ${user.id}`);
    const aiToolsResult = await pool.query(sql.fragment`SELECT ai_tool_id FROM worker_ai_tools WHERE worker_id = ${user.id}`);
    const specializedAiApplicationsResult = await pool.query(sql.fragment`SELECT ai_application_id FROM worker_specialized_ai_applications WHERE worker_id = ${user.id}`);

    // Extract IDs from query results
    const programmingLanguages = programmingLanguagesResult.rows.map(row => row.programming_language_id);
    const generalizedAiBranches = generalizedAiBranchesResult.rows.map(row => row.ai_branch_id);
    const aiTools = aiToolsResult.rows.map(row => row.ai_tool_id);
    const specializedAiApplications = specializedAiApplicationsResult.rows.map(row => row.ai_application_id);

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.cookie('token', token, { httpOnly: true, secure: isProduction === true, sameSite: isProduction === true ? 'none' : 'lax' });

    console.log('Setting cookie:', token);
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        profile_picture_url: `${user.id}-${user.name.toLowerCase().replace(/ /g, '-')}.png`,
        programming_languages: programmingLanguages,
        generalized_ai_branches: generalizedAiBranches,
        ai_tools: aiTools,
        specialized_ai_applications: specializedAiApplications
      }
    });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/logout', (req, res) => {
    res.cookie('token', '', { expires: new Date(0), httpOnly: true, secure: isProduction === true, sameSite: isProduction === true ? 'none' : 'lax'});
    res.json({ message: 'Logout successful' });
});

app.get('/verify-auth', async (req, res) => {
  const token = req.cookies.token;
  console.log('token is -> ', token);
  if (!token) {
    return res.json({ isAuthenticated: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Query to get user details
    const userResult = await pool.query(sql.fragment`SELECT id, email, name FROM workers WHERE id = ${userId}`);
    if (userResult.rowCount === 0) {
      return res.json({ isAuthenticated: false });
    }

    const user = userResult.rows[0];

    // Queries to get additional user information
    const programmingLanguagesResult = await pool.query(sql.fragment`SELECT programming_language_id FROM worker_programming_languages WHERE worker_id = ${user.id}`);
    const generalizedAiBranchesResult = await pool.query(sql.fragment`SELECT ai_branch_id FROM worker_generalized_ai_branches WHERE worker_id = ${user.id}`);
    const aiToolsResult = await pool.query(sql.fragment`SELECT ai_tool_id FROM worker_ai_tools WHERE worker_id = ${user.id}`);
    const specializedAiApplicationsResult = await pool.query(sql.fragment`SELECT ai_application_id FROM worker_specialized_ai_applications WHERE worker_id = ${user.id}`);

    // Extract IDs from query results
    const programmingLanguages = programmingLanguagesResult.rows.map(row => row.programming_language_id);
    const generalizedAiBranches = generalizedAiBranchesResult.rows.map(row => row.ai_branch_id);
    const aiTools = aiToolsResult.rows.map(row => row.ai_tool_id);
    const specializedAiApplications = specializedAiApplicationsResult.rows.map(row => row.ai_application_id);

    res.json({
      isAuthenticated: true,
      user: {
        id: user.id,
        name: user.name,
        profile_picture_url: `${user.id}-${user.name.toLowerCase().replace(/ /g, '-')}.png`,
        programming_languages: programmingLanguages,
        generalized_ai_branches: generalizedAiBranches,
        ai_tools: aiTools,
        specialized_ai_applications: specializedAiApplications
      }
    });
  } catch (error) {
    console.error('Error verifying token:', error.message);
    res.json({ isAuthenticated: false });
  }
});

app.delete('/deleteWorker/:id', authenticateToken, async (req, res) => {
    const workerId = req.params.id;
    const { name } = req.body;

    try {
        // Delete related data from relational tables
        const deleteRelatedData = async (tableName, columnName) => {
            const deleteQuery = sql.fragment`
                DELETE FROM ${sql.identifier([tableName])}
                WHERE ${sql.identifier([columnName])} = ${workerId}
            `;
            await pool.query(deleteQuery);
        };

        await deleteRelatedData('worker_programming_languages', 'worker_id');
        await deleteRelatedData('worker_generalized_ai_branches', 'worker_id');
        await deleteRelatedData('worker_specialized_ai_applications', 'worker_id');
        await deleteRelatedData('worker_ai_tools', 'worker_id');

        // Delete the worker record
        const deleteWorkerQuery = sql.fragment`
            DELETE FROM workers
            WHERE id = ${workerId}
        `;
        await pool.query(deleteWorkerQuery);

        // Remove profile picture file if it exists
        const profilePicPath = join(__dirname, 'uploads', `${workerId}-${name.toLowerCase().replace(/ /g, '-')}.png`);
        if (fs.existsSync(profilePicPath)) {
            fs.unlinkSync(profilePicPath);
        }

        console.log(`Worker with ID ${workerId} deleted successfully`);

        // Emit the updated worker information to all clients
        fetchAndEmitWorkerInfo();

        res.json({ success: true, message: 'Worker deleted successfully' });
    } catch (error) {
        console.error('Error deleting worker:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// New route for creating a worker
app.post('/submitIssue', async (req, res) => {
    console.log('submitIssue called: ', req.body);

    const { issueTitle, issueContext, usageKey } = req.body;

    // First, we validate the usageKey
    // On this, we first validate if it exist
    const getUsageKeyQuery = sql.fragment`SELECT * FROM usage_keys WHERE key = ${usageKey}`;
    const getUsageKeyResult = await pool.query(getUsageKeyQuery);

    if(getUsageKeyResult.rows.length > 0){
        // We found a key!
        // Now we check it's validity
        console.log('key: ', getUsageKeyResult.rows[0]);
        const key = getUsageKeyResult.rows[0];

        if(key.used){
            // The key is used, but is it a master key
            if(key.type === 'master'){
                // If it is, we disregard the used rule and proceed with the task
                const insertUserInputQuery = sql.fragment`
                INSERT INTO user_inputs (issue_title, issue_context)
                VALUES (
                    ${issueTitle},
                    ${issueContext}
                );
                `;
                await pool.query(insertUserInputQuery);
    
                // After we do this, remember to update the used field on the key
                const updateKeyQuery = sql.fragment`
                UPDATE usage_keys
                SET used = true
                WHERE key = ${key.key};
                `;
                await pool.query(updateKeyQuery);

                // After this is done, we notify the user that the insert was done successfully
                const message = 'Data was inserted successfully'
                res.json({ success: true, message });
            } else {
                // It means it's a single-use and has be used already
                // So the user gets an error
                const message = 'Usage key was already used';
                console.log(message)
                res.json({ success: false, message });
            }
        }else{
            // The key is not used, and can be used, wether it's a master key or not
            // Proceed with the task of inserting the data into the user_inputs table
            const insertUserInputQuery = sql.fragment`
            INSERT INTO user_inputs (issue_title, issue_context)
            VALUES (
                ${issueTitle},
                ${issueContext}
            );
            `;
            await pool.query(insertUserInputQuery);

            // After we do this, remember to update the used field on the key
            const updateKeyQuery = sql.fragment`
            UPDATE usage_keys
            SET used = true
            WHERE key = ${key.key};
            `;
            await pool.query(updateKeyQuery);

            // After this is done, we notify the user that the insert was done successfully
            const message = 'Data was inserted successfully'
            res.json({ success: true, message });
        }

    } else {
        // We did not find a key and we return an error
        const message = 'Usage key was not found';
        console.log(message)
        res.json({ success: false, message });
        return
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

if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '../..', 'dist');
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

server.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});
