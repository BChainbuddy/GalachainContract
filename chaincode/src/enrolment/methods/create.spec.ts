import { GalaContract } from "@gala-chain/chaincode";
import { ChainUser } from "@gala-chain/client";
import { fixture, writesMap } from "@gala-chain/test";

import { Student, Course } from "../object";
import { EnrollStudentDto, enrollStudent } from "./create";

class TestContract extends GalaContract {
  constructor() {
    super("TestContract", "0.0.1");
  }
}

describe("ENROLL FUNCTIONS", () => {
  it("should allow users to enroll students", async () => {
    const user = ChainUser.withRandomKeys();

    const { ctx, writes } = fixture(TestContract).callingUser(user);

    const student1Dto = new EnrollStudentDto("John Doe", Course.MATH);
    const student2Dto = new EnrollStudentDto("Jane Smith", Course.ENGLISH);

    await enrollStudent(ctx, student1Dto);
    await enrollStudent(ctx, student2Dto);

    const expectedStudent1 = new Student(1, "John Doe", Course.MATH);
    const expectedStudent2 = new Student(2, "Jane Smith", Course.ENGLISH);

    await ctx.stub.flushWrites();

    const expectedWrites = writesMap(expectedStudent1, expectedStudent2);

    // Remove enrolmentDate from comparison
    function removeEnrolmentDate(obj: any) {
      const parsedObj = JSON.parse(obj);
      delete parsedObj.enrolmentDate;
      return JSON.stringify(parsedObj);
    }

    const processedWrites = Object.fromEntries(
      Object.entries(writes).map(([key, value]) => [key, removeEnrolmentDate(value)])
    );

    const processedExpectedWrites = Object.fromEntries(
      Object.entries(expectedWrites).map(([key, value]) => [key, removeEnrolmentDate(value)])
    );

    expect(processedWrites).toEqual(processedExpectedWrites);
  });
});
