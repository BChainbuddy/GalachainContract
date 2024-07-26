import { Evaluate, GalaChainContext, GalaContract, Submit } from "@gala-chain/chaincode";

import { version } from "../../package.json";
import { EnrollStudentDto, enrollStudent } from "./methods/create";
import { FetchStudentDataDto,StudentDataDto, fetchStudent } from "./methods/read";
import { NewGradeDto, addNewGrade } from "./methods/update";

export const contractName = "StudentEnrolment";

export class StudentEnrolment extends GalaContract {
  constructor() {
    super(contractName, version);
  }

  @Submit({
    description: "Enroll Student",
    in: EnrollStudentDto
  }) 
  public async EnrollStudent(ctx: GalaChainContext, dto: EnrollStudentDto): Promise<void> {
    return await enrollStudent(ctx, dto)
  }

  @Submit({
    description: "Add grade",
    in: NewGradeDto
  })
  public async AddNewGrade(ctx: GalaChainContext, dto: NewGradeDto): Promise<void> {
    return await addNewGrade(ctx, dto)
  }

  @Evaluate({
    description: "returns student data",
    in: FetchStudentDataDto,
    out: StudentDataDto
  })
  public async FetchStudent(ctx: GalaChainContext, dto: FetchStudentDataDto): Promise<StudentDataDto> {
    return await fetchStudent(ctx, dto)
  }
}
