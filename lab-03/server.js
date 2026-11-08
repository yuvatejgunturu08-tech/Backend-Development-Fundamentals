// Lab 3 - REST API with query parameters, validation and SQLite
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, 'books.db');

app.use(express.json());

let db = null;

// ---------- Helper: validate the body of POST and PUT ----------
// Returns an error message (string) or null when the body is valid.
const validateBook = (body) => {
  const { title, author, price } = body || {};

  if (typeof title !== 'string' || title.trim() === '') {
    return 'title is required and must be text';
  }
  if (typeof author !== 'string' || author.trim() === '') {
    return 'author is required and must be text';
  }
  if (
    price === undefined ||
    price === null ||
    price === '' ||
    typeof price === 'boolean' ||
    Number.isNaN(Number(price)) ||
    Number(price) < 0
  ) {
    return 'price is required and must be a number (0 or more)';
  }
  return null;
};

// ---------- Health check ----------
app.get('/', (request, response) => {
  response.status(200).json({ message: 'Books API is running' });
});

// ---------- GET /books : search, sort, filter, pagination ----------
app.get('/books', async (request, response) => {
  try {
    // Every query parameter has a default value
    const {
      search_q = '',
      order_by = 'id',
      order = 'ASC',
      limit = '10',
      offset = '0',
      min_price = '0',
      max_price = '1000000',
    } = request.query;

    // A column name cannot be a ? placeholder, so we only allow known names
    const allowedColumns = ['id', 'title', 'author', 'price'];
    if (!allowedColumns.includes(order_by)) {
      return response
        .status(400)
        .json({ message: 'order_by must be one of: id, title, author, price' });
    }

    const sortOrder = String(order).toUpperCase();
    if (sortOrder !== 'ASC' && sortOrder !== 'DESC') {
      return response.status(400).json({ message: 'order must be ASC or DESC' });
    }

    const pageLimit = Number(limit);
    const pageOffset = Number(offset);
    if (!Number.isInteger(pageLimit) || pageLimit < 1 || pageLimit > 100) {
      return response
        .status(400)
        .json({ message: 'limit must be a whole number from 1 to 100' });
    }
    if (!Number.isInteger(pageOffset) || pageOffset < 0) {
      return response
        .status(400)
        .json({ message: 'offset must be a whole number, 0 or more' });
    }

    const minPrice = Number(min_price);
    const maxPrice = Number(max_price);
    if (Number.isNaN(minPrice) || Number.isNaN(maxPrice)) {
      return response
        .status(400)
        .json({ message: 'min_price and max_price must be numbers' });
    }
    if (minPrice > maxPrice) {
      return response
        .status(400)
        .json({ message: 'min_price cannot be greater than max_price' });
    }

    // User values go in through ? placeholders (parameterised query)
    const sql = `
      SELECT * FROM book
      WHERE title LIKE ?
        AND price BETWEEN ? AND ?
      ORDER BY ${order_by} ${sortOrder}
      LIMIT ? OFFSET ?`;

    const books = await db.all(sql, [
      `%${search_q}%`,
      minPrice,
      maxPrice,
      pageLimit,
      pageOffset,
    ]);
    response.status(200).json(books);
  } catch (error) {
    console.error(error.message);
    response.status(500).json({ message: 'Could not get books' });
  }
});

// ---------- GET /books/:bookId : one book ----------
app.get('/books/:bookId', async (request, response) => {
  try {
    const bookId = Number(request.params.bookId);
    if (!Number.isInteger(bookId) || bookId < 1) {
      return response
        .status(400)
        .json({ message: 'bookId must be a positive whole number' });
    }

    const book = await db.get('SELECT * FROM book WHERE id = ?', [bookId]);
    if (!book) {
      return response.status(404).json({ message: 'Book not found' });
    }
    response.status(200).json(book);
  } catch (error) {
    console.error(error.message);
    response.status(500).json({ message: 'Could not get the book' });
  }
});

