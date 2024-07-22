import { ChainCallDTO, ConflictError, StringEnumProperty, ChainKey, ChainObject, NotFoundError } from "@gala-chain/api";
import { GalaChainContext, getObjectByKey, putChainObject, getObjectsByPartialCompositeKey } from "@gala-chain/chaincode";
//
import { Type } from "class-transformer";
import { IsInt, IsString } from "class-validator";

import { Student, Course, StudentCounter
 } from "../object";

export class EnrollStudentDto extends ChainCallDTO {
  @IsString()
  public readonly name: string;

  @StringEnumProperty(Course)
  public readonly course: Course;

  constructor(name: string, course: Course) {
    super();
    this.name = name;
    this.course = course;
  }
}

export async function fetchAllStudents(ctx: GalaChainContext): Promise<Student[]> {
  const students = await getObjectsByPartialCompositeKey(ctx, Student.INDEX_KEY, [], Student);
  return students;
}

export async function enrollStudent(ctx: GalaChainContext, dto: EnrollStudentDto): Promise<void> {
  const students = await fetchAllStudents(ctx);

  const highestStudentId = students.reduce((maxId, student) => Math.max(maxId, student.studentId), 0);
  const newStudentId = highestStudentId + 1;

  const newStudent = new Student(newStudentId, dto.name, dto.course);

  await putChainObject(ctx, newStudent);
}

