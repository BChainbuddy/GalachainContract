import { GalaContract } from "@gala-chain/chaincode";
import { ChainUser } from "@gala-chain/client";
import { fixture, writesMap } from "@gala-chain/test";

import { Student, Course } from "../object";
import { enrollStudent, EnrollStudentDto } from "./create"

class TestContract extends GalaContract {
  constructor() {
    super("TestContract", "0.0.1");
  }
}


describe("READ STUDENT FUNCTION", () => {
  it("should allow users to enroll students", async () => {
    const user = ChainUser.withRandomKeys();

    const { ctx, writes } = fixture(TestContract).callingUser(user);

    const student1Dto = new EnrollStudentDto("John Doe", Course.MATH);
    const student2Dto = new EnrollStudentDto("Jane Smith", Course.ENGLISH);

    const expectedStudent1 = new Student(1, "John Doe", Course.MATH, new Date());
    const expectedStudent2 = new Student(2, "Jane Smith", Course.ENGLISH, new Date());

    await enrollStudent(ctx, student1Dto);
    await enrollStudent(ctx, student2Dto);

    await ctx.stub.flushWrites();

    expect(writes).toEqual(writesMap(expectedStudent1, expectedStudent2));
  });
});
