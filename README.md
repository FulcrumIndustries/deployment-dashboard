# Deployment Dashboard

A real-time collaborative deployment tracking application that helps teams manage and monitor their deployment processes.

## Features

- 🔄 **Real-time Collaboration**: Multiple users can work on the same deployment simultaneously
- 👥 **Presence Indicators**: See who's currently viewing or editing a deployment
- 📋 **Structured Deployment Steps**: Organize deployments with prerequisites and execution steps
- 🏷️ **Categorization**: Categorize deployments (Infrastructure, Software, Testing, etc.)
- 📊 **Status Tracking**: Track the progress of each deployment step
- 💾 **Offline Support**: Works offline with local data persistence
- 📤 **Import/Export**: Share deployments between teams using JSON export/import
- 🎨 **Modern UI**: Clean, responsive interface with Material-UI components

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/deployment-dashboard.git
cd deployment-dashboard
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run pkg:full
```

This will create an executable named `EasyDeploy.exe` that bundles both the frontend and backend.

### Usage

1. Launch the application:

```bash
npm start
# or use the executable
./EasyDeploy.exe
```

2. Create a new deployment or load an existing one
3. Add prerequisites and deployment steps
4. Share the deployment ID with your team
5. Collaborate in real-time

## Data Import/Export

- Export deployments to JSON using the "Export" button
- Import deployments from JSON using the "Import" button
- All related data (steps, prerequisites, info) is included in the export

## Development

- Frontend: React + TypeScript + Material-UI
- Backend: Node.js + Express + WebSocket
- Database: IndexedDB (client-side storage)
- Build: Vite + pkg (for executable creation)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
