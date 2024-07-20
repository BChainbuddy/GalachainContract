require('dotenv').config();
const port = process.env.PORT || 4000;
const log = require('./utils/log');
const axios = require('axios');

var startTime;
const start = () => (startTime = new Date());
const elapsed = () => Math.round((new Date() - startTime) / 1000);

const apiUrl = `${process.env.HOST || 'http://localhost'}:${port}`;

(() => {
	start();
	setInterval(async () => {
		try {
			log.caution('@Health Check: Checking Health...');
			let response = await axios.get(
				`${apiUrl}/assets/getBalances?userId=client|admin`
			);
			console.log(elapsed(), 'seconds: ', response.data);
			log.success('@Health Check: Success!');
			// response = await axios.get(`${apiUrl}/online`);
			// console.log(response.data);
		} catch (err) {
			log.error(`@Health Check: ${elapsed()} seconds: `, err);
		}
	}, 5000);
})();