// ---------- POST /books : create a book ----------
app.post('/books', async (request, response) => {
  try {
    const problem = validateBook(request.body);
    if (problem) {
      return response.status(400).json({ message: problem });
    }

    const { title, author, price } = request.body;
    const result = await db.run(
      'INSERT INTO book (title, author, price) VALUES (?, ?, ?)',
      [title.trim(), author.trim(), Number(price)]
    );
    const newBook = await db.get('SELECT * FROM book WHERE id = ?', [
      result.lastID,
    ]);
    response.status(201).json(newBook);
  } catch (error) {
    console.error(error.message);
    response.status(500).json({ message: 'Could not create the book' });
  }
});

// ---------- PUT /books/:bookId : update a book ----------
app.put('/books/:bookId', async (request, response) => {
  try {
    const bookId = Number(request.params.bookId);
    if (!Number.isInteger(bookId) || bookId < 1) {
      return response
        .status(400)
        .json({ message: 'bookId must be a positive whole number' });
    }

    const problem = validateBook(request.body);
    if (problem) {
      return response.status(400).json({ message: problem });
    }

    const { title, author, price } = request.body;
    const result = await db.run(
      'UPDATE book SET title = ?, author = ?, price = ? WHERE id = ?',
      [title.trim(), author.trim(), Number(price), bookId]
    );
    if (result.changes === 0) {
      return response.status(404).json({ message: 'Book not found' });
    }

    const updatedBook = await db.get('SELECT * FROM book WHERE id = ?', [
      bookId,
    ]);
    response.status(200).json(updatedBook);
  } catch (error) {
    console.error(error.message);
    response.status(500).json({ message: 'Could not update the book' });
  }
});

// ---------- DELETE /books/:bookId : delete a book ----------
app.delete('/books/:bookId', async (request, response) => {
  try {
    const bookId = Number(request.params.bookId);
    if (!Number.isInteger(bookId) || bookId < 1) {
      return response
        .status(400)
        .json({ message: 'bookId must be a positive whole number' });
    }

    const result = await db.run('DELETE FROM book WHERE id = ?', [bookId]);
    if (result.changes === 0) {
      return response.status(404).json({ message: 'Book not found' });
    }
    response.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error(error.message);
    response.status(500).json({ message: 'Could not delete the book' });
  }
});

// ---------- Unknown routes ----------
app.use((request, response) => {
  response.status(404).json({ message: 'Route not found' });
});

// ---------- Bad JSON in the request body ----------
app.use((error, request, response, next) => {
  if (error.type === 'entity.parse.failed') {
    return response
      .status(400)
      .json({ message: 'Request body is not valid JSON' });
  }
  console.error(error.message);
  response.status(500).json({ message: 'Something went wrong' });
});

// ---------- Connect to the database, then start the server ----------
const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price REAL NOT NULL
      )`);

    // Fill the table with sample books the first time only
    const { total } = await db.get('SELECT COUNT(*) AS total FROM book');
    if (total === 0) {
      const sampleBooks = [
        ['The Alchemist', 'Paulo Coelho', 299],
        ['Wings of Fire', 'A. P. J. Abdul Kalam', 250],
        ['Atomic Habits', 'James Clear', 499],
        ['The Hobbit', 'J. R. R. Tolkien', 399],
        ['Ikigai', 'Hector Garcia', 299],
        ['The Guide', 'R. K. Narayan', 220],
        ['Deep Work', 'Cal Newport', 450],
        ['Sapiens', 'Yuval Noah Harari', 599],
        ['Train to Pakistan', 'Khushwant Singh', 275],
        ['Ponniyin Selvan', 'Kalki Krishnamurthy', 550],
        ['Rich Dad Poor Dad', 'Robert Kiyosaki', 350],
        ['The Psychology of Money', 'Morgan Housel', 380],
      ];
      for (const [title, author, price] of sampleBooks) {
        await db.run(
          'INSERT INTO book (title, author, price) VALUES (?, ?, ?)',
          [title, author, price]
        );
      }
    }

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Database error:', error.message);
    process.exit(1);
  }
};

initializeDBAndServer();
