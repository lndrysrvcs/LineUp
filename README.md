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

## Versions

Postgres: 18.1

## AI Usage

We used Claude to add in features for demo 4, most notably for the new local storage caching feature. The feature is intended for when people start filling out the availability form and refresh the page, their answers will now be be retained until they submit.

We gave Claude the relevant files (and only the relevant files) and asked it to add the feature. Additionally, we told it to add a comment next to each line it proposed changing. Then, instead of just copying-and-pasting, we went through each changed line to ensure that it was adding the functionality we wanted in a way that actually makes sense and only implemented that line once it made sense to us, asking Claude follow-up questions to ensure understanding of why it wrote the code the way it did.

Occassionally, we would ask why Claude would take a certain approach since we could think of clearer ways to do it, and it would rethink why it made those decisions and either explain why or redo the code in the paradigm we suggested instead. This was very helpful since it gave us ideas for potential ways to implement the feature we might not have otherwise thought about as well as an explaination as to when we might want to use that new approach going forward.
