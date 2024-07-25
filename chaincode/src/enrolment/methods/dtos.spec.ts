import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { FetchStudentDataDto } from "./read";

describe("Dto validation", () => {
  it("should accept valid input for FetchStudentDataDto", async () => {
    // Given
    const valid1 = {};
    const valid2 = { studentId: 1 };
    const valid3 = { name: "John Doe" };
    const valid4 = { studentId: 1, name: "John Doe" };
  
    const expectValid = [];
  
    // When
    const results = [valid1, valid2, valid3, valid4].map((o) => plainToInstance(FetchStudentDataDto, o).validate());
  
    // Then
    const validationResults = await Promise.all(results.map(result => validate(result)));
    validationResults.forEach(result => {
      expect(result).toEqual(expectValid);
    });
  });
})
