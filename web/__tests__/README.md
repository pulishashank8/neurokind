# Test Setup Quick Start

## Before Running Tests

1. **Update `.env.test` with your PostgreSQL credentials**:
   ```env
   DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/neurokind_test"
   ```

2. **Create test database** (if not exists):
   ```powershell
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create test database
   CREATE DATABASE neurokind_test;
   \q
   ```

3. **Run setup script**:
   ```powershell
   .\scripts\setup-tests.ps1
   ```

4. **Run tests**:
   ```powershell
   npm run test
   ```

For detailed instructions, see [docs/TESTING.md](../docs/TESTING.md)
