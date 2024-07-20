import { ChainCallDTO, ChainError, ChainObject, ErrorCode, NotFoundError } from "@gala-chain/api";
import {
  GalaChainContext,
  getObjectsByPartialCompositeKey,
  getObjectByKey,
  takeUntilUndefined
} from "@gala-chain/chaincode";
import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested, IsInt } from "class-validator";
import { QueryResponseMetadata } from "fabric-shim";

import { Student } from "../object";
import { StudentCounter } from "./create";

export class FetchStudentDataDto extends ChainCallDTO {

  @IsInt()
  @IsOptional()
  public readonly studentId?: number

  @IsString()
  @IsOptional()
  public readonly name?: string

  constructor(studentId?: number, name?: string) {
    super();
    this.studentId = studentId;
    this.name = name;
  }

}

export class StudentDataDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Student)
  public readonly results: Student[];

  public readonly metadata: QueryResponseMetadata;

  constructor(results: Student[], metadata: QueryResponseMetadata) {
    this.results = results;
    this.metadata = metadata;
  }
}

export async function fetchStudent(ctx: GalaChainContext, dto: FetchStudentDataDto): Promise<StudentDataDto> {
  const attributes: string[] = takeUntilUndefined(dto.studentId?.toString(), dto.name);

  let results: Student[];
  let metadata: QueryResponseMetadata;

  try {
    results = await getObjectsByPartialCompositeKey(ctx, Student.INDEX_KEY, attributes, Student);
    if (results.length === 0) {
      throw new NotFoundError(`Student not found with criteria: ${JSON.stringify(dto)}`);
    }
    if (results.length > 1) {
      throw new NotFoundError(`Multiple students found with criteria: ${JSON.stringify(dto)}`);
    }
    metadata = { bookmark: "", fetchedRecordsCount: results.length };
  } catch (e) {
    throw new NotFoundError(`Error fetching student: ${e.message}`);
  }

  return new StudentDataDto(results, metadata);
}

export async function getLastStudentId(ctx: GalaChainContext): Promise<number> {
  let studentCounter: StudentCounter;

  try {
    studentCounter = await getObjectByKey(ctx, StudentCounter, StudentCounter.INDEX_KEY);
    return studentCounter.count;
  } catch (e) {
    if (e instanceof NotFoundError) {
      return 0;
    } else {
      throw e;
    }
  }
}
