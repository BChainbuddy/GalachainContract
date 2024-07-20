require('dotenv').config();
const privateKey =
	process.env.GALA_ADMIN_PRIVATE_KEY ||
	'62172f65ecab45f423f7088128eee8946c5b3c03911cb0b061b1dd9032337271';

const { gcclient } = require('@gala-chain/client');
const { createValidDTO } = require('@gala-chain/api');

const config = require('./config');

async function validateAndSign(dto, input, verbose) {
	const validDto = await createValidDTO(dto, input);
	if (verbose) console.log('validDto', validDto);

	const signedDto = validDto.signed(privateKey);
	if (verbose) console.log('signedDto', signedDto);

	return signedDto;
}

function abortIfNecessary(res) {
	if (res.Status !== 1) throw `res.Status !== 1`;
	if (!res.Data) throw `!Data`;
}

function handleError(postMtd, contractMtd, err, verbose) {
	let reason = `@contract.${postMtd}("${contractMtd}"): `;
	reason += err;
	if (verbose) reason += `\n|| res ${res}`;
	throw new Error(reason.toString());
}

module.exports = class ContractClient {
	constructor(
		contractName,
		channelName = 'product-channel',
		chaincodeName = 'basic-product'
	) {
		this.contractCfg = { contractName, channelName, chaincodeName };
		this.builder = gcclient.forApiConfig(config);
	}

	async getClient() {
		const client = this.builder.forContract(this.contractCfg);
		const result = JSON.stringify(client);
		await client.disconnect();
		return result;
	}

	async submit(method, dto, input = {}, verbose = false) {
		const client = this.builder.forContract(this.contractCfg);
		// await (await client.clientPromise).isReady();
		let res;
		try {
			const data = await validateAndSign(dto, input, verbose);
			res = await client.submitTransaction(method, data);
			if (verbose) console.log(res);
			// await (await client.clientPromise).disconnect();
			await client.disconnect();
			abortIfNecessary(res);
		} catch (err) {
			handleError('submit', method, err, verbose);
		}
		return res.Data;
	}

	async evaluate(method, dto, input = {}, verbose = false) {
		const client = this.builder.forContract(this.contractCfg);
		// await (await client.clientPromise).isReady();
		let res;
		try {
			const data = await validateAndSign(dto, input, verbose);
			res = await client.evaluateTransaction(method, data);
			if (verbose) console.log(res);
			// await (await client.clientPromise).disconnect();
			await client.disconnect();
			abortIfNecessary(res);
		} catch (err) {
			handleError('evaluate', method, err, verbose);
		}
		return res.Data;
	}
};
