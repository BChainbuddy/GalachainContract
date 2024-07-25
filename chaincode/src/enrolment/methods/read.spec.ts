import { GalaContract } from "@gala-chain/chaincode";
import { ChainUser } from "@gala-chain/client";
import { fixture, writesMap } from "@gala-chain/test";

import { Student, Course } from "../object";
import { FetchStudentDataDto, fetchStudent, StudentDataDto } from "./read";
import { enrollStudent, EnrollStudentDto } from "./create";

class TestContract extends GalaContract {
  constructor() {
    super("TestContract", "0.0.1");
  }
}

describe("READ STUDENT FUNCTION", () => {
  it("should read the students", async () => {
    const user = ChainUser.withRandomKeys();

    const { ctx, writes } = fixture(TestContract).callingUser(user);

    // Enrolling the student
    const student1Dto = new EnrollStudentDto("John Doe", Course.MATH);

    await enrollStudent(ctx, student1Dto);

    await ctx.stub.flushWrites();
  
    // Fetching the student
    const studentData = new FetchStudentDataDto(1, "John Doe")

    const response = await fetchStudent(ctx, studentData)

    const newStudent = new Student(1, "John Doe", Course.MATH)

    const expectedStudent = new StudentDataDto([newStudent], { bookmark: '', fetchedRecordsCount: 1 })

    // Check
    expect(response["results"][0]["course"]).toEqual(expectedStudent["results"][0]["course"])
    expect(response["results"][0]["grades"]).toEqual(expectedStudent["results"][0]["grades"])
    expect(response["results"][0]["studentId"]).toEqual(expectedStudent["results"][0]["studentId"])
    expect(response["results"][0]["name"]).toEqual(expectedStudent["results"][0]["name"])
    expect(response["results"][0]["enrolmentDate"]).not.toEqual(expectedStudent["results"][0]["enrolmentDate"])
  });
});
