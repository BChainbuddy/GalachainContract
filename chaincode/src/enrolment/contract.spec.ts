import { ChainUser } from "@gala-chain/client";
import { fixture, transactionSuccess, writesMap } from "@gala-chain/test";
import { StudentEnrolment } from "./contract";
import { EnrollStudentDto } from "./methods/create";
import { Course, Student } from "./object";
import { NewGradeDto } from "./methods/update";
import { FetchStudentDataDto, StudentDataDto } from "./methods/read";

it("should allow enrolment of student", async () => {
  // Given
  const user = ChainUser.withRandomKeys(); // Ensure unique user
  const { contract, ctx, writes } = fixture(StudentEnrolment).callingUser(user);
  const dto = new EnrollStudentDto("John Doe", Course.MATH);
  const expectedStudent = new Student(1, dto.name, dto.course);
  const expectedWrites = writesMap(expectedStudent);

  // When
  const response = await contract.EnrollStudent(ctx, dto);

  // Then
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

  expect(response).toEqual(transactionSuccess());
  expect(processedWrites).toEqual(processedExpectedWrites);
});

it("Should update grades", async () => {
  // Given
  const user = ChainUser.withRandomKeys(); // Ensure unique user
  const {contract, ctx, writes} = fixture(StudentEnrolment)
  .callingUser(user)
  .savedState(new Student(1, "John Doe", Course.MATH));
  const newGradeDto = new NewGradeDto(1, 8);
  const expectedWrites = writesMap(new Student(1, "John Doe", Course.MATH));


  // When
  const responseAddGrade = await contract.AddNewGrade(ctx, newGradeDto);
  await ctx.stub.flushWrites();

  // Then
  function removeEnrolmentDate(obj: any) {
    const parsedObj = JSON.parse(obj);
    delete parsedObj.enrolmentDate;
    return JSON.stringify(parsedObj);
  }

  function addGrade(obj: any) {
    const parsedObj = JSON.parse(obj);
    delete parsedObj.enrolmentDate;
    parsedObj.grades = [8]
    return JSON.stringify(parsedObj);
  }

  const processedWrites = Object.fromEntries(
    Object.entries(writes).map(([key, value]) => [key, removeEnrolmentDate(value)])
  );

  const processedExpectedWrites = Object.fromEntries(
    Object.entries(expectedWrites).map(([key, value]) => [key, addGrade(value)])
  );

  expect(responseAddGrade).toEqual(transactionSuccess());
  expect(processedWrites).toEqual(processedExpectedWrites);
});

it("Should find the student", async () => {
  // Given
  const user = ChainUser.withRandomKeys(); // Ensure unique user
  const {contract, ctx, writes} = fixture(StudentEnrolment)
  .callingUser(user)
  .savedState(new Student(1, "John Doe", Course.MATH));
  const studentDto = new FetchStudentDataDto(1, "John Doe")

  // When
  const response = await contract.FetchStudent(ctx, studentDto)
  const expectedStudent = new StudentDataDto([new Student(1, "John Doe", Course.MATH)], { bookmark: '', fetchedRecordsCount: 1 })

  // Then
  expect(response["Data"]["results"][0]["course"]).toEqual(expectedStudent["results"][0]["course"])
  expect(response["Data"]["results"][0]["grades"]).toEqual(expectedStudent["results"][0]["grades"])
  expect(response["Data"]["results"][0]["studentId"]).toEqual(expectedStudent["results"][0]["studentId"])
  expect(response["Data"]["results"][0]["name"]).toEqual(expectedStudent["results"][0]["name"])
  
})
