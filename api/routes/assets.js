const express = require('express');
const router = express.Router();

const handle = require('../utils/error/handle');

const ContractClient = require('../utils/ContractClient');
var client = new ContractClient('GalaChainToken');

const {
	CreateTokenClassDto,
	MintTokenDto,
	GrantAllowanceDto,
	BurnTokensDto,
	FetchBalancesDto,
	FetchAllowancesDto,
	LockTokenDto,
	UnlockTokenDto,

	TokenInstance,
	TokenInstanceKey,
} = require('@gala-chain/api');

router.post('/createTokenClass', async (req, res) => {
	try {
		// DATA SANITATION && PREPARATION
		const {
			network,
			tokenClass,
			isNonFungible,
			decimals,
			name,
			symbol,
			description,
			rarity,
			image,
			metadataAddress,
			contractAddress,
			maxSupply,
			maxCapacity,
			totalMintAllowance,
			totalSupply,
			totalBurned,
		} = req.body;
		const input = {
			network,
			tokenClass,
			isNonFungible,
			decimals,
			name,
			symbol,
			description,
			rarity,
			image,
			metadataAddress,
			contractAddress,
			maxSupply: maxSupply.toString(),
			maxCapacity: maxCapacity.toString(),
			totalMintAllowance: totalMintAllowance.toString(),
			totalSupply: totalSupply.toString(),
			totalBurned: totalBurned.toString(),
		};

		// CONTRACT CALL && RESPONSE
		const data = await client.submit(
			'CreateTokenClass',
			CreateTokenClassDto,
			input
		);
		res.json({ success: true, data });
	} catch (error) {
		handle.error('/createTokenClass', error, res);
	}
});

router.get('/getAllowances', async (req, res) => {
	try {
		// DATA SANITATION && PREPARATION
		const { tokenInstanceKey, user, grantedTo } = req.query;
		if (!tokenInstanceKey || !user || !grantedTo) {
			return res.status(400).json({
				success: false,
				message:
					'All parameters (tokenInstanceKey, user, grantedTo) must be provided.',
			});
		}
		const input = { tokenInstanceKey, user, grantedTo };

		// CONTRACT CALL && RESPONSE
		const data = await client.evaluate(
			'FetchAllowances',
			FetchAllowancesDto,
			input
		);
		res.json({ success: true, data });
	} catch (error) {
		handle.error('/getAllowances', error, res);
	}
});

router.post('/grantAllowance', async (req, res) => {
	try {
		// DATA SANITATION && PREPARATION
		const {
			collection,
			category,
			type,
			additionalKey,
			allowanceType,
			quantities,
			uses,
		} = req.body;

		if (
			!collection ||
			!category ||
			!type ||
			!additionalKey ||
			!allowanceType ||
			!quantities ||
			!uses
		) {
			return res.status(400).json({
				success: false,
				message:
					"Missing required fields: 'collection', 'category', 'type', 'additionalKey', 'allowanceType', 'quantities', and 'uses' must all be provided.",
			});
		}
		const tokenInstanceKey = TokenInstanceKey.nftKey(
			{
				collection,
				category,
				type,
				additionalKey,
			},
			TokenInstance.FUNGIBLE_TOKEN_INSTANCE
		).toQueryKey();

		const input = {
			tokenInstance: tokenInstanceKey,
			allowanceType,
			quantities: quantities.map((q) => ({
				user: q.user,
				quantity: q.quantity.toString(),
			})),
			uses: uses.toString(),
		};

		// CONTRACT CALL && RESPONSE
		const data = await client.submit(
			'GrantAllowance',
			GrantAllowanceDto,
			input
		);
		res.json({ success: true, data });
	} catch (error) {
		handle.error('/grantAllowance', error, res);
	}
});

router.post('/mintToken', async (req, res) => {
	try {
		// DATA SANITATION && PREPARATION
		const { tokenClassKey, owner, quantity, userPrivateKey } = req.body;
		if (!tokenClassKey || !owner || quantity == null || !userPrivateKey)
			return res.status(400).json({
				success: false,
				message:
					"Missing required fields: 'tokenClassKey', 'owner', 'quantity', and 'userPrivateKey' must be provided.",
			});
		const input = {
			tokenClass: tokenClassKey,
			owner,
			quantity: quantity.toString(),
		};

		// CONTRACT CALL && RESPONSE
		const data = await client.submit('MintToken', MintTokenDto, input);
		res.json({ success: true, data });
	} catch (error) {
		handle.error('/mintToken', error, res);
	}
});

router.post('/burnTokens', async (req, res) => {
	try {
		// DATA SANITATION && PREPARATION
		const { tokenInstances, userPrivateKey, owner } = req.body;
		if (
			!tokenInstances ||
			!Array.isArray(tokenInstances) ||
			tokenInstances.length === 0 ||
			!userPrivateKey ||
			!owner
		) {
			return res.status(400).json({
				success: false,
				message:
					"Missing required fields: 'tokenInstances', 'owner', and 'userPrivateKey' must be provided.",
			});
		}
		const input = { tokenInstances, owner };

		// CONTRACT CALL && RESPONSE
		const data = await client.submit('BurnTokens', BurnTokensDto, input);
		res.json({ success: true, data });
	} catch (error) {
		handle.error('/burnTokens', error, res);
	}
});

router.get('/getBalances', async (req, res) => {
	try {
		// DATA SANITATION && PREPARATION
		if (!req.query.userId)
			return res.status(400).json({ success: false, message: '!userId' });
		const { userId } = req.query;
		const input = { owner: userId };

		// CONTRACT CALL && RESPONSE
		const data = await client.evaluate(
			'FetchBalances',
			FetchBalancesDto,
			input
		);
		res.json({ success: true, data });
	} catch (error) {
		handle.error('/getBalances', error, res);
	}
});

router.post('/lockToken', async (req, res) => {
	try {
		// DATA SANITATION && PREPARATION
		const {
			owner,
			lockAuthority,
			tokenInstance,
			quantity,
			useAllowances,
			userPrivateKey,
		} = req.body;

		if (
			!owner ||
			!lockAuthority ||
			!tokenInstance ||
			!quantity ||
			!userPrivateKey
		) {
			return res.status(400).json({
				success: false,
				message:
					"Missing required fields: 'owner', 'lockAuthority', 'tokenInstance', 'quantity', and 'userPrivateKey' must be provided.",
			});
		}
		const input = {
			owner,
			lockAuthority,
			tokenInstance,
			quantity,
			useAllowances,
		};

		// CONTRACT CALL && RESPONSE
		const data = await client.submit('LockToken', LockTokenDto, input);
		res.json({ success: true, data });
	} catch (error) {
		handle.error('/lockToken', error, res);
	}
});

router.post('/unlockToken', async (req, res) => {
	try {
		// DATA SANITATION && PREPARATION
		const { owner, tokenInstance, quantity, lockedHoldName, userPrivateKey } =
			req.body;

		if (!owner || !tokenInstance || !userPrivateKey) {
			return res.status(400).json({
				success: false,
				message:
					"Missing required fields: 'owner', 'tokenInstance', and 'userPrivateKey' must be provided.",
			});
		}
		const input = {
			owner,
			tokenInstance,
			quantity,
			lockedHoldName,
		};

		// CONTRACT CALL && RESPONSE
		const data = await client.submit('UnlockToken', UnlockTokenDto, input);
		res.json({ success: true, data });
	} catch (error) {
		handle.error('/unlockToken', error, res);
	}
});

module.exports = router;
