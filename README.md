# Aionyx EasyDeploy 🚀

A modern, intuitive deployment management tool that helps you track and organize your deployment steps with style.

![Aionyx EasyDeploy Screenshot](screenshot.png)

## ✨ Features

- **Visual Deployment Tracking**: Beautiful, animated interface with dynamic sine waves
- **Step-by-Step Management**: Organize your deployment steps with a clear, structured approach
- **Real-time Status**: Track completion status of each deployment step
- **Type Categories**: Categorize steps with color-coded types (Database, API, Scripting, etc.)
- **Persistent Storage**: All your deployments are saved locally using IndexedDB
- **Shareable Deployments**: Easy copy-paste deployment IDs for sharing with your team

## 🚀 Quick Start

1. Clone the repository:

```bash
git clone https://github.com/yourusername/aionyx-easydeploy.git
cd aionyx-easydeploy
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## 📖 How to Use

### Creating a New Deployment

1. Click "Create New Deployment" on the dashboard
2. Fill in the deployment details:
   - Title
   - Description
   - Category
   - Date
3. Add steps using the "+" button at the bottom
4. For each step, specify:
   - Type (Database, API, Files, etc.)
   - Name
   - Action details
   - Optional comments

### Managing Steps

- **Add Steps**: Click the "+" button below the table
- **Mark Complete**: Check the checkbox next to any step
- **Edit Steps**: Click any field to edit directly
- **Delete Steps**: Click the trash icon on the right
- **Reorder**: Steps are automatically numbered in sequence

### Sharing Deployments

1. Copy the Deployment ID (click the copy icon)
2. Share the ID with your team
3. They can load it using the "Load Existing" section
4. All changes are synchronized locally

## 🎨 Types of Steps

- 🗄️ **Database**: Database migrations and updates
- 📜 **Scripting**: Run scripts or commands
- 🔌 **API**: API deployments and updates
- 📁 **Files**: File system operations
- 📧 **Mail**: Email service configurations
- 💾 **Backup**: Backup procedures
- 📊 **Monitor**: Monitoring setup
- ⚙️ **Configure**: Configuration changes
- 📋 **Prerequisite**: Required preliminary steps
- ↩️ **Rollback**: Rollback procedures

## 🛠️ Development

### Tech Stack

- React 18 + TypeScript
- Material-UI (MUI) for components
- Dexie.js for IndexedDB management
- Canvas API for wave animations
- React Router for navigation
- UUID for unique identifiers

### Building for Production

1. Create a production build:

```bash
npm run build
# or
yarn build
```

2. The build output will be in the `dist` directory

### Deployment

You can deploy the contents of the `dist` directory to any static hosting service:

```bash
# Using Vercel
vercel deploy

# Using Netlify
netlify deploy

# Using GitHub Pages
gh-pages -d dist
```

## 📝 License

MIT License - feel free to use and modify!

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 💖 Support

If you find this project helpful, please give it a star ⭐️

## 🔗 Links

- [Report a bug](https://github.com/FulcrumIndustries/deployment-dashboard/issues)
- [Request a feature](https://github.com/FulcrumIndustries/deployment-dashboard/issues)
- [Documentation](https://github.com/FulcrumIndustries/deployment-dashboard/wiki)
