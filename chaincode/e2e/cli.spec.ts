/*
 * Copyright (c) Gala Games Inc. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { execSync } from "child_process";

const cliPath = require.resolve(`../lib/src/cli.js`);
const command = `node ${cliPath} get-contract-names`;

jest.setTimeout(30000);

it("should expose contract names", async () => {
  // Given
  const pk = JSON.stringify({ contractName: "PublicKeyContract" });
  const assets = JSON.stringify({ contractName: "GalaChainToken" });

  // When
  const res = execSync(command).toString();
  const start = res.indexOf("[") + 1;
  const end = res.indexOf("]");
  const entries = res.slice(start, end).split(",");

  // Then
  expect(entries.includes(pk)).toBe(true);
  expect(entries.includes(assets)).toBe(true);
});
