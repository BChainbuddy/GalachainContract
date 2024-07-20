import { GalaContract } from "@gala-chain/chaincode";
import { ChainUser } from "@gala-chain/client";
import { fixture } from "@gala-chain/test";

import { AppleTree, Variety } from "../object";
import { AppleTreeDto, AppleTreesDto, plantTree, plantTrees } from "./create";
import { FetchTreesDto, fetchTrees } from "./read";

class TestContract extends GalaContract {
  constructor() {
    super("TestContract", "0.0.1");
  }
}

function prepareData(
  ctx,
  variety: Variety,
  startIdx: number,
  endIdx: number
): { dtos: AppleTreeDto[]; objects: AppleTree[] } {
  let dtos: AppleTreeDto[] = [];
  let objects: AppleTree[] = [];
  for (let idx = startIdx; idx <= endIdx; idx++) {
    dtos.push(new AppleTreeDto(variety, idx));
    objects.push(new AppleTree(ctx.callingUser, variety, idx, ctx.txUnixTime));
  }
  return { dtos, objects };
}

async function plantMany(ctx) {
  const honey = prepareData(ctx, Variety.HONEYCRISP, 1, 4);
  const mac = prepareData(ctx, Variety.MCINTOSH, 5, 8);
  const gold = prepareData(ctx, Variety.GOLDEN_DELICIOUS, 9, 11);
  let expected: AppleTree[] = [...honey.objects, ...mac.objects, ...gold.objects];
  const pluralDto = new AppleTreesDto([...honey.dtos, ...mac.dtos, ...gold.dtos]);
  await plantTrees(ctx, pluralDto);
  return expected;
}

async function plantOne(ctx, variety: Variety, idx: number) {
  const dto = new AppleTreeDto(variety, idx);
  const obj = new AppleTree(ctx.callingUser, dto.variety, dto.index, ctx.txUnixTime);
  await plantTree(ctx, dto);
  return obj;
}

async function plantIndividuals(ctx) {
  const gold4 = await plantOne(ctx, Variety.GOLDEN_DELICIOUS, 12);
  const gala1 = await plantOne(ctx, Variety.GALA, 13);
  const gala2 = await plantOne(ctx, Variety.GALA, 14);
  const gala3 = await plantOne(ctx, Variety.GALA, 15);
  const gala4 = await plantOne(ctx, Variety.GALA, 16);
  return [gold4, gala1, gala2, gala3, gala4];
}

async function plantAll(ctx) {
  const round1Data = await plantMany(ctx);
  const round2Data = await plantIndividuals(ctx);
  const expected: AppleTree[] = [...round1Data, ...round2Data];
  return expected;
}

describe("READ FUNCTIONS (unpaginated)", () => {
  it("Returns all entries...", async () => {
    // Given
    const contract = fixture(TestContract);
    const { ctx } = contract.callingUser(ChainUser.withRandomKeys());
    const expected = await plantAll(ctx);

    // When
    const dto = new FetchTreesDto();
    const { results, metadata } = await fetchTrees(ctx, dto);

    // Then
    const expectedMetadata = { bookmark: "", fetchedRecordsCount: 16 };
    expect(JSON.stringify(metadata)).toBe(JSON.stringify(expectedMetadata));
    expect(results).toEqual(expected);
  });

  it("Returns entries by creator...", async () => {
    // Given
    const contract = fixture(TestContract);
    const { ctx } = contract.callingUser(ChainUser.withRandomKeys());
    const expected = await plantAll(ctx);

    // When
    const dto = new FetchTreesDto(ctx.callingUser);
    const { results, metadata } = await fetchTrees(ctx, dto);

    // Then
    const expectedMetadata = { bookmark: "", fetchedRecordsCount: 16 };
    expect(JSON.stringify(metadata)).toBe(JSON.stringify(expectedMetadata));
    expect(results).toEqual(expected);
  });

  it("Returns entries by creator AND variety", async () => {
    // Given
    const contract = fixture(TestContract);
    const { ctx } = contract.callingUser(ChainUser.withRandomKeys());
    const expected = await plantAll(ctx);

    // When
    const dto = new FetchTreesDto(ctx.callingUser, Variety.GALA);
    const { results, metadata } = await fetchTrees(ctx, dto);

    // Then
    const expectedMetadata = { bookmark: "", fetchedRecordsCount: 4 };
    expect(JSON.stringify(metadata)).toBe(JSON.stringify(expectedMetadata));
    expect(results).toEqual(expected.slice(12, 16));
  });

  it("Returns individual entry", async () => {
    // Given
    const contract = fixture(TestContract);
    const { ctx } = contract.callingUser(ChainUser.withRandomKeys());
    const expected = await plantAll(ctx);

    // When
    const dto = new FetchTreesDto(ctx.callingUser, Variety.GALA, 13);
    const { results, metadata } = await fetchTrees(ctx, dto);

    // Then
    const expectedMetadata = { bookmark: "", fetchedRecordsCount: 1 };
    expect(JSON.stringify(metadata)).toBe(JSON.stringify(expectedMetadata));
    expect(results).toEqual([expected[12]]);
  });
});

