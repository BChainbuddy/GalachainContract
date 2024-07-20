import { GC_NETWORK_ID, TokenClass, TokenClassKey } from "@gala-chain/api";
import { users } from "@gala-chain/test";
import BigNumber from "bignumber.js";

import { createInstanceFn, createPlainFn } from "../utils";

const key = {
  collection: "TEST",
  category: "Currency",
  type: "Example",
  additionalKey: "none"
};

const decimals = 2;

const spec = {
  name: "Net Beans",
  symbol: "BEANS",
  description: "This is a test description!",
  decimals,
  image: "https://fastly.picsum.photos/id/12/200/300.jpg",
  isNonFungible: false,
  maxCapacity: new BigNumber(1000000000000),
  maxSupply: new BigNumber(1000000000000),
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
