# Lab 4: Registration, Login and JWT

**Name:** Yuvatej
**Registration number:** 252U1R6091
**Class and section:** AIML-2B
**Live deployment:** Not deployed

## Run locally

Requirements: Node.js 18 or newer and npm.

```powershell
npm install
npm start
```

The server listens on port `3000` by default and creates
`database/users.db` on startup. Optional environment variables are `PORT` and
`DB_PATH`. The JWT secret is a local practice constant in `server.js`; replace
it with a private environment variable before any public deployment.

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/` | Confirms that the API is running. |
| POST | `/register/` | Validates and creates a user with a bcrypt password hash. |
| POST | `/login/` | Verifies credentials and returns a signed JWT. |

Send JSON bodies with `Content-Type: application/json`.

## Screenshots to add

Save evidence in `screenshots/` and embed each image below after capturing it.

| File | Evidence |
|---|---|
| `01_server_running.png` | Terminal showing SQLite connected and server started. |
| `02_home_route.png` | `GET /` returning `200 OK`. |
| `03_register_success.png` | `POST /register/` returning `201 Created`. |
| `04_register_duplicate.png` | Duplicate username returning `400 Bad Request`. |
| `05_register_validation.png` | Missing registration field returning `400 Bad Request`. |
| `06_login_success.png` | Valid login returning `200 OK` and `jwt_token`. |
| `07_login_unknown_user.png` | Unknown username returning `400 Bad Request`. |
| `08_login_wrong_password.png` | Incorrect password returning `400 Bad Request`. |
| `09_database_hash.png` | SQLite user row showing a bcrypt hash, not the password. |
| `10_jwt_decode.png` | jwt.io showing the token header and username payload. |

Never include a real password or an unmasked JWT in screenshots. Add the
captured images to the README with Markdown image links before submitting.

## Notes

Passwords are hashed with bcrypt before storage. SQL statements use
parameterized values. The JWT contains the username and an expiration time; it
does not contain a password.
