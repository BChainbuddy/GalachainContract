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
  const studentKey = `${Student.INDEX_KEY}:${dto.studentId}`;
  console.log(`Fetching student with key: ${studentKey}`);
  console.log(`New grade to add: ${dto.grade}`);

  let students: Student[];
  try {
    students = await getObjectsByPartialCompositeKey(ctx, Student.INDEX_KEY, [dto.studentId.toString()], Student);
    if (students.length === 0) {
      throw new NotFoundError(`Student with ID ${dto.studentId} not found.`);
    }
  } catch (e) {
    console.error(`Error fetching student with ID ${dto.studentId}: ${e.message}`);
    throw new NotFoundError(`Student with ID ${dto.studentId} not found.`);
  }

  const student = students[0];
  console.log(`Student found: ${JSON.stringify(student)}`);

  student.grades.push(dto.grade);
  console.log(`Updated student grades: ${student.grades}`);

  await putChainObject(ctx, student);
  console.log(`Student grades updated and stored.`);
}

