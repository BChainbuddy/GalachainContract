const express = require('express');
const router = express.Router();

const handle = require('../utils/error/handle');

const ContractClient = require('../utils/ContractClient');
var client = new ContractClient('PublicKeyContract');

const { ethers } = require('ethers');
const { RegisterUserDto } = require('@gala-chain/api');

router.route('/user').post(async (req, res) => {
	try {
		// DATA SANITATION && PREPARATION
		const { user } = req.body;
		const wallet = ethers.Wallet.createRandom();
		const publicKey = wallet.publicKey;
		const privateKey = wallet.privateKey;
		if (!user || user.trim() === '' || !publicKey || publicKey.trim() === '')
			return res.status(400).json({ success: false, message: '!user' });
		const input = { user, publicKey };

		// CONTRACT CALL && RESPONSE
		const data = await client.submit('RegisterUser', RegisterUserDto, input);
		res.json({ success: true, data, privateKey });
	} catch (error) {
		handle.error('/user', error, res);
	}
});

module.exports = router;
