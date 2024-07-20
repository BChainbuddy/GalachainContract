import { ChainCallDTO, NotFoundError, StringEnumProperty } from "@gala-chain/api";
import { GalaChainContext, getObjectByKey, putChainObject } from "@gala-chain/chaincode";
import { IsString, IsInt } from "class-validator";

import { Student } from "../object";

export class NewGradeDto extends ChainCallDTO {
  @IsInt()
  public readonly studentId: number;

  @IsInt()
  public readonly grade: number;

  constructor(studentId: number, grade: number) {
    super()
    this.studentId = studentId,
    this.grade = grade
  }
}

export async function addNewGrade(ctx: GalaChainContext, dto: NewGradeDto): Promise<void> {
  let student: Student;
  try {
    student = await getObjectByKey(ctx, Student, `${Student.INDEX_KEY}:${dto.studentId}`);
  } catch (e) {
    throw new NotFoundError(`Student with ID ${dto.studentId} not found.`);
  }

  student.grades.push(dto.grade);

  await putChainObject(ctx, student);
}


