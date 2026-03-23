import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import { Server } from 'socket.io';
import { createServer } from 'http';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Database connection (Neon DB)
  const { Pool } = pg;
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  // Initialize Database Schema
  const initDb = async () => {
    try {
      await pool.query(`
        CREATE EXTENSION IF NOT EXISTS postgis;

        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          phone TEXT UNIQUE NOT NULL,
          name TEXT,
          role TEXT DEFAULT 'client',
          is_worker_verified BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS workers (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          skills TEXT[],
          rating DECIMAL(3,2) DEFAULT 0,
          jobs_completed INTEGER DEFAULT 0,
          online_status BOOLEAN DEFAULT false,
          location GEOGRAPHY(POINT, 4326),
          last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          icon TEXT,
          color TEXT
        );

        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          sender_id TEXT NOT NULL,
          receiver_id TEXT NOT NULL,
          content TEXT NOT NULL,
          is_estimate BOOLEAN DEFAULT false,
          estimate_amount TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS jobs (
          id SERIAL PRIMARY KEY,
          client_id TEXT NOT NULL,
          worker_id TEXT NOT NULL,
          client_name TEXT,
          worker_name TEXT,
          status TEXT DEFAULT 'pending',
          price DECIMAL(10,2),
          category TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS reviews (
          id SERIAL PRIMARY KEY,
          job_id INTEGER REFERENCES jobs(id),
          worker_id TEXT NOT NULL,
          client_id TEXT NOT NULL,
          rating INTEGER NOT NULL,
          comment TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Seed categories if empty
        INSERT INTO categories (name, icon, color)
        VALUES 
          ('Electrician', '⚡', 'bg-[#F59E0B]/10 text-[#F59E0B]'),
          ('Plumber', '🚰', 'bg-[#6366F1]/10 text-[#6366F1]'),
          ('Painter', '🎨', 'bg-[#F59E0B]/10 text-[#F59E0B]'),
          ('Satellite', '📡', 'bg-[#6366F1]/10 text-[#6366F1]')
        ON CONFLICT (name) DO NOTHING;

        -- Seed dummy users and workers if empty
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM users LIMIT 1) THEN
            INSERT INTO users (phone, name, role, is_worker_verified)
            VALUES 
              ('+251911111111', 'Abebe Kebede', 'worker', true),
              ('+251922222222', 'Marta Tesfaye', 'worker', true),
              ('+251933333333', 'Samuel Desta', 'worker', true);

            INSERT INTO workers (user_id, skills, rating, jobs_completed, online_status, location)
            VALUES 
              (1, ARRAY['Electrician'], 4.9, 124, true, ST_MakePoint(41.8661, 9.5917)::geography),
              (2, ARRAY['Painter', 'Plumber'], 4.8, 89, false, ST_MakePoint(41.8700, 9.5950)::geography),
              (3, ARRAY['Satellite'], 4.7, 210, true, ST_MakePoint(41.8600, 9.5850)::geography);
          END IF;
        END $$;
      `);
      console.log('Database initialized successfully');
    } catch (err) {
      console.error('Database initialization error:', err);
    }
  };

  initDb();

  // Message Filtering Logic
  const filterMessage = (content: string) => {
    // Regex for phone numbers (Ethiopian and general)
    const phoneRegex = /(\+251|0)(9|7)\d{8}/g;
    const generalPhoneRegex = /\b\d{10,}\b/g;
    // Regex for links
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-z]{2,})/gi;

    let filtered = content;
    let blocked = false;

    if (phoneRegex.test(content) || generalPhoneRegex.test(content) || urlRegex.test(content)) {
      filtered = "[Message blocked: Sharing contact info or links is restricted until a job is started]";
      blocked = true;
    }

    return { filtered, blocked };
  };

  // Socket.io Logic
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    });

    socket.on('send_message', async (data) => {
      const { senderId, receiverId, content, isEstimate, estimateAmount } = data;
      
      const { filtered, blocked } = filterMessage(content);

      const messageData = {
        senderId,
        receiverId,
        content: filtered,
        isEstimate,
        estimateAmount,
        createdAt: new Date(),
        blocked
      };

      // Save to DB (optional, but good for persistence)
      try {
        await pool.query(
          'INSERT INTO messages (sender_id, receiver_id, content, is_estimate, estimate_amount) VALUES ($1, $2, $3, $4, $5)',
          [senderId, receiverId, filtered, isEstimate, estimateAmount]
        );
      } catch (err) {
        console.error('Error saving message:', err);
      }

      // Emit to both sender and receiver
      io.to(senderId).emit('receive_message', messageData);
      io.to(receiverId).emit('receive_message', messageData);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'SkillLink Backend is running' });
  });

  // Fetch Categories
  app.get('/api/categories', async (req, res) => {
    const mockCategories = [
      { id: 1, name: 'Electrician', icon: '⚡', color: 'bg-[#F59E0B]/10 text-[#F59E0B]' },
      { id: 2, name: 'Plumber', icon: '🚰', color: 'bg-[#6366F1]/10 text-[#6366F1]' },
      { id: 3, name: 'Painter', icon: '🎨', color: 'bg-[#F59E0B]/10 text-[#F59E0B]' },
      { id: 4, name: 'Satellite', icon: '📡', color: 'bg-[#6366F1]/10 text-[#6366F1]' }
    ];

    if (!process.env.DATABASE_URL) {
      return res.json(mockCategories);
    }

    try {
      const result = await pool.query('SELECT * FROM categories');
      if (result.rows.length === 0) return res.json(mockCategories);
      res.json(result.rows);
    } catch (err) {
      res.json(mockCategories);
    }
  });

  // Search Workers
  app.get('/api/workers/search', async (req, res) => {
    const { lat, lng, category, maxDistance = 5000000 } = req.query; // Increased to 5000km for testing
    
    // Mock data for testing if DB fails or is empty
    const mockWorkers = [
      { id: 101, name: 'Abebe Kebede', skills: ['Electrician'], rating: 4.9, jobs_completed: 124, online_status: true, distance: 1200 },
      { id: 102, name: 'Marta Tesfaye', skills: ['Painter', 'Plumber'], rating: 4.8, jobs_completed: 89, online_status: false, distance: 2500 },
      { id: 103, name: 'Samuel Desta', skills: ['Satellite'], rating: 4.7, jobs_completed: 210, online_status: true, distance: 3800 },
    ];

    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL not found. Using mock data.');
      return res.json(mockWorkers.filter(w => !category || w.skills.includes(category as string)));
    }
    
    try {
      let query = `
        SELECT 
          w.*, 
          u.name, 
          ST_Distance(w.location, ST_MakePoint($1, $2)::geography) as distance
        FROM workers w
        JOIN users u ON w.user_id = u.id
        WHERE ST_DWithin(w.location, ST_MakePoint($1, $2)::geography, $3)
      `;
      
      const params = [lng, lat, maxDistance];
      
      if (category) {
        query += ` AND $4 = ANY(w.skills)`;
        params.push(category);
      }
      
      query += ` ORDER BY distance ASC`;
      
      const result = await pool.query(query, params);
      
      if (result.rows.length === 0) {
        // If no real workers found in DB, return mock data for better demo experience
        return res.json(mockWorkers.filter(w => !category || w.skills.includes(category as string)));
      }

      res.json(result.rows);
    } catch (err) {
      console.error('Search error, falling back to mock data:', err);
      res.json(mockWorkers.filter(w => !category || w.skills.includes(category as string)));
    }
  });

  // Update Worker Location/Status
  app.post('/api/worker/status', async (req, res) => {
    const { userId, lat, lng, onlineStatus } = req.body;
    try {
      await pool.query(`
        UPDATE workers 
        SET 
          location = ST_MakePoint($2, $3)::geography,
          online_status = $4,
          last_active = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `, [userId, lng, lat, onlineStatus]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update status' });
    }
  });

  // Create Job
  app.post('/api/jobs', async (req, res) => {
    const { clientId, workerId, clientName, workerName, price, category } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO jobs (client_id, worker_id, client_name, worker_name, price, category, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [clientId, workerId, clientName, workerName, price, category, 'accepted']
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create job' });
    }
  });

  // Update Job Status
  app.patch('/api/jobs/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const completedAt = status === 'completed' ? new Date() : null;
      const query = completedAt 
        ? 'UPDATE jobs SET status = $1, completed_at = $2 WHERE id = $3 RETURNING *'
        : 'UPDATE jobs SET status = $1 WHERE id = $2 RETURNING *';
      const params = completedAt ? [status, completedAt, id] : [status, id];
      
      const result = await pool.query(query, params);
      
      if (status === 'completed') {
        const job = result.rows[0];
        await pool.query('UPDATE workers SET jobs_completed = jobs_completed + 1 WHERE user_id = $1', [job.worker_id]);
      }
      
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update job status' });
    }
  });

  // Get User Jobs
  app.get('/api/jobs/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      const result = await pool.query(
        'SELECT * FROM jobs WHERE client_id = $1 OR worker_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  });

  // Submit Review
  app.post('/api/reviews', async (req, res) => {
    const { jobId, workerId, clientId, rating, comment } = req.body;
    try {
      await pool.query(
        'INSERT INTO reviews (job_id, worker_id, client_id, rating, comment) VALUES ($1, $2, $3, $4, $5)',
        [jobId, workerId, clientId, rating, comment]
      );
      
      // Update worker average rating
      await pool.query(`
        UPDATE workers 
        SET rating = (
          SELECT AVG(rating) FROM reviews WHERE worker_id = $1
        )
        WHERE user_id = $1
      `, [workerId]);
      
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to submit review' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
});
