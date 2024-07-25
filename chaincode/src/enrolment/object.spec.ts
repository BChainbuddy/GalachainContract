import { describe } from "node:test";
import { Course, Student } from "./object";

let index = 0;
const user = (): string => `user${index}`;

describe("Testing Student Object!", () => {
  it("initializes correctly", () => {
    const student = new Student(1, "John Doe", Course.MATH)
    expect(student.studentId).toEqual(1);
    expect(student.name).toEqual("John Doe");
    expect(student.course).toEqual(Course.MATH);
    expect(student.grades).toEqual([]);
  });
  it("Is enrolled?", () => {
    const student = new Student(1, "John Doe", Course.MATH)
    expect(student.isEnroled()).toEqual(true);
  })
  
})