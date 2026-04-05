# LineUp

LineUp is a scheduling tool for when you need 100% coverage over a period of time.
It is designed to help teams ensure that everyone is available to work during any given period of time, whether for staffing a table or scheduling radio shows.


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

### Testing
To run the backend tests:
```bash
dotnet test
```
in the root of the repository.

To run the frontend tests:
```bash
pnpm test
```
in the `lineup-client` directory.

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

## Project Structure
- **`lineup-client/`** - React frontend
- **`LineUp.Backend/`** - .NET backend API


- **`LineUp.Core/`** - Shared models and utilities
- **`LineUp.Scheduler/`** - Scheduler logic
- **`LineUp.EndToEndTests/`** - End-to-end tests
- **`LineUp.MigrationService/`** - Database migration service (needed for Aspire)
- **`LineUp.ServiceDefaults/`** - Shared service defaults and logic for Aspire
- **`LineUp.AppHost/`** - Aspire app host

```mermaid
flowchart TB
    ReactFrontend["React Frontend"] -- Manager CRUDs schedule --> DotNetBackend[".NET Backend"]
    ReactFrontend -- User defines availability --> DotNetBackend
    ReactFrontend -- Manager generates schedule --> DotNetBackend
    DotNetBackend -- CRUD schedules --> PostgresDB[("Postgres Database")]
    DotNetBackend -- CRUD user availability --> PostgresDB
    DotNetBackend -- Send availabilites --> Scheduler["Scheduler"]
    Scheduler -- Send Generated Schedule --> DotNetBackend
    DotNetBackend -- Return Generated Schedule --> ReactFrontend
    DotNetBackend -- Send email to users upon schedule generation --> ResendApi["Resend API"]
    Auth0Api["Auth0 API"] <-- Verify authenticated user --> DotNetBackend
    Auth0Api <-- Authenticate with Google --> ReactFrontend
```

## Versions

Postgres: 18.1

Moq: 4.20.72

## AI Usage

We used Claude to add in features for demo 4, most notably for the new local storage caching feature. The feature is intended for when people start filling out the availability form and refresh the page, their answers will now be be retained until they submit.

We gave Claude the relevant files (and only the relevant files) and asked it to add the feature. Additionally, we told it to add a comment next to each line it proposed changing. Then, instead of just copying-and-pasting, we went through each changed line to ensure that it was adding the functionality we wanted in a way that actually makes sense and only implemented that line once it made sense to us, asking Claude follow-up questions to ensure understanding of why it wrote the code the way it did.

Occassionally, we would ask why Claude would take a certain approach since we could think of clearer ways to do it, and it would rethink why it made those decisions and either explain why or redo the code in the paradigm we suggested instead. This was very helpful since it gave us ideas for potential ways to implement the feature we might not have otherwise thought about as well as an explaination as to when we might want to use that new approach going forward.

For the backend, we used Junie to refactor the scheduler to make it less monolithic.

We encouraged Junie to write extensive unit tests for the scheduler as it was making changes so that it did not inadvertently break functionality.

We also asked Junie to write more extensive unit tests for the schedule after the refactor, for easily breakable parts of the scheduler like enforcing shift lengths and counting shifts as a contiguous block of slots rather than one "slot".
