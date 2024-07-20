import { GalaContract } from "@gala-chain/chaincode";
import { ChainUser } from "@gala-chain/client";
import { fixture } from "@gala-chain/test";

import { AppleTree, Variety } from "../object";
import { AppleTreeDto, AppleTreesDto, plantTree, plantTrees } from "./create";
import { FetchTreesDto, fetchTrees } from "./read";
import { HarvestAppleDto, harvestApple } from "./update";

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

describe("UPDATE FUNCTIONS", () => {
  // NOTE: Requires time travel. Cannot test outside of E2E
  xit("allows users to pick apples", async () => {
    // Given
    const contract = fixture(TestContract);
    const { ctx } = contract.callingUser(ChainUser.withRandomKeys());
    await plantAll(ctx);

    // When
    const dto = new HarvestAppleDto(ctx.callingUser, Variety.GALA, 13);
    await harvestApple(ctx, dto);

    // Then
    const params = new FetchTreesDto(ctx.callingUser, Variety.GALA, 13);
    const { results } = await fetchTrees(ctx, params);
    expect(results[0].timesHarvested.toFixed()).toBe("1");
  });

  it("throws an error if tree is < 1yo", async () => {
    // Given
    const contract = fixture(TestContract);
    const { ctx } = contract.callingUser(ChainUser.withRandomKeys());
    await plantAll(ctx);

    try {
      // When
      const dto = new HarvestAppleDto(ctx.callingUser, Variety.GALA, 13);
      await harvestApple(ctx, dto);
    } catch (error) {
      // Then
      expect(error.message).toMatch("No Apples to Harvest!");
    }

    // Then
    const params = new FetchTreesDto(ctx.callingUser, Variety.GALA, 13);
    const { results } = await fetchTrees(ctx, params);
    expect(results[0].timesHarvested.toFixed()).toBe("0");
  });
});
