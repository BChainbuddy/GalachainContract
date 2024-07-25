import { ChainCallDTO, NotFoundError, StringEnumProperty } from "@gala-chain/api";
import { GalaChainContext, getObjectByKey, putChainObject,getObjectsByPartialCompositeKey } from "@gala-chain/chaincode";
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
  const partialCompositeKey = `${Student.INDEX_KEY}:${dto.studentId}`;

  let students: Student[];
  try {
    students = await getObjectsByPartialCompositeKey(ctx, Student.INDEX_KEY, [dto.studentId.toString()], Student);
    if (students.length === 0) {
      throw new NotFoundError(`Student with ID ${dto.studentId} not found.`);
    }
  } catch (e) {
    throw new NotFoundError(`Student with ID ${dto.studentId} not found.`);
  }

  let student = students[0];
  student.grades.push(dto.grade);

  await putChainObject(ctx, student);
}


