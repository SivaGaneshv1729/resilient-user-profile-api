# Resilient User Profile Management API

A robust and fault-tolerant backend API for managing user profiles, built with Node.js, Express, and MongoDB. This API integrates an external service to enrich user profiles and demonstrates advanced design patterns including Repository, Unit of Work, Circuit Breaker, and Retry mechanisms.

## Key Features
- **CRUD Operations**: Complete management of user profiles.
- **Repository & Unit of Work**: Abstracts database operations (Mongoose) ensuring transactional integrity.
- **Resilience Patterns**: Uses `opossum` for Circuit Breaker and a custom exponential backoff Retry mechanism for handling transient failures of the mock external enrichment service.
- **Data Validation & Error Handling**: Comprehensive validation using `joi` and unified error formatting.
- **Dockerized**: Fully containerized setup including a mock enrichment service to simulate network failures.

## Architectural Decisions
- **Repository Pattern**: `MongoUserRepository` abstracts database logic from the `UserService`. This decoupling allows easy testing and future migration to other databases.
- **Unit of Work**: Ensures operations like user creation or updates that may span multiple records are atomic.
- **Circuit Breaker**: Implemented via `opossum` to stop calling the enrichment service when it's repeatedly failing, preventing cascading delays and resource exhaustion.
- **Retry Pattern**: Wraps the `fetch` API to retry transient errors up to a maximum attempt limit with an exponential backoff before the circuit breaker trips.

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/SivaGaneshv1729/resilient-user-profile-api.git
   cd resilient-user-profile-api
   ```

2. **Configure Environment**
   Copy the `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   (Adjust any variables as necessary, but defaults work out-of-the-box).

3. **Run the Application Stack**
   Start the API, MongoDB, and Mock Service using Docker Compose:
   ```bash
   docker-compose up -d --build
   ```
   *The database will be automatically seeded with 3 initial users upon the API starting up successfully.*

## Testing Instructions

**Run Unit and Integration Tests via Docker:**
```bash
docker-compose exec app npm test
```

*This will run both Unit (mocked services and repos) and Integration tests (testing the routing, validation, and simulated resilience patterns).*

## API Documentation
The API is fully documented in `openapi.yaml`. Key endpoints include:
- `POST /api/users` - Create a user
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user profile
- `GET /api/users/:id/enriched` - Retrieves basic profile alongside mock data. Simulates external API delays/failures to demonstrate Circuit Breaker and Retry.

### Testing Resilience
To test the Circuit Breaker, modify `MOCK_SERVICE_FAILURE_RATE=1.0` in `.env` (or docker-compose.yml), run `docker-compose up -d`, and repeatedly call the `/api/users/:id/enriched` endpoint. You will see retries happening initially, followed by the circuit breaker opening and returning the fallback profile with `enrichedDataStatus: unavailable`.
