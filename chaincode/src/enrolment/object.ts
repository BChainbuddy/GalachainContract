import { BigNumberProperty, ChainKey, ChainObject, DefaultError, StringEnumProperty } from "@gala-chain/api";
import BigNumber from "bignumber.js";
import { Exclude } from "class-transformer";
import { IsString, IsInt, IsDate, IsArray } from "class-validator";

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

  @IsArray()
  @IsInt({ each: true })
  public readonly grades: number[];

  public readonly enrolmentDate: Date;

  constructor(studentId: number, name: string, course: Course) {
    super();
    this.studentId = studentId;
    this.name = name;
    this.course = course;
    this.enrolmentDate = new Date();
    this.grades = [];
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
    return new Date() >= this.enrolmentDate;
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