# Lab 3: REST API, query parameters, validation, debugging

**Name:** Gunturu Yuvatej
**Registration number:** 252U1R6091
**Section:** AIML 2B

## Live link
https://YOUR-LAB-03-NAME.onrender.com

## Objective
Turn the books routes into a clean REST API with search, sorting, price filter, pagination, validation and correct status codes.

## How to install and run
```bash
npm install
npm start
```
Open `http://localhost:3000/books`. No environment variables are required (`PORT` is optional and defaults to 3000). The SQLite database `books.db` is created and filled with sample books automatically on the first run.

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/books` | List books with search, sort, price filter and pagination |
| GET | `/books/:bookId` | Get one book |
| POST | `/books` | Create a book |
| PUT | `/books/:bookId` | Update a book |
| DELETE | `/books/:bookId` | Delete a book |

### Query parameters for GET /books

| Parameter | Meaning | Default |
|---|---|---|
| `search_q` | Partial title match (LIKE) | empty (all books) |
| `order_by` | `id`, `title`, `author` or `price` | `id` |
| `order` | `ASC` or `DESC` | `ASC` |
| `limit` | Number of books, 1 to 100 | 10 |
| `offset` | Books to skip | 0 |
| `min_price` | Lowest price (BETWEEN) | 0 |
| `max_price` | Highest price (BETWEEN) | 1000000 |

### POST / PUT body
```json
{ "title": "Test Book", "author": "Test Author", "price": 250 }
```

### Status codes

| Status | When |
|---|---|
| 200 | Successful GET, PUT or DELETE |
| 201 | Book created |
| 400 | Bad input (missing title/author, non-numeric price, bad query value, bad id, invalid JSON) |
| 404 | Book id does not exist, or unknown route |
| 500 | Unexpected server error |

Errors always look like `{ "message": "..." }`.

## Postman test list

| # | Request | Expected | Screenshot |
|---|---|---|---|
| 1 | GET `/books` | 200, list of books | `01-get-all-books.png` |
| 2 | GET `/books?search_q=rich` | 200, titles containing "rich" | `02-search.png` |
| 3 | GET `/books?order_by=price&order=DESC` | 200, highest price first | `03-sort-price-desc.png` |
| 4 | GET `/books?min_price=300&max_price=500` | 200, prices 300 to 500 | `04-price-range.png` |
| 5 | GET `/books?limit=3&offset=3` | 200, 3 books, skipping first 3 | `05-pagination.png` |
| 6 | GET `/books/9999` | 404, Book not found | `06-get-one-404.png` |
| 7 | POST `/books` with valid body | 201, new book | `07-post-201.png` |
| 8 | POST `/books` with no title and price "abc" | 400, message | `08-post-400.png` |
| 9 | PUT `/books/1` with valid body | 200, updated book | `09-put-200.png` |
| 10 | DELETE `/books/1` | 200, Book deleted successfully | `10-delete-200.png` |

## Screenshots

### 1. GET /books (200)
![GET all books](screenshots/01-get-all-books.png)

### 2. Search by title (200)
![Search](screenshots/02-search.png)

### 3. Sort by price descending (200)
![Sort](screenshots/03-sort-price-desc.png)

### 4. Price range filter (200)
![Price range](screenshots/04-price-range.png)

### 5. Pagination (200)
![Pagination](screenshots/05-pagination.png)

### 6. Book not found (404)
![Not found](screenshots/06-get-one-404.png)

### 7. POST create (201)
![POST 201](screenshots/07-post-201.png)

### 8. POST validation error (400)
![POST 400](screenshots/08-post-400.png)

### 9. PUT update (200)
![PUT 200](screenshots/09-put-200.png)

### 10. DELETE (200)
![DELETE 200](screenshots/10-delete-200.png)

## Notes
- All user values go into SQL through `?` placeholders. `order_by` is checked against a fixed list of columns because a column name cannot be a placeholder.
- Debugging exercise: (write the 4 bugs you fixed: EADDRINUSE port conflict, wrong import path, table-name typo "no such table", missing await, and how you fixed each)
- Problem faced: (write one real problem and how you solved it)
