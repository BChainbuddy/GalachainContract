import { BigNumberProperty, ChainKey, ChainObject, DefaultError, StringEnumProperty } from "@gala-chain/api";
import BigNumber from "bignumber.js";
import { Exclude } from "class-transformer";
import { IsString, IsInt, IsDate } from "class-validator";

export enum Course {
  MATH = "MATH",
  ENGLISH = "ENGLISH",
  SPORTS = "SPORTS",
  BIOLOGY = "BIOLOGY",
  CHEMISTRY = "CHEMISTRY"
}

export class Student extends ChainObject {
  @Exclude()
  static INDEX_KEY = "GCFT";

  @ChainKey({ position: 0 })
  @IsInt()
  public readonly studentId: number;

  @ChainKey({ position: 1 })
  @IsString()
  public readonly name: string;

  @ChainKey({ position: 2 })
  @StringEnumProperty(Course)
  public readonly course: Course;

  @ChainKey({ position: 3 })
  @IsDate()
  public readonly enrolmentDate: Date;

  @ChainKey({ position: 4 })
  @IsInt()
  public readonly grades: number[];

  constructor(studentId: number, name: string, course: Course) {
    super();
    this.studentId = studentId;
    this.name = name;
    this.course = course
    this.enrolmentDate = new Date();
  }

  public getAverageGrade(): number {
    let sumOfGrades = 0;
    for(let i = 0; i < this.grades.length; i++){
      sumOfGrades += this.grades[i]
    }
    return sumOfGrades/this.grades.length
  }

  public enrolmentTimeLeft(): number {
    const currentDate = new Date();
    return this.enrolmentDate.getTime() - currentDate.getTime();
  }

  public isEnroled(): boolean {
    return new Date() > this.enrolmentDate;
  }
}