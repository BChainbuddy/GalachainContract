import { fixture, transactionSuccess } from "@gala-chain/test";

import { AppleContract } from "./contract";

// The purpose of this test is to detect unexpected changes in API definition
test(`${AppleContract.name} API should match snapshot`, async () => {
  // Given
  const { contract, ctx } = fixture(AppleContract);

  // When
  const contractApi = await contract.GetContractAPI(ctx);

  // Then
  expect(contractApi).toEqual(transactionSuccess());
  expect({ ...contractApi.Data, contractVersion: "?.?.?" }).toMatchSnapshot();
});
