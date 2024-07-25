import { GalaContract } from "@gala-chain/chaincode";
import { ChainUser } from "@gala-chain/client";
import { fixture, writesMap } from "@gala-chain/test";

import { Student, Course } from "../object";
import { FetchStudentDataDto, fetchStudent, StudentDataDto } from "./read";
import { enrollStudent, EnrollStudentDto } from "./create";
import { NewGradeDto, addNewGrade } from "./update"

class TestContract extends GalaContract {
  constructor() {
    super("TestContract", "0.0.1");
  }
}

describe("UPDATES THE STUDENT", () => {
    it("It should update the student grades", async() => {

        const user = ChainUser.withRandomKeys();

        const { ctx, writes } = fixture(TestContract).callingUser(user)

            /// Enrolling the student
        const student1Dto = new EnrollStudentDto("John Doe", Course.MATH);
        await enrollStudent(ctx, student1Dto);

        await ctx.stub.flushWrites();

        // Updating the grades of the student
        const newGrade = new NewGradeDto(1, 7);
        await addNewGrade(ctx, newGrade);

        await ctx.stub.flushWrites();

        // Fetching the student
        const studentData = new FetchStudentDataDto(1, "John Doe")

        const response = await fetchStudent(ctx, studentData)

        const newStudent = new Student(1, "John Doe", Course.MATH)

        const expectedStudent = new StudentDataDto([newStudent], { bookmark: '', fetchedRecordsCount: 1 })

        // Check
        expect(response["results"][0]["grades"][0]).toEqual(7)
        expect(response["results"][0]["studentId"]).toEqual(expectedStudent["results"][0]["studentId"])
    })
})