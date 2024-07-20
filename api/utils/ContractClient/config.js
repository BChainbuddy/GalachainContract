require('dotenv').config();

const path = require('path');
const networkRoot = path.resolve(__dirname, '../../../chaincode');
const config = {
	orgMsp: 'CuratorOrg',
	userId: process.env.GC_API_KEY || 'admin',
	userSecret: process.env.GC_API_SECRET || 'adminpw',
	apiUrl: `${process.env.HOST || 'http://localhost'}:8801`,
	configPath: path.join(networkRoot, 'api-config.json'),
};

module.exports = config;
