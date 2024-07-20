import { TestClients, transactionSuccess } from "@gala-chain/test";

import { contract } from "./config";

jest.setTimeout(30000);

/*
 * @notice
 * This test requires no modification.
 * It only needs to be present.
 *
 * If this test is failing,
 * it means you need to update snapshots OR `./config`
 */
describe("API Snapshot", () => {
  const config = { contract };
  test(`Api of ${config.contract}`, async () => {
    const client = await TestClients.createForAdmin(config);
    const response = await client.contract.GetContractAPI();
    expect(response).toEqual(transactionSuccess());
    expect({ ...response.Data, contractVersion: "?.?.?" }).toMatchSnapshot();
    await client.disconnect();
  });
});
