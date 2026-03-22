# LineUp

LineUp is a scheduling tool for when you need 100% coverage over a period of time.

## Project Structure

- **`LineUp.Backend/`** - .NET backend API
- **`lineup-client/`** - React frontend with auto-generated API client

## Quickstart

### Prerequisites
- [.NET 10](https://dotnet.microsoft.com/en-us/download)
- [Node.js](https://nodejs.org/en/download)
- [PNPM](https://pnpm.io/installation)
- [.NET Aspire CLI](https://aspire.dev/get-started/install-cli/)
- Docker or Podman (Podman is lighter-weight)

### Setup and Run

1. **Install backend dependencies**
   ```bash
   dotnet restore
   ```

2. **Install frontend dependencies**
   ```bash
   cd lineup-client
   cp .env.example .env # Make sure to populate .env!
   pnpm install
   ```
   > Note: If you need the API client to be generated, see the "API Client Generation" section below.

3. **Start the app, seeding with test data**
   ```bash
   SEED=true aspire run
   ```
   or for PowerShell users:
   ```powershell
   $env:SEED = "true"
   aspire run
   ```
Note: On subsequent runs, do not use the `SEED` flag, unless you want to re-seed the database (which will delete all existing data).

#### API Client Generation

To regenerate the API client after backend changes:
```bash
GEN=true aspire run
```
or for PowerShell users:
```powershell
$env:GEN = "true"
aspire run
```

## Versions:
Postgres: 18.1