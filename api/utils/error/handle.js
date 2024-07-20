const log = require('../log');

const error = (route, error, res) => {
	log.error(route, error);
	res.status(500).json({ success: false, message: error.message });
};

module.exports = { error };
