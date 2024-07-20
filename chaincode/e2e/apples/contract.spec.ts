import { ChainUser } from "@gala-chain/client";
import {
  AdminChainClients,
  TestClients,
  transactionError,
  transactionErrorCode,
  transactionErrorKey,
  transactionErrorMessageContains,
  transactionSuccess
} from "@gala-chain/test";

import {
  AppleTree,
  AppleTreeDto,
  AppleTreesDto,
  FetchTreesDto,
  HarvestAppleDto,
  Variety,
  api
} from "../../src/apples";
import { name } from "./config";

jest.setTimeout(30000);

const config = { contract: { name, api } };

describe("passing test", () => it("passes", () => expect(1).toBe(1)));

// 17 tests (1 skipped)
describe("Apple trees", () => {
  let client: AdminChainClients<typeof config>;
  let user: ChainUser;

  let bob: ChainUser;
  let amelia: ChainUser;

  beforeAll(async () => {
    client = await TestClients.createForAdmin(config);
    user = await client.createRegisteredUser();
  });
  afterAll(async () => await client.disconnect());

  it("@CREATE: Allows users to plant many trees at once", async () => {
    bob = await client.createRegisteredUser();
    // Given
    const dto = new AppleTreesDto([
      new AppleTreeDto(Variety.HONEYCRISP, 1),
      new AppleTreeDto(Variety.HONEYCRISP, 2),
      new AppleTreeDto(Variety.HONEYCRISP, 3),
      new AppleTreeDto(Variety.HONEYCRISP, 4),
      new AppleTreeDto(Variety.MCINTOSH, 5),
      new AppleTreeDto(Variety.MCINTOSH, 6),
      new AppleTreeDto(Variety.MCINTOSH, 7),
      new AppleTreeDto(Variety.MCINTOSH, 8),
      new AppleTreeDto(Variety.GOLDEN_DELICIOUS, 9),
      new AppleTreeDto(Variety.GOLDEN_DELICIOUS, 10),
      new AppleTreeDto(Variety.GOLDEN_DELICIOUS, 11)
    ]).signed(bob.privateKey);

    // When
    const response = await client.contract.PlantTrees(dto);

    // Then
    expect(response).toEqual(transactionSuccess());
  });

  it("@CREATE: Allows users to plant individual trees", async () => {
    amelia = await client.createRegisteredUser();
    let dto: AppleTreeDto;

    let res;
    dto = new AppleTreeDto(Variety.GOLDEN_DELICIOUS, 12);
    res = await client.contract.PlantTree(dto.signed(amelia.privateKey));
    expect(res).toEqual(transactionSuccess());
    dto = new AppleTreeDto(Variety.GALA, 13);
    res = await client.contract.PlantTree(dto.signed(amelia.privateKey));
    expect(res).toEqual(transactionSuccess());
    dto = new AppleTreeDto(Variety.GALA, 14);
    res = await client.contract.PlantTree(dto.signed(amelia.privateKey));
    expect(res).toEqual(transactionSuccess());
    dto = new AppleTreeDto(Variety.GALA, 15);
    res = await client.contract.PlantTree(dto.signed(amelia.privateKey));
    expect(res).toEqual(transactionSuccess());
    dto = new AppleTreeDto(Variety.GALA, 16);
    res = await client.contract.PlantTree(dto.signed(amelia.privateKey));
    expect(res).toEqual(transactionSuccess());
  });

  it("@READ (Unpaginated): Returns all entries...", async () => {
    const dto = new FetchTreesDto();
    const response = await client.contract.FetchTrees(dto.signed(user.privateKey));
    const metadata = response.Data?.metadata;

    // NOTE: Chainkey primarily relies on user public key for
    // records lookup. Since we cannot guess bob or amelia's
    // public key, I can't hard code this. The next two tests
    // check the contents of what was just loaded anyway. Also
    // I'm kind of too lazy to do this rn. If you want to fix
    // it, good luck
    // - Love Catherine <3

    // NOTE: every time you run this e2e test, 16 records are
    // permanently added until you shutdown/ reset the network
    const fetchedRecordsCount = metadata?.fetchedRecordsCount ?? 0;
    expect(fetchedRecordsCount % 16).toEqual(0);
  });

  it("@READ (Unpaginated): Returns entries by creator (Bob)...", async () => {
    const dto = new FetchTreesDto(bob.identityKey);
    const response = await client.contract.FetchTrees(dto.signed(user.privateKey));

    expect(response).toEqual(
      transactionSuccess({
        results: [
          expect.objectContaining({
            creator: bob.identityKey,
            variety: Variety.GOLDEN_DELICIOUS,
            index: 10
          }),
          expect.objectContaining({
            creator: bob.identityKey,
            variety: Variety.GOLDEN_DELICIOUS,
            index: 11
          }),
          expect.objectContaining({
            creator: bob.identityKey,
            variety: Variety.GOLDEN_DELICIOUS,
            index: 9
          }),
          expect.objectContaining({
            creator: bob.identityKey,
            variety: Variety.HONEYCRISP,
            index: 1
          }),
          expect.objectContaining({
            creator: bob.identityKey,
            variety: Variety.HONEYCRISP,
            index: 2
          }),
          expect.objectContaining({
            creator: bob.identityKey,
            variety: Variety.HONEYCRISP,
            index: 3
          }),
          expect.objectContaining({
            creator: bob.identityKey,
            variety: Variety.HONEYCRISP,
            index: 4
          }),
          expect.objectContaining({
            creator: bob.identityKey,
            variety: Variety.MCINTOSH,
            index: 5
          }),
          expect.objectContaining({
            creator: bob.identityKey,
            variety: Variety.MCINTOSH,
            index: 6
          }),
          expect.objectContaining({
            creator: bob.identityKey,
            variety: Variety.MCINTOSH,
            index: 7
          }),
          expect.objectContaining({
            creator: bob.identityKey,
            variety: Variety.MCINTOSH,
            index: 8
          })
        ],
        metadata: { bookmark: "", fetchedRecordsCount: 11 }
      })
    );
  });

  it("@READ (Unpaginated): Returns entries by creator (Amelia)...", async () => {
    const dto = new FetchTreesDto(amelia.identityKey);
    const response = await client.contract.FetchTrees(dto.signed(user.privateKey));

    expect(response).toEqual(
      transactionSuccess({
        results: [
          expect.objectContaining({
            creator: amelia.identityKey,
            variety: Variety.GALA,
            index: 13
          }),
          expect.objectContaining({
            creator: amelia.identityKey,
            variety: Variety.GALA,
            index: 14
          }),
          expect.objectContaining({
            creator: amelia.identityKey,
            variety: Variety.GALA,
            index: 15
          }),
          expect.objectContaining({
            creator: amelia.identityKey,
            variety: Variety.GALA,
            index: 16
          }),
          expect.objectContaining({
            creator: amelia.identityKey,
            variety: Variety.GOLDEN_DELICIOUS,
            index: 12
          })
        ],
        metadata: { bookmark: "", fetchedRecordsCount: 5 }
      })
    );
  });

  it("@READ (Unpaginated): Returns entries by creator AND variety", async () => {
    const dto = new FetchTreesDto(amelia.identityKey, Variety.GALA);
    const response = await client.contract.FetchTrees(dto.signed(user.privateKey));

    expect(response).toEqual(
      transactionSuccess({
        results: [
          expect.objectContaining({
            creator: amelia.identityKey,
            variety: Variety.GALA,
            index: 13
          }),
          expect.objectContaining({
            creator: amelia.identityKey,
            variety: Variety.GALA,
            index: 14
          }),
          expect.objectContaining({
            creator: amelia.identityKey,
            variety: Variety.GALA,
            index: 15
          }),
          expect.objectContaining({
            creator: amelia.identityKey,
            variety: Variety.GALA,
            index: 16
          })
        ],
        metadata: { bookmark: "", fetchedRecordsCount: 4 }
      })
    );
  });

  it("@READ (Unpaginated): Returns individual entry", async () => {
    const dto = new FetchTreesDto(amelia.identityKey, Variety.GALA, 13);
    const response = await client.contract.FetchTrees(dto.signed(user.privateKey));

    expect(response).toEqual(
      transactionSuccess({
        results: [
          expect.objectContaining({
            creator: amelia.identityKey,
            variety: Variety.GALA,
            index: 13
          })
        ],
        metadata: { bookmark: "", fetchedRecordsCount: 1 }
      })
    );
  });

  it("@READ (Paginated): Returns all entries...", async () => {
    const dto = new FetchTreesDto(undefined, undefined, undefined, "");
    const response = await client.contract.FetchTrees(dto.signed(user.privateKey));
    const metadata = response.Data?.metadata;

    const fetchedRecordsCount = metadata?.fetchedRecordsCount ?? 0;
    expect(fetchedRecordsCount % 16).toEqual(0);
  });

  it("@READ (Paginated): Returns entries by creator (Bob)...", async () => {
    const dto = new FetchTreesDto(bob.identityKey, undefined, undefined, "");
    const response = await client.contract.FetchTrees(dto.signed(user.privateKey));

    expect(response).toEqual(
      transactionSuccess({
        results: [
          expect.objectContaining({
            creator: bob.identityKey,
            variety: Variety.GOLDEN_DELICIOUS,
            index: 10
          }),
          expect.objectContaining({
            creator: bob.identityKey,
            variety: Variety.GOLDEN_DELICIOUS,
            index: 11
          }),
          expect.objectContaining({
            creator: bob.identityKey,
            variety: Variety.GOLDEN_DELICIOUS,
            index: 9
          }),
          expect.objectContaining({
            creator: bob.identityKey,
            variety: Variety.HONEYCRISP,
            index: 1
          }),
          expect.objectContaining({
            creator: bob.identityKey,
            variety: Variety.HONEYCRISP,
            index: 2
          }),
          expect.objectContaining({
            creator: bob.identityKey,
            variety: Variety.HONEYCRISP,
            index: 3
          }),
          expect.objectContaining({
            creator: bob.identityKey,
            variety: Variety.HONEYCRISP,
            index: 4
          }),
          expect.objectContaining({
            creator: bob.identityKey,
            variety: Variety.MCINTOSH,
            index: 5
          }),
          expect.objectContaining({
            creator: bob.identityKey,
            variety: Variety.MCINTOSH,
            index: 6
          }),
          expect.objectContaining({
            creator: bob.identityKey,
            variety: Variety.MCINTOSH,
            index: 7
          }),
          expect.objectContaining({
            creator: bob.identityKey,
            variety: Variety.MCINTOSH,
            index: 8
          })
        ],
        metadata: { bookmark: "", fetchedRecordsCount: 11 }
      })
    );
  });

  it("@READ (Paginated): Returns entries by creator (Amelia)...", async () => {
    const dto = new FetchTreesDto(amelia.identityKey, undefined, undefined, "");
    const response = await client.contract.FetchTrees(dto.signed(user.privateKey));

    expect(response).toEqual(
      transactionSuccess({
        results: [
          expect.objectContaining({
            creator: amelia.identityKey,
            variety: Variety.GALA,
            index: 13
          }),
          expect.objectContaining({
            creator: amelia.identityKey,
            variety: Variety.GALA,
            index: 14
          }),
          expect.objectContaining({
            creator: amelia.identityKey,
            variety: Variety.GALA,
            index: 15
          }),
          expect.objectContaining({
            creator: amelia.identityKey,
            variety: Variety.GALA,
            index: 16
          }),
          expect.objectContaining({
            creator: amelia.identityKey,
            variety: Variety.GOLDEN_DELICIOUS,
            index: 12
          })
        ],
        metadata: { bookmark: "", fetchedRecordsCount: 5 }
      })
    );
  });

  it("@READ (Paginated): Returns entries by creator AND variety", async () => {
    const dto = new FetchTreesDto(amelia.identityKey, Variety.GALA, undefined, "");
    const response = await client.contract.FetchTrees(dto.signed(user.privateKey));

    expect(response).toEqual(
      transactionSuccess({
        results: [
          expect.objectContaining({
            creator: amelia.identityKey,
            variety: Variety.GALA,
            index: 13
          }),
          expect.objectContaining({
            creator: amelia.identityKey,
            variety: Variety.GALA,
            index: 14
          }),
          expect.objectContaining({
            creator: amelia.identityKey,
            variety: Variety.GALA,
            index: 15
          }),
          expect.objectContaining({
            creator: amelia.identityKey,
            variety: Variety.GALA,
            index: 16
          })
        ],
        metadata: { bookmark: "", fetchedRecordsCount: 4 }
      })
    );
  });

  it("@READ (Paginated): Returns individual entry", async () => {
    const dto = new FetchTreesDto(amelia.identityKey, Variety.GALA, 13, "");
    const response = await client.contract.FetchTrees(dto.signed(user.privateKey));

    expect(response).toEqual(
      transactionSuccess({
        results: [
          expect.objectContaining({
            creator: amelia.identityKey,
            variety: Variety.GALA,
            index: 13
          })
        ],
        metadata: { bookmark: "", fetchedRecordsCount: 1 }
      })
    );
  });

  const bookmarkFrom = (identityKey: string, variety: string, index: number): string =>
    `\x00${AppleTree.INDEX_KEY}\x00${identityKey}\x00${variety}\x00${index}\x00`;
  // `${AppleTree.INDEX_KEY}${identityKey}${variety}${index}`;

  let bookmark1: string | undefined;
  it("Paginates correctly (Part 1)", async () => {
    const dto = new FetchTreesDto(bob.identityKey, undefined, undefined, "", 4);
    const response = await client.contract.FetchTrees(dto.signed(user.privateKey));
    bookmark1 = response.Data?.metadata.bookmark;

    expect(response.Data?.results).toStrictEqual([
      new AppleTree(
        bob.identityKey,
        Variety.GOLDEN_DELICIOUS,
        10,
        response.Data?.results[0].creationTimestamp || 0
      ),
      new AppleTree(
        bob.identityKey,
        Variety.GOLDEN_DELICIOUS,
        11,
        response.Data?.results[1].creationTimestamp || 0
      ),
      new AppleTree(
        bob.identityKey,
        Variety.GOLDEN_DELICIOUS,
        9,
        response.Data?.results[2].creationTimestamp || 0
      ),
      new AppleTree(bob.identityKey, Variety.HONEYCRISP, 1, response.Data?.results[3].creationTimestamp || 0)
    ]);

    if (response.Data)
      for (const entry of response.Data?.results) expect(entry.creationTimestamp).toBeGreaterThan(0);

    expect(response.Data?.metadata.fetchedRecordsCount).toEqual(4);

    const expectedBookmark = bookmarkFrom(bob.identityKey, Variety.HONEYCRISP, 2);
    expect(bookmark1).toStrictEqual(expectedBookmark);
  });

  let bookmark2: string | undefined;
  it("Paginates correctly (Part 2)", async () => {
    const dto = new FetchTreesDto(bob.identityKey, undefined, undefined, bookmark1, 4);
    const response = await client.contract.FetchTrees(dto.signed(user.privateKey));
    bookmark2 = response.Data?.metadata.bookmark;

    expect(response.Data?.results).toStrictEqual([
      new AppleTree(bob.identityKey, Variety.HONEYCRISP, 2, response.Data?.results[0].creationTimestamp || 0),
      new AppleTree(bob.identityKey, Variety.HONEYCRISP, 3, response.Data?.results[1].creationTimestamp || 0),
      new AppleTree(bob.identityKey, Variety.HONEYCRISP, 4, response.Data?.results[2].creationTimestamp || 0),
      new AppleTree(bob.identityKey, Variety.MCINTOSH, 5, response.Data?.results[3].creationTimestamp || 0)
    ]);

    if (response.Data)
      for (const entry of response.Data?.results) expect(entry.creationTimestamp).toBeGreaterThan(0);

    expect(response.Data?.metadata.fetchedRecordsCount).toEqual(4);

    const expectedBookmark = bookmarkFrom(bob.identityKey, Variety.MCINTOSH, 6);
    expect(bookmark2).toStrictEqual(expectedBookmark);
  });

  it("Paginates correctly (Part 3)", async () => {
    const dto = new FetchTreesDto(bob.identityKey, undefined, undefined, bookmark2, 4);
    const response = await client.contract.FetchTrees(dto.signed(user.privateKey));

    expect(response.Data?.results).toStrictEqual([
      new AppleTree(bob.identityKey, Variety.MCINTOSH, 6, response.Data?.results[0].creationTimestamp || 0),
      new AppleTree(bob.identityKey, Variety.MCINTOSH, 7, response.Data?.results[1].creationTimestamp || 0),
      new AppleTree(bob.identityKey, Variety.MCINTOSH, 8, response.Data?.results[0].creationTimestamp || 0)
    ]);

    if (response.Data)
      for (const entry of response.Data?.results) expect(entry.creationTimestamp).toBeGreaterThan(0);

    expect(response.Data?.metadata.fetchedRecordsCount).toEqual(3);

    const expectedBookmark = "";
    expect(response.Data?.metadata.bookmark).toStrictEqual(expectedBookmark);
  });

  it("@UPDATE: throws an error if tree is < 1yo", async () => {
    const dto = new HarvestAppleDto(amelia.identityKey, Variety.GALA, 13);
    const response = await client.contract.HarvestApple(dto.signed(user.privateKey));
    expect(response["Message"]).toEqual("No Apples to Harvest!");
    //
    const params = new FetchTreesDto(amelia.identityKey, Variety.GALA, 13);
    const lookup = await client.contract.FetchTrees(params.signed(user.privateKey));
    expect(lookup.Data?.results[0].timesHarvested.toFixed()).toBe("0");
  });

  // TODO: Find a way to time travel
  xit("@UPDATE: allows users to pick apples", async () => {
    const dto = new HarvestAppleDto(amelia.identityKey, Variety.GALA, 13);
    // time travel ahead 1 year
    await client.contract.HarvestApple(dto.signed(user.privateKey));
    //
    const params = new FetchTreesDto(amelia.identityKey, Variety.GALA, 13);
    const lookup = await client.contract.FetchTrees(params.signed(user.privateKey));
    expect(lookup.Data?.results[0].timesHarvested.toFixed()).toBe("1");
  });
});
