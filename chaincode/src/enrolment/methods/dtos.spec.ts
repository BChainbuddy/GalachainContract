import { plainToInstance } from "class-transformer";

import { Variety } from "../object";
import { FetchTreesDto } from "./dtos";

it("should accept valid input", async () => {
  // Given
  const valid1 = {};
  const valid2 = { creator: "somebody" };
  const valid3 = { creator: "somebody", variety: Variety.GALA };
  const valid4 = { creator: "somebody", variety: Variety.GALA, index: 1 };

  const expectValid = [];

  // When
  const results = [valid1, valid2, valid3, valid4].map((o) => plainToInstance(FetchTreesDto, o).validate());

  // Then
  expect(await Promise.all(results)).toEqual([expectValid, expectValid, expectValid, expectValid]);
});
