# Deployment Steps Manager

A tool to manage and track deployment steps across teams. All-in-one executable with embedded database.

## Features

- Real-time collaboration
- Step-by-step deployment tracking
- Prerequisites management
- Device-based authentication
- Offline-first with sync capabilities
- Self-contained - no external dependencies

## Installation

1. Download the latest release
2. Run the executable
3. Access the app at http://localhost:5984

The app will create a `data` folder in the same directory as the executable to store all information.

## Development Setup

1. Clone and install:

```bash
git clone <repository-url>
cd deployment-steps-manager
npm install
```

2. Start development server:

```bash
npm run dev
```

## Building

Build the standalone executable:

```bash
npm run pkg:build
```

The executable will be created in the `executables` directory.

## Data Management

- Data is stored in the `data` directory next to the executable
- Automatic backups are created daily in `data/backups`
- To restore from backup, stop the app, replace `data` with a backup, and restart

## Notes

- First device to connect becomes the admin
- Data is synced in real-time between all connected clients
- Works offline with automatic sync when connection is restored
- Each device gets a unique identifier for change tracking
