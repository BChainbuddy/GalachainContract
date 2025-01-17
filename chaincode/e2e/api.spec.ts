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
import { AdminChainClients, TestClients, transactionSuccess } from "@gala-chain/test";

jest.setTimeout(30000);

const config = {
  pk: "PublicKeyContract",
  assets: "GalaChainToken"
};

describe("API snapshots", () => {
  let client: AdminChainClients<typeof config>;

  beforeAll(async () => (client = await TestClients.createForAdmin(config)));
  afterAll(async () => await client.disconnect());

  test(`Api: ${config.pk}`, async () => {
    const response = await client.pk.GetContractAPI();
    expect(response).toEqual(transactionSuccess());
    expect({ ...response.Data, contractVersion: "?.?.?" }).toMatchSnapshot();
  });

  test(`Api: ${config.assets}`, async () => {
    const response = await client.assets.GetContractAPI();
    expect(response).toEqual(transactionSuccess());
    expect({ ...response.Data, contractVersion: "?.?.?" }).toMatchSnapshot();
  });
});
