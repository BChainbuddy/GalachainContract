import { AppleTree, Variety } from "./object";

let index = 0;
const user = (): string => `user${index}`;

it("initializes correctly", () => {
  const creationTimestamp = 456;
  const tree = new AppleTree(user(), Variety.GALA, index, creationTimestamp);
  expect(tree.index).toEqual(index);
  expect(tree.creator).toEqual(user());
  expect(tree.variety).toEqual(Variety.GALA);
  expect(tree.creationTimestamp).toEqual(creationTimestamp);
  expect(tree.timesHarvested.toFixed()).toEqual("0");
});

const harvestTimestamp = (timestamp: number, age: number): number =>
  Math.floor(timestamp + age * 365 * 24 * 60 * 60 * 1000);

const numExpected = (age: number) => 2 ** (age - 1);

test.each([[0], [1], [3], [8]])(`trees age correctly`, (age) => {
  index++;
  const creationTimestamp = 0;
  const tree = new AppleTree(user(), Variety.GOLDEN_DELICIOUS, index, creationTimestamp);

  const atTime = harvestTimestamp(creationTimestamp, age);

  expect(tree.age(atTime).toFixed()).toEqual(age.toString());
  const numFruit = age === 0 ? "0" : numExpected(age).toString();
  expect(tree.numFruit(atTime).toFixed()).toEqual(numFruit);
  expect(tree.hasFruit(atTime)).toEqual(age !== 0);
});

// ifCanHarvest
it("does not let the user harvest fruit at first", () => {
  index++;
  const creationTimestamp = 0;
  const tree = new AppleTree(user(), Variety.GOLDEN_DELICIOUS, index, creationTimestamp);

  const age = 0;
  const atTime = harvestTimestamp(creationTimestamp, age);

  const harvest = () => tree.ifCanHarvest(atTime).thenHarvest();

  expect(harvest).toThrowError("No Apples to Harvest!");
});

it("lets the user harvest fruit after a year", () => {
  index++;
  const creationTimestamp = 0;
  const tree = new AppleTree(user(), Variety.GOLDEN_DELICIOUS, index, creationTimestamp);

  const age = 1;
  const atTime = harvestTimestamp(creationTimestamp, age);
  tree.ifCanHarvest(atTime).thenHarvest();

  expect(tree.timesHarvested.toFixed()).toEqual("1");
});

it("should fail to pick if age is negative", () => {
  index++;
  const atTime = 0;
  const age = 1;
  const creationTimestamp = harvestTimestamp(atTime, age);
  const tree = new AppleTree(user(), Variety.GOLDEN_DELICIOUS, index, creationTimestamp);

  const harvest = () => tree.ifCanHarvest(atTime).thenHarvest();

  expect(harvest).toThrowError("creationTimestamp > atTime");
});

test.each([[0], [1], [3], [8]])(`should fail to pick if no fruit is left to harvest`, (age) => {
  index++;
  // Given
  const creationTimestamp = 0;
  const tree = new AppleTree(user(), Variety.GOLDEN_DELICIOUS, index, 0);
  // When
  const isNewBorn = age === 0;
  const numFruit = isNewBorn ? 0 : numExpected(age);
  const atTime = harvestTimestamp(creationTimestamp, age);
  for (let harvests = 0; harvests <= numFruit; harvests++) {
    const received = tree.timesHarvested.toFixed();
    expect(received).toEqual(harvests.toString());
    const expectingFruit = received !== numFruit.toString();
    expect(tree.hasFruit(atTime)).toEqual(expectingFruit);
    if (expectingFruit) tree.ifCanHarvest(atTime).thenHarvest();
  }
  // Then
  expect(tree.timesHarvested.toFixed()).toEqual(numFruit.toString());
  expect(tree.hasFruit(atTime)).toEqual(false);

  const harvest = () => tree.ifCanHarvest(atTime).thenHarvest();

  expect(harvest).toThrowError("No Apples to Harvest!");
});
