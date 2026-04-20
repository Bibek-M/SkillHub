import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { pool } from "./db.js";
import { requireAuth, requireRole, signToken } from "./auth.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173"],
    credentials: false,
  }),
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/signup", async (req, res) => {
  const { username, email, password, role } = req.body ?? {};
  if (!username || !email || !password || password.length < 6) {
    return res.status(400).json({ message: "Invalid signup payload" });
  }

  const validRoles = ['student', 'admin'];
  const userRole = validRoles.includes(role) ? role : 'student';

  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, role, avatar_url, created_at`,
      [username.trim(), email.trim().toLowerCase(), hash, userRole],
    );
    const user = rows[0];
    const token = signToken(user);
    return res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Email or username already exists" });
    }
    return res.status(500).json({ message: "Signup failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

  const { rows } = await pool.query(
    "SELECT id, username, email, role, avatar_url, password_hash, created_at FROM users WHERE email = $1",
    [email.trim().toLowerCase()],
  );
  const user = rows[0];
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(user);
  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
    },
  });
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, username, email, role, created_at, avatar_url FROM users WHERE id = $1",
    [req.user.id],
  );
  const user = rows[0];
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ user });
});

app.get("/api/users", requireAuth, requireRole("admin"), async (_req, res) => {
  const { rows } = await pool.query(
    "SELECT id, username, role, created_at FROM users ORDER BY created_at DESC",
  );
  return res.json({ users: rows });
});

app.delete("/api/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const userId = req.params.id;
  // Prevent admin from deleting themselves
  if (userId === req.user.id) {
    return res.status(400).json({ message: "Cannot delete your own account" });
  }
  const { rows } = await pool.query("SELECT id, username, role FROM users WHERE id = $1", [userId]);
  if (!rows.length) {
    return res.status(404).json({ message: "User not found" });
  }
  await pool.query("DELETE FROM users WHERE id = $1", [userId]);
  return res.status(204).send();
});

app.get("/api/skills", async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT s.id, s.user_id, s.title, s.description, s.category, s.created_at, s.updated_at, u.username
     FROM skills s
     JOIN users u ON u.id = s.user_id
     ORDER BY s.created_at DESC`,
  );
  return res.json({ skills: rows });
});

app.post("/api/skills", requireAuth, async (req, res) => {
  const { title, description, category } = req.body ?? {};
  if (!title || !description || !category) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const { rows } = await pool.query(
    `INSERT INTO skills (user_id, title, description, category)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, title, description, category, created_at, updated_at`,
    [req.user.id, title.trim(), description.trim(), category],
  );
  return res.status(201).json({ skill: rows[0] });
});

app.delete("/api/skills/:id", requireAuth, async (req, res) => {
  const skillId = req.params.id;
  const { rows } = await pool.query("SELECT id, user_id FROM skills WHERE id = $1", [skillId]);
  const skill = rows[0];
  if (!skill) return res.status(404).json({ message: "Skill not found" });
  if (skill.user_id !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  await pool.query("DELETE FROM skills WHERE id = $1", [skillId]);
  return res.status(204).send();
});

app.get("/api/messages/:otherUserId", requireAuth, async (req, res) => {
  const otherUserId = req.params.otherUserId;
  const { rows } = await pool.query(
    `SELECT id, sender_id, receiver_id, message, created_at
     FROM messages
     WHERE (sender_id = $1 AND receiver_id = $2)
        OR (sender_id = $2 AND receiver_id = $1)
     ORDER BY created_at ASC`,
    [req.user.id, otherUserId],
  );
  return res.json({ messages: rows });
});

app.post("/api/messages", requireAuth, async (req, res) => {
  const { receiver_id, message } = req.body ?? {};
  if (!receiver_id || !message?.trim()) {
    return res.status(400).json({ message: "receiver_id and message are required" });
  }
  const { rows } = await pool.query(
    `INSERT INTO messages (sender_id, receiver_id, message)
     VALUES ($1, $2, $3)
     RETURNING id, sender_id, receiver_id, message, created_at`,
    [req.user.id, receiver_id, message.trim()],
  );
  return res.status(201).json({ message: rows[0] });
});

app.get("/api/notifications", requireAuth, async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT id, message, sent_by, created_at
     FROM notifications
     ORDER BY created_at DESC
     LIMIT 20`,
  );
  return res.json({ notifications: rows });
});

app.post("/api/notifications", requireAuth, requireRole("admin"), async (req, res) => {
  const { message } = req.body ?? {};
  if (!message?.trim()) return res.status(400).json({ message: "Message is required" });
  const { rows } = await pool.query(
    `INSERT INTO notifications (message, sent_by)
     VALUES ($1, $2)
     RETURNING id, message, sent_by, created_at`,
    [message.trim(), req.user.id],
  );
  return res.status(201).json({ notification: rows[0] });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API server running on http://localhost:${port}`);
});
