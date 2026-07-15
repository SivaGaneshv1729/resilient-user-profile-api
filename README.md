# Resilient User Profile Management API

This project provides a highly resilient User Profile Management API implementing advanced architectural patterns including the Repository Pattern, Unit of Work, Circuit Breaker, and Retry Pattern.

## Features
- **CRUD Operations**: Create, Read, Update, Delete user profiles.
- **Data Enrichment**: Integrates with a mock external service to fetch additional user data (e.g., loyalty score, activity).
- **Resilience**: 
  - **Retry Pattern**: Uses exponential backoff to handle transient network errors.
  - **Circuit Breaker**: Implemented with `opossum` to fail fast when the external service is persistently down.
- **Architectural Patterns**:
  - **Repository Pattern**: Abstracts MySQL operations.
  - **Unit of Work**: Ensures atomic transactions when saving data.
- **Dockerized**: Easy "one command" setup via Docker Compose.

## Setup Instructions

1. Clone or navigate to this directory.
2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```
3. Boot the environment:
   ```bash
   docker-compose up -d --build
   ```
4. The API will be available at `http://localhost:8080`.
   - The MySQL database is on `3307`.
   - The Mock Service is on `8081`.

## Testing

To run the unit and integration tests:
```bash
npm install
npm test
```
*(You can also run tests inside the container using `docker-compose exec app npm test`)*

## API Endpoints

### 1. Create User
`POST /api/users`
**Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

### 2. Get User
`GET /api/users/:id`

### 3. Update User
`PUT /api/users/:id`
**Request Body**:
```json
{
  "name": "Jane Smith"
}
```

### 4. Delete User
`DELETE /api/users/:id`

### 5. Get Enriched User
`GET /api/users/:id/enriched`
Attempts to fetch user data + external data. If the external service fails persistently, the circuit breaker opens and returns a graceful fallback.

## Architectural Decisions
- **Repository Pattern**: `IUserRepository` defines the interface, and `MySQLUserRepository` implements it. This abstracts away the `mysql2` driver from the `UserService`.
- **Unit of Work**: `MySQLUnitOfWork` handles `startTransaction`, `commit`, and `rollback`, ensuring operations are atomic.
- **Circuit Breaker & Retry**: Implemented in `EnrichmentClient.js`. We use `opossum` for the circuit breaker state machine, and wrap the axios call in a custom exponential backoff loop for the initial retry phase.
