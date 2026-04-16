const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  try {
    const root = process.cwd();
    console.log('CWD:', root);
    
    // Scan directories to find where backend is
    const files = fs.readdirSync(root);
    console.log('Files in CWD:', files);
    
    let backendPath = '';
    if (files.includes('backend')) {
      backendPath = path.join(root, 'backend/app');
    } else if (files.includes('api') && fs.readdirSync(path.join(root, 'api')).includes('backend')) {
       backendPath = path.join(root, 'api/backend/app');
    } else {
       // Deep search
       console.log('Backend not found in expected locations.');
    }

    if (backendPath) {
      console.log('Loading backend from:', backendPath);
      const app = require(backendPath);
      return app(req, res);
    }

    throw new Error('Could not find backend/app.js in the deployment bundle.');
  } catch (err) {
    res.status(500).json({
      error: 'FILE_NOT_FOUND',
      cwd: process.cwd(),
      files: fs.readdirSync(process.cwd()),
      message: err.message
    });
  }
};
