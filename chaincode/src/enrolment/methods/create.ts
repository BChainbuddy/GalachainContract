import { ChainCallDTO, ConflictError, StringEnumProperty, ChainKey, ChainObject, NotFoundError } from "@gala-chain/api";
import { GalaChainContext, getObjectByKey, putChainObject } from "@gala-chain/chaincode";
//
import { Type } from "class-transformer";
import { IsInt, IsString } from "class-validator";

import { Student, Course
 } from "../object";

export class EnrollStudentDto extends ChainCallDTO {
  @IsString()
  public readonly name: string;

  @IsString()
  public readonly course: Course;

  constructor(name: string, course: Course) {
    super();
    this.name = name;
    this.course = course;
  }
}

export class StudentCounter extends ChainObject {
  @ChainKey({ position: 0 })
  public static readonly INDEX_KEY = "studentCounter";

  @IsInt()
  public count: number;

  constructor(count: number) {
    super();
    this.count = count;
  }
}

export async function enrollStudent(ctx: GalaChainContext, dto: EnrollStudentDto): Promise<void> {
  let studentCounter: StudentCounter;

  try {
    studentCounter = await getObjectByKey(ctx, StudentCounter, StudentCounter.INDEX_KEY);
  } catch (e) {
    if (e instanceof NotFoundError) {
      studentCounter = new StudentCounter(0);
    } else {
      throw e;
    }
  }

  const newStudentId = studentCounter.count + 1;
  studentCounter.count = newStudentId;

  const newStudent = new Student(newStudentId, dto.name, dto.course);

  await putChainObject(ctx, newStudent);
  await putChainObject(ctx, studentCounter);
}