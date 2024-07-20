import { GalaContract } from "@gala-chain/chaincode";
import { ChainUser } from "@gala-chain/client";
import { fixture, writesMap } from "@gala-chain/test";

import { AppleTree, Variety } from "../object";
import { AppleTreeDto, AppleTreesDto, plantTree, plantTrees } from "./create";

class TestContract extends GalaContract {
  constructor() {
    super("TestContract", "0.0.1");
  }
}
describe("CREATE FUNCTIONS", () => {
  it("should allow users to plant fruit trees", async () => {
    const user = ChainUser.withRandomKeys();

    const { ctx, writes } = fixture(TestContract).callingUser(user);

    const honey = new AppleTreeDto(Variety.HONEYCRISP, 1);
    const mac = new AppleTreeDto(Variety.MCINTOSH, 2);
    const dto = new AppleTreesDto([honey, mac]);

    let expectedTrees: AppleTree[] = dto.trees.map(
      (tree) => new AppleTree(user.identityKey, tree.variety, tree.index, ctx.txUnixTime)
    );

    const res1 = await plantTrees(ctx, dto);
    expect(res1).toEqual(expectedTrees);

    const gold = new AppleTreeDto(Variety.GOLDEN_DELICIOUS, 3);
    const res2 = await plantTree(ctx, gold);
    expectedTrees.push(new AppleTree(user.identityKey, gold.variety, gold.index, ctx.txUnixTime));
    expect(res2).toEqual(expectedTrees[2]);

    await ctx.stub.flushWrites();
    expect(writes).toEqual(writesMap(...expectedTrees));
  });
});
