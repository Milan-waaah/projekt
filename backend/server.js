const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const db = new sqlite3.Database('./CalenGODB.db');
const app = express();



app.use(express.json());
app.use(cors());

// DB CONNECT


// TEST ROUTE
app.get('/', (req, res) => {
  res.send('CalenGo backend running');
});


db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      trainerId INTEGER,
      date TEXT,
      time TEXT,
      status TEXT,
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(trainerId) REFERENCES users(id)
    )
  `);
  db.run(`
  INSERT OR IGNORE INTO users (id, name, email, password, role)
  VALUES (1, 'Admin', 'admin@calengo.com', 'admin123', 'admin')
`);
});


//regiosztracio
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;

  db.run(
    `INSERT INTO users (name, email, password, role)
     VALUES (?, ?, ?, 'user')`,
    [name, email, password],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      res.json({ message: 'User created' });
    }
  );
});


//login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.get(
    `SELECT * FROM users WHERE email = ? AND password = ?`,
    [email, password],
    (err, user) => {
      if (!user) {
        return res.status(401).json({ error: 'Invalid login' });
      }

      res.json({
        id: user.id,
        name: user.name,
        role: user.role
      });
    }
  );
});

//idopont foglalas
app.post('/api/book', (req, res) => {
  const { userId, trainerId, date, time } = req.body;

  db.get(
    `SELECT * FROM bookings
     WHERE trainerId = ? AND date = ? AND time = ? AND status = 'confirmed'`,
    [trainerId, date, time],
    (err, row) => {
      if (row) {
        return res.status(400).json({ error: 'Time already booked' });
      }

      db.run(
        `INSERT INTO bookings (userId, trainerId, date, time, status)
         VALUES (?, ?, ?, ?, 'confirmed')`,
        [userId, trainerId, date, time],
        function(err) {
          if (err) return res.status(500).json({ error: 'DB error' });
          res.json({ message: 'Booked' });
        }
      );
    }
  );
});

//foglalas lekeres usernek
app.get('/api/my-bookings/:userId', (req, res) => {
  const { userId } = req.params;

  db.all(
    `SELECT bookings.*, users.name as trainerName
     FROM bookings
     JOIN users ON users.id = bookings.trainerId
     WHERE bookings.userId = ?`,
    [userId],
    (err, rows) => {
      res.json(rows);
    }
  );
});

//foglalas lekeres trainernek
app.get('/api/trainer-bookings/:trainerId', (req, res) => {
  const { trainerId } = req.params;

  db.all(
    `SELECT * FROM bookings WHERE trainerId = ?`,
    [trainerId],
    (err, rows) => {
      res.json(rows);
    }
  );
});

//foglalas torlese
app.put('/api/cancel/:id', (req, res) => {
  const { id } = req.params;

  db.run(
    `UPDATE bookings SET status = 'cancelled' WHERE id = ?`,
    [id],
    () => res.json({ message: 'Cancelled' })
  );
});

//admin/szerepkor modositas
app.delete('/api/booking/:id', (req, res) => {
  db.run(
    `DELETE FROM bookings WHERE id=?`,
    [req.params.id],
    () => res.json({ success: true })
  );
});

//minden user lekerese
app.get('/api/users', (req, res) => {
  db.all(`SELECT id, name, email, role FROM users`,
    (err, rows) => res.json(rows)
  );
});

//------------------SZEERVER FUTTATAS------------------//
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
//------------------SZEERVER FUTTATAS------------------//
