const { FetchBalancesDto } = require('@gala-chain/api');

const log = require('../log');
const ContractClient = require('./index');

const token = new ContractClient('GalaChainToken');

var startTime;
const start = () => (startTime = new Date());
const elapsed = () => Math.round((new Date() - startTime) / 1000);

(() => {
	start();
	setInterval(async () => {
		try {
			const input = { owner: `client|admin` };
			const result = await token.evaluate(
				'FetchBalances',
				FetchBalancesDto,
				input
			);
			console.log(elapsed(), 'seconds: ', result);
		} catch (err) {
			log.error(`${elapsed()} seconds: `, err);
		}
	}, 5000);
})();
