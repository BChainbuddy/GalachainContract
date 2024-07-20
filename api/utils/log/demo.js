const log = require('./index');

// success
log.success('success');
log.success('critical success\n', true);
// caution
log.caution('caution');
log.caution('critical caution\n', true);
// failure
log.failure('failure');
log.failure('critical failure\n', true);
// error
try {
	log.undefined('Hello, World!');
} catch (err) {
	log.error('test', err);
}
