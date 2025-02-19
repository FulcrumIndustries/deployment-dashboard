const fs = require('fs');
const path = require('path');

// Read the original package.json
const pkg = require('./package.json');

// Create a simplified version for the executable
const executablePkg = {
    name: pkg.name,
    version: pkg.version,
    dependencies: {
        express: pkg.devDependencies.express
    }
};

// Write the new package.json to dist
fs.writeFileSync(
    path.join(__dirname, 'dist', 'package.json'),
    JSON.stringify(executablePkg, null, 2)
); 