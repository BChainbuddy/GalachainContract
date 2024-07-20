import { execSync } from "child_process";

import { contractName } from "./config";

const cliPath = require.resolve(`../../lib/src/cli.js`);
const command = `node ${cliPath} get-contract-names`;

jest.setTimeout(30000);

/*
 * @notice
 * This test requires no modification.
 * It only needs to be present.
 *
 * If this test is failing,
 * it means you need to update `../../src/index.ts` OR `./config`
 */
it("should expose contract names", async () => {
  // Given
  const thisContract = JSON.stringify({ contractName });

  // When
  const res = execSync(command).toString();
  const start = res.indexOf("[") + 1;
  const end = res.indexOf("]");
  const entries = res.slice(start, end).split(",");

  // Then
  expect(entries.includes(thisContract)).toBe(true);
});
