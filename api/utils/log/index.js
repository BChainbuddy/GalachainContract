const ctrl = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	dim: '\x1b[2m',
	underscore: '\x1b[4m',
	blink: '\x1b[5m',
	reverse: '\x1b[7m',
	hidden: '\x1b[8m',
};

const color = {
	fg: {
		black: '\x1b[30m',
		red: '\x1b[31m',
		green: '\x1b[32m',
		yellow: '\x1b[33m',
		blue: '\x1b[34m',
		magenta: '\x1b[35m',
		cyan: '\x1b[36m',
		white: '\x1b[37m',
		gray: '\x1b[90m',
	},
	bg: {
		black: '\x1b[40m',
		red: '\x1b[41m',
		green: '\x1b[42m',
		yellow: '\x1b[43m',
		blue: '\x1b[44m',
		magenta: '\x1b[45m',
		cyan: '\x1b[46m',
		white: '\x1b[47m',
		gray: '\x1b[100m',
	},
};

const prioritize = (message, critical) => {
	if (!critical) return message;
	return ctrl.reverse + message;
};

const success = (topic, critical = false) =>
	console.log(prioritize(color.fg.green + topic, critical), ctrl.reset);

const caution = (topic, critical = false) =>
	console.log(prioritize(color.fg.yellow + topic, critical), ctrl.reset);

const failure = (topic, critical = false) =>
	console.log(prioritize(color.fg.red + topic, critical), ctrl.reset);

const error = (topic, err) => {
	failure(`ERROR: ${topic}`, true);
	console.log(err);
};

module.exports = { success, caution, warn: caution, failure, error };
