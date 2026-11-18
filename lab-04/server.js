const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;
const databasePath =
  process.env.DB_PATH || path.join(__dirname, 'database', 'users.db');
const jwtSecret = 'lab-04-local-secret-change-before-deployment';

app.use(express.json());

let database;

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Lab 4 API: registration, login, and JWT authentication',
  });
});

app.post('/register/', async (req, res) => {
  const { username, name, password } = req.body || {};

  if (
    typeof username !== 'string' ||
    !username.trim() ||
    typeof name !== 'string' ||
    !name.trim() ||
    typeof password !== 'string' ||
    password.length === 0
  ) {
    return res.status(400).json({
      error: 'Username, name, and password are required',
    });
  }

  const cleanUsername = username.trim();
  const cleanName = name.trim();

  try {
    const existingUser = await database.get(
      'SELECT id FROM user WHERE username = ?',
      [cleanUsername]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await database.run(
      'INSERT INTO user (username, name, password) VALUES (?, ?, ?)',
      [cleanUsername, cleanName, passwordHash]
    );

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    if (
      error.code === 'SQLITE_CONSTRAINT' &&
      error.message.includes('user.username')
    ) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    console.error('Registration failed:', error.message);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/login/', async (req, res) => {
  const { username, password } = req.body || {};

  if (
    typeof username !== 'string' ||
    !username.trim() ||
    typeof password !== 'string' ||
    password.length === 0
  ) {
    return res.status(400).json({
      error: 'Username and password are required',
    });
  }

  try {
    const user = await database.get(
      'SELECT username, password FROM user WHERE username = ?',
      [username.trim()]
    );

    if (!user) {
      return res.status(400).json({ error: 'Invalid user' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ username: user.username }, jwtSecret, {
      expiresIn: '1h',
    });

    return res.status(200).json({ jwt_token: token });
  } catch (error) {
    console.error('Login failed:', error.message);
    return res.status(500).json({ error: 'Login failed' });
  }
});

async function startServer() {
  database = await open({
    filename: databasePath,
    driver: sqlite3.Database,
  });

  await database.exec(`
    CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL
    );
  `);

  console.log(`Connected to SQLite database at: ${databasePath}`);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error('Server startup failed:', error.message);
  process.exitCode = 1;
});
