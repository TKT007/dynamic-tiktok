/ api/deploy.js - Arquivo para a API da Vercel
const axios = require('axios');

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { vercelToken, projectName, files, teamId } = req.body;

        if (!vercelToken || !projectName || !files) {
            return res.status(400).json({ 
                error: 'Missing required fields: vercelToken, projectName, files' 
            });
        }

        // Preparar dados para o deploy
        const deployData = {
            name: projectName,
            files: files.map(file => ({
                file: file.name,
                data: file.content
            })),
            projectSettings: {
                framework: null
            }
        };

        if (teamId) {
            deployData.teamId = teamId;
        }

        // Fazer o deploy na Vercel
        const response = await axios.post(
            'https://api.vercel.com/v13/deployments',
            deployData,
            {
                headers: {
                    'Authorization': `Bearer ${vercelToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const deployResult = {
            success: true,
            url: `https://${response.data.url}`,
            deploymentId: response.data.id,
            projectName: projectName,
            createdAt: new Date().toISOString()
        };

        res.status(200).json(deployResult);

    } catch (error) {
        console.error('Deploy error:', error.response?.data || error.message);
        
        res.status(500).json({
            success: false,
            error: error.response?.data?.error?.message || error.message,
            details: error.response?.data || null
        });
    }
};

// package.json para o backend
const packageJson = {
    "name": "vercel-deploy-api",
    "version": "1.0.0",
    "dependencies": {
        "axios": "^1.6.0"
    }
};
