import { ChainUser } from "@gala-chain/client";
import { fixture, transactionErrorMessageContains, transactionSuccess, writesMap } from "@gala-chain/test";
//
import { plainToInstance } from "class-transformer";

import { StudentEnrolment } from "./contract";
import { EnrollStudentDto } from "./methods/create";

import { Course, Student } from "./object";

it("should allow enrolment of student", async () => {
  // Given
  const { contract, ctx, writes } = fixture(StudentEnrolment); 
  const dto = new EnrollStudentDto("John Doe", Course.MATH);
  const expectedStudent = new Student(1, dto.name, dto.course);

  // When
  const response = await contract.EnrollStudent(ctx, dto);

  // Then
  console.log(writes)
  console.log(writesMap(expectedStudent))
  expect(response).toEqual(transactionSuccess());
  expect(writes).toEqual(writesMap(expectedStudent));
});

// it("should fail to plant a tree if tree already exists", async () => {
//   // Given
//   const user = ChainUser.withRandomKeys();

//   const { contract, ctx, writes } = fixture(AppleContract)
//     .callingUser(user)
//     .savedState(new AppleTree(user.identityKey, Variety.MCINTOSH, 1, 0));

//   // When
//   const response = await contract.PlantTree(ctx, new AppleTreeDto(Variety.MCINTOSH, 1));

//   // Then
//   expect(response).toEqual(transactionErrorMessageContains("already exists"));
//   expect(writes).toEqual({});
// });

// it("should allow apple harvests", async () => {
//   // Given
//   const twoYearsAgo = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 365 * 2).getTime();
//   const existingTree = new AppleTree("client|some-user", Variety.HONEYCRISP, 1, twoYearsAgo);
//   const { contract, ctx, writes } = fixture(AppleContract).savedState(existingTree);

//   const dto = new HarvestAppleDto(existingTree.creator, existingTree.variety, existingTree.index);

//   // When
//   const response = await contract.HarvestApple(ctx, dto);

//   // Then
//   expect(response).toEqual(transactionSuccess());
//   expect(writes).toEqual(
//     writesMap(
//       plainToInstance(AppleTree, {
//         ...existingTree,
//         timesHarvested: existingTree.timesHarvested.plus(1)
//       })
//     )
//   );
// });