xdescribe("READ FUNCTIONS (paginated)", () => {
  // NOTE: Pagination only works on E2E testing
  it("Returns all entries...", async () => {
    // Given
    const contract = fixture(TestContract);
    const { ctx } = contract.callingUser(ChainUser.withRandomKeys());
    const expected = await plantAll(ctx);

    // When
    const dto = new FetchTreesDto(undefined, undefined, undefined, "");
    const { results, metadata } = await fetchTrees(ctx, dto);

    // Then
    const expectedMetadata = { bookmark: "", fetchedRecordsCount: 16 };
    expect(JSON.stringify(metadata)).toBe(JSON.stringify(expectedMetadata));
    expect(results).toEqual(expected);
  });

  it("Returns entries by creator...", async () => {
    // Given
    const contract = fixture(TestContract);
    const { ctx } = contract.callingUser(ChainUser.withRandomKeys());
    const expected = await plantAll(ctx);

    // When
    const dto = new FetchTreesDto(ctx.callingUser, undefined, undefined, "", 1024);
    const { results, metadata } = await fetchTrees(ctx, dto);

    // Then
    const expectedMetadata = { bookmark: "", fetchedRecordsCount: 16 };
    expect(JSON.stringify(metadata)).toBe(JSON.stringify(expectedMetadata));
    expect(results).toEqual(expected);
  });

  it("Returns entries by creator AND variety", async () => {
    // Given
    const contract = fixture(TestContract);
    const { ctx } = contract.callingUser(ChainUser.withRandomKeys());
    const expected = await plantAll(ctx);

    // When
    const dto = new FetchTreesDto(ctx.callingUser, Variety.GALA, undefined, "", 1024);
    const { results, metadata } = await fetchTrees(ctx, dto);

    // Then
    const expectedMetadata = { bookmark: "", fetchedRecordsCount: 4 };
    expect(JSON.stringify(metadata)).toBe(JSON.stringify(expectedMetadata));
    expect(results).toEqual(expected.slice(12, 16));
  });

  it("Returns individual entry", async () => {
    // Given
    const contract = fixture(TestContract);
    const { ctx } = contract.callingUser(ChainUser.withRandomKeys());
    const expected = await plantAll(ctx);

    // When
    const dto = new FetchTreesDto(ctx.callingUser, Variety.GALA, 13, "", 1024);
    const { results, metadata } = await fetchTrees(ctx, dto);

    // Then
    const expectedMetadata = { bookmark: "", fetchedRecordsCount: 1 };
    expect(JSON.stringify(metadata)).toBe(JSON.stringify(expectedMetadata));
    expect(results).toEqual([expected[12]]);
  });

  it("Limits the amount of entries returned", async () => {});
  it("Has working pagination", async () => {});
});
