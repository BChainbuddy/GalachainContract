import { GC_NETWORK_ID, TokenClass, TokenClassKey } from "@gala-chain/api";
import { users } from "@gala-chain/test";
import BigNumber from "bignumber.js";

import { createInstanceFn, createPlainFn } from "../utils";

const key = {
  collection: "TEST",
  category: "Collectible",
  type: "Photo",
  additionalKey: "OnlyFansExclusive"
};

const decimals = 0;

const spec = {
  name: "FeetPix",
  symbol: "FEET",
  description: "subscribe to my onlyfans",
  decimals,
  image: "https://app.gala.games/test-image-placeholder-url.png",
  isNonFungible: true,
  maxCapacity: new BigNumber(1024),
  maxSupply: new BigNumber(1024),
  network: GC_NETWORK_ID,
  totalBurned: new BigNumber(0),
  totalMintAllowance: new BigNumber(0),
  totalSupply: new BigNumber(0),
  authorities: [users.testAdminId]
};

const tokenClassKeyPlain = createPlainFn(key);
const tokenClassKey = createInstanceFn(TokenClassKey, tokenClassKeyPlain());

const tokenClassPlain = createPlainFn({ ...tokenClassKeyPlain(), ...spec });
const tokenClass = createInstanceFn(TokenClass, tokenClassPlain());

export default {
  key,
  spec,
  class: tokenClass(),
  classKey: tokenClassKey()
};
