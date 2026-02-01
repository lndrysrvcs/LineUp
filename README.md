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

### Setup and Run

1. **Install backend dependencies**
   ```bash
   cd LineUp.Backend
   dotnet restore
   ```

2. **Install frontend dependencies**
   ```bash
   cd lineup-client
   cp .env.example .env # Make sure to populate .env!
   pnpm install
   ```

3. **Start the backend** (in `LineUp.Backend/`)
   ```bash
   dotnet run
   ```

4. **Start the frontend** (in `lineup-client/`)
   ```bash
   pnpm run dev
   ```

#### API Client Generation

To regenerate the API client after backend changes:
```bash
cd LineUp.Backend
GEN=true dotnet build
```
