git rm -r --cached node_modules 2>$null

git add .gitignore .env.example
git commit -m "chore: add gitignore and env template"

git add docker-compose.yml
git commit -m "build: add docker-compose configuration"

git add Dockerfile
git commit -m "build: add main API Dockerfile"

git add initdb/init.sql
git commit -m "db: add MySQL initialization script"

git add mock-service/package.json
git commit -m "mock: add package.json for enrichment service"

git add mock-service/Dockerfile
git commit -m "mock: add Dockerfile for enrichment service"

git add mock-service/app.js
git commit -m "mock: implement mock enrichment service logic"

git add package.json package-lock.json
git commit -m "chore: add main project dependencies"

git add src/config/db.js
git commit -m "feat(db): add MySQL connection pool config"

git add src/repositories/interfaces/IUserRepository.js
git commit -m "feat(repo): add IUserRepository interface"

git add src/repositories/interfaces/IUnitOfWork.js
git commit -m "feat(repo): add IUnitOfWork interface"

git add src/repositories/impl/MySQLUserRepository.js
git commit -m "feat(repo): implement MySQLUserRepository"

git add src/repositories/impl/MySQLUnitOfWork.js
git commit -m "feat(repo): implement MySQLUnitOfWork"

git add src/external/EnrichmentClient.js
git commit -m "feat(external): implement resilient EnrichmentClient with opossum"

git add src/services/UserService.js
git commit -m "feat(service): implement UserService with Unit of Work"

git add src/middleware/validation.js
git commit -m "feat(api): add Joi validation middleware"

git add src/middleware/errorHandler.js
git commit -m "feat(api): add global error handler"

git add src/controllers/UserController.js
git commit -m "feat(api): implement UserController"

git add src/routes/userRoutes.js
git commit -m "feat(api): add user routes"

git add src/app.js
git commit -m "feat: initialize Express app and mount routes"

git add tests/unit/EnrichmentClient.test.js
git commit -m "test: add unit tests for EnrichmentClient resilience"

git add tests/integration/api.test.js
git commit -m "test: add integration tests for API endpoints"

git add openapi.yaml
git commit -m "docs: add OpenAPI documentation"

git add README.md
git commit -m "docs: add project README and setup instructions"

git add -A
git commit -m "chore: cleanup and final adjustments"

git push origin main -f
