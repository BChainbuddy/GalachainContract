require('dotenv').config();
const port = process.env.PORT || 4000;
const log = require('./utils/log');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

// middleware
app.use(bodyParser.json());
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/', express.static(path.join(__dirname, 'public')));
app.get('/ok', (req, res) => res.send('ok'));

// actual API routes
app.use('/pk', require('./routes/pk'));
app.use('/assets', require('./routes/assets'));

{
	// Kill App Before Bug
	const timeout = 600; // Galachain GRPC Timeout Param
	const offset = 5; // Personal Preference
	const deadline = timeout - offset; // Kill Here
	setTimeout(() => process.exit(1), deadline * 1000);

	// Broadcast Kill Timer
	const startTime = new Date();
	const toKill = () => {
		const elapsed = Math.round((new Date() - startTime) / 1000);
		return deadline - elapsed;
	};
	setInterval(() => log.warn(`Shutoff in ${toKill()} seconds...`), 5000);

	// Health Check Endpoint
	app.get('/online', (req, res) => res.json({ reboot: toKill() }));
}

// listen
app.listen(port, () => log.success(`Listening on Port:${port}`, true));
