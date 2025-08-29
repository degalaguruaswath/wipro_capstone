# Banking Backend (FastAPI + SQLite) with API Gateway & Docker

This project provides a **microservices** backend for your Angular banking frontend.

Services:
- **api-gateway** (port 8080): single entry point, routes to microservices and validates JWT (when needed).
- **auth-service** (port 8001): user registration/login, JWT issuing, user profile.
- **account-service** (port 8002): open/update/get accounts, stores balances.
- **transaction-service** (port 8003): deposits/withdrawals/transfers, records transactions and updates account-service.

## Quick start

```bash
docker compose up --build
```

Once up:
- Gateway OpenAPI: http://localhost:8080/docs
- Auth service docs: http://localhost:8001/docs
- Account service docs: http://localhost:8002/docs
- Transaction service docs: http://localhost:8003/docs

> Your Angular frontend should call the **gateway** base URL, for example:
> - `POST /api/auth/register`
> - `POST /api/auth/login`
> - `GET  /api/auth/me` (Authorization: Bearer <token>)
> - `POST /api/accounts`
> - `GET  /api/accounts/{account_no}`
> - `PATCH /api/accounts/{account_no}`
> - `POST /api/transactions/deposit|withdraw|transfer`
> - `GET  /api/transactions?account_no=XXXX`

### Environment

- The gateway and services accept CORS from `*` by default. You can restrict it via `CORS_ORIGINS` env var.
- JWT secret is set via `JWT_SECRET` in `docker-compose.yml`. **Change this for production.**

### Data persistence

Each service uses its own SQLite DB file persisted as a Docker volume:
- `auth.db`, `accounts.db`, `transactions.db`

### Notes

- Passwords are hashed with `passlib[bcrypt]`.
- JWT uses HS256 via `PyJWT`.
- Transaction-service calls account-service over the internal Docker network to update balances.
- API Gateway forwards requests to services with `httpx` and does light auth verification for protected routes.
