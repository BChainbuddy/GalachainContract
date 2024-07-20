import {
  AllowanceKey,
  AllowanceType,
  BurnTokensDto,
  CreateTokenClassDto,
  DeleteAllowancesDto,
  FetchAllowancesDto,
  FetchBalancesDto,
  FetchTokenClassesDto,
  FetchTokenClassesResponse,
  FetchTokenClassesWithPaginationDto,
  FullAllowanceCheckDto,
  GalaChainResponseType,
  GrantAllowanceDto,
  LockTokensDto,
  MintTokenDto,
  RefreshAllowanceDto,
  RefreshAllowancesDto,
  TokenAllowance,
  TokenBalance,
  TokenBurn,
  TokenClass,
  TokenClassKey,
  TokenInstance,
  TokenInstanceKey,
  TransferTokenDto,
  UnlockTokensDto,
  UpdateTokenClassDto,
  createValidDTO
} from "@gala-chain/api";
import { ChainUser } from "@gala-chain/client";
import {
  AdminChainClients,
  TestClients,
  fetchNFTInstances,
  transactionError,
  transactionErrorKey,
  transactionErrorMessageContains,
  transactionSuccess,
  users
} from "@gala-chain/test";
import BigNumber from "bignumber.js";
import { instanceToPlain } from "class-transformer";

import { api } from "../../src/token";
import feetPix from "../../src/token/data/collectible/feetPix";
import netBeans from "../../src/token/data/currency/netBeans";
import { name } from "./config";

jest.setTimeout(30000);

const config = { contract: { name, api } };

describe("passing test", () => it("passes", () => expect(1).toBe(1)));

describe("GalaChainToken", () => {
  let client: AdminChainClients<typeof config>;

  beforeEach(async () => (client = await TestClients.createForAdmin(config)));
  afterEach(async () => await client.disconnect());

  let superUser: ChainUser;
  let user1: ChainUser;
  let user2: ChainUser;

  test("users", async () => {
    superUser = await client.createRegisteredUser();
    user1 = await client.createRegisteredUser();
    user2 = await client.createRegisteredUser();

    feetPix.class.authorities = [users.testAdminId, superUser.identityKey];
    netBeans.class.authorities = [users.testAdminId, superUser.identityKey];

    expect(1).toBe(1);
  });

  describe("Collectibles", () => {
    let user1Nft: BigNumber;
    let user2Nft: BigNumber;

    describe("TokenClassApi", () => {
      it("should let Curators create NFT Class", async () => {
        // Given
        const input = {
          tokenClass: feetPix.classKey,
          ...feetPix.spec,
          authorities: feetPix.class.authorities
        };
        const dto = await createValidDTO(CreateTokenClassDto, input);
        const signedDto = dto.signed(client.contract.privateKey);
        // When
        const response = await client.contract.CreateTokenClass(signedDto);
        // Then
        if (response.Status === 1) expect(response).toEqual(transactionSuccess(feetPix.classKey));
        else {
          expect(response).toEqual(transactionErrorKey("TOKEN_ALREADY_EXISTS"));
          const utcInput = {
            tokenClass: feetPix.classKey,
            authorities: feetPix.class.authorities
          };
          const utcDto = await createValidDTO(UpdateTokenClassDto, utcInput);
          const signedUtcDto = utcDto.signed(client.contract.privateKey);
          await client.contract.UpdateTokenClass(signedUtcDto);
        }
      });

      it("Should FetchTokenClasses", async () => {
        // Given
        const input = {
          tokenClasses: [feetPix.classKey]
        };
        const dto = await createValidDTO(FetchTokenClassesDto, input);
        // When
        const response = await client.contract.FetchTokenClasses(dto);
        // Then
        expect(response.Status).toEqual(GalaChainResponseType.Success);

        if (response.Data !== undefined) {
          // NOTE: Default O, but increases over testing
          const data = response.Data[0];
          feetPix.class.totalSupply = feetPix.class.totalSupply.plus(data.totalSupply);
          expect(data.authorities.includes(users.testAdminId)).toBeTruthy;
          expect(data.authorities.includes(superUser.identityKey)).toBeTruthy;
          feetPix.class.authorities = data.authorities;
        }

        const expected = [instanceToPlain(feetPix.class)];
        expect(response.Data).toEqual(expected);
      });

      it("Should UpdateTokenClass", async () => {
        // Given
        const input = {
          tokenClass: feetPix.classKey,
          symbol: "UPDATED"
        };
        const dto = await createValidDTO(UpdateTokenClassDto, input);
        const signedDto = dto.signed(client.contract.privateKey);
        // When
        const response = await client.contract.UpdateTokenClass(signedDto);
        // Then
        expect(response).toEqual(transactionSuccess(feetPix.classKey));
        // And If
        const ftcInput = { tokenClasses: [feetPix.classKey] };
        const ftcDto = await createValidDTO(FetchTokenClassesDto, ftcInput);
        // When
        const ftcRes = await client.contract.FetchTokenClasses(ftcDto);
        // Then
        expect(ftcRes.Status).toEqual(GalaChainResponseType.Success);
        let expected = [instanceToPlain(feetPix.class)];
        expected[0].symbol = "UPDATED";
        expect(ftcRes.Data).toEqual(expected);
      });

      it("Should Reset", async () => {
        // Given
        const input = {
          tokenClass: feetPix.classKey,
          symbol: feetPix.spec.symbol
        };
        const dto = await createValidDTO(UpdateTokenClassDto, input);
        const signedDto = dto.signed(client.contract.privateKey);
        // When
        const response = await client.contract.UpdateTokenClass(signedDto);
        // Then
        expect(response).toEqual(transactionSuccess(feetPix.classKey));
        // And If
        const ftcInput = { tokenClasses: [feetPix.classKey] };
        const ftcDto = await createValidDTO(FetchTokenClassesDto, ftcInput);
        // When
        const ftcRes = await client.contract.FetchTokenClasses(ftcDto);
        // Then
        expect(ftcRes.Status).toEqual(GalaChainResponseType.Success);
        const expected = [instanceToPlain(feetPix.class)];
        expect(ftcRes.Data).toEqual(expected);
      });
    });

    describe("TokenAllowanceApi || Mint", () => {
      it("lets curators grant minting allowance for NFT", async () => {
        // Given
        const input = {
          tokenInstance: TokenInstanceKey.nftKey(
            feetPix.classKey,
            TokenInstance.FUNGIBLE_TOKEN_INSTANCE
          ).toQueryKey(),
          allowanceType: AllowanceType.Mint,
          quantities: [
            { user: user1.identityKey, quantity: new BigNumber(1) },
            { user: user2.identityKey, quantity: new BigNumber(1) }
          ],
          uses: new BigNumber(10)
        };
        const dto = await createValidDTO(GrantAllowanceDto, input);
        const signedDto = dto.signed(client.contract.privateKey);
        // When
        const response = await client.contract.GrantAllowance(signedDto);
        // Then
        const expectedPayload = expect.arrayContaining([
          expect.objectContaining({
            ...feetPix.key,
            allowanceType: AllowanceType.Mint,
            grantedBy: users.testAdminId,
            grantedTo: user1.identityKey,
            quantity: "1",
            created: expect.any(Number)
          }),
          expect.objectContaining({
            ...feetPix.key,
            allowanceType: AllowanceType.Mint,
            grantedBy: users.testAdminId,
            grantedTo: user2.identityKey,
            quantity: "1",
            created: expect.any(Number)
          })
        ]);
        expect(response).toEqual(transactionSuccess(expectedPayload));
      });
    });

    // user1Nft, user2Nft set here
    describe("TokenMintApi", () => {
      it("allows users to mint NFT", async () => {
        // Given
        const user1MintDto = (
          await createValidDTO(MintTokenDto, {
            owner: user1.identityKey,
            tokenClass: feetPix.classKey,
            quantity: new BigNumber(1)
          })
        ).signed(user1.privateKey);
        const user2MintDto = (
          await createValidDTO(MintTokenDto, {
            owner: user2.identityKey,
            tokenClass: feetPix.classKey,
            quantity: new BigNumber(1)
          })
        ).signed(user2.privateKey);

        // When
        const user1Res = await client.contract.MintToken(user1MintDto);
        const user2Res = await client.contract.MintToken(user2MintDto);

        feetPix.class.totalSupply = feetPix.class.totalSupply.plus(2); // increment
        user1Nft = feetPix.class.totalSupply.minus(1);
        user2Nft = feetPix.class.totalSupply;

        // Then
        expect(user1Res).toEqual(transactionSuccess());
        expect(user2Res).toEqual(transactionSuccess());
      });
    });

    describe("TokenBaseApi", () => {
      it("Users should have some NFTs", async () => {
        // Given
        const input = { ...instanceToPlain(feetPix.classKey) };
        const dto = await createValidDTO(FetchBalancesDto, input);
        const user1Dto = dto.signed(user1.privateKey);
        const user2Dto = dto.signed(user2.privateKey);
        // When
        const user1checkResponse = await client.contract.FetchBalances(user1Dto);
        const user2checkResponse = await client.contract.FetchBalances(user2Dto);
        // Then
        expect(user1checkResponse.Data?.length).toBeGreaterThan(0);
        expect(user2checkResponse.Data?.length).toBeGreaterThan(0);
        if (user1checkResponse.Data !== undefined && user2checkResponse.Data !== undefined) {
          expect(user1checkResponse.Data[0]["instanceIds"]).toEqual([user1Nft.toFixed()]);
          expect(user2checkResponse.Data[0]["instanceIds"]).toEqual([user2Nft.toFixed()]);
        }
      });

      it("transfer NFT between users", async () => {
        // Given
        const input = {
          tokenInstance: TokenInstanceKey.nftKey(feetPix.classKey, user1Nft),
          from: user1.identityKey,
          to: user2.identityKey,
          quantity: new BigNumber(1)
        };
        const dto = await createValidDTO(TransferTokenDto, input);
        const signedDto = dto.signed(user1.privateKey);

        // When
        const response = await client.contract.TransferToken(signedDto);

        // Then
        expect(response).toEqual(transactionSuccess());
        expect(await fetchNFTInstances(client.contract, feetPix.classKey, user1.identityKey)).toEqual([]);
        expect(await fetchNFTInstances(client.contract, feetPix.classKey, user2.identityKey)).toEqual([
          user1Nft,
          user2Nft
        ]);
      });

      it("and back", async () => {
        // Given
        const input = {
          tokenInstance: TokenInstanceKey.nftKey(feetPix.classKey, user1Nft),
          from: user2.identityKey,
          to: user1.identityKey,
          quantity: new BigNumber(1)
        };
        const dto = await createValidDTO(TransferTokenDto, input);
        const signedDto = dto.signed(user2.privateKey);
        // When
        const response = await client.contract.TransferToken(signedDto);
        // Then
        expect(response).toEqual(transactionSuccess());
        expect(await fetchNFTInstances(client.contract, feetPix.classKey, user1.identityKey)).toEqual([
          user1Nft
        ]);
        expect(await fetchNFTInstances(client.contract, feetPix.classKey, user2.identityKey)).toEqual([
          user2Nft
        ]);
      });
    });

    describe("TokenLockApi", () => {
      it("User1 should lock own token", async () => {
        // Given
        const input = {
          lockAuthority: user1.identityKey,
          tokenInstances: [
            {
              tokenInstanceKey: TokenInstanceKey.nftKey(feetPix.classKey, user1Nft),
              quantity: new BigNumber(1)
            }
          ]
        };
        const dto = await createValidDTO(LockTokensDto, input);
        const signedDto = dto.signed(user1.privateKey);
        // When
        const response = await client.contract.LockTokens(signedDto);
        // Then
        expect(response).toEqual(transactionSuccess());
      });

      it("User1 cannot transfer locked token", async () => {
        // Given
        const input = {
          tokenInstance: TokenInstanceKey.nftKey(feetPix.classKey, user1Nft),
          from: user1.identityKey,
          to: user2.identityKey,
          quantity: new BigNumber(1)
        };
        const dto = await createValidDTO(TransferTokenDto, input);
        const signedDto = dto.signed(user1.privateKey);
        // When
        const transferResponse = await client.contract.TransferToken(signedDto);
        // Then
        expect(transferResponse).toEqual(transactionErrorKey("TOKEN_LOCKED"));
      });

      it("User1 should unlock own token", async () => {
        // Given
        const input = {
          tokenInstances: [
            {
              tokenInstanceKey: TokenInstanceKey.nftKey(feetPix.classKey, user1Nft),
              quantity: new BigNumber(1)
            }
          ]
        };
        const dto = await createValidDTO(UnlockTokensDto, input);
        const signedDto = dto.signed(user1.privateKey);
        // When
        const response = await client.contract.UnlockTokens(signedDto);
        // Then
        expect(response).toEqual(transactionSuccess());
      });

      it("User1 can transfer token after unlock", async () => {
        // Given
        const input = {
          tokenInstance: TokenInstanceKey.nftKey(feetPix.classKey, user1Nft),
          from: user1.identityKey,
          to: user2.identityKey,
          quantity: new BigNumber(1)
        };
        const dto = await createValidDTO(TransferTokenDto, input);
        const signedDto = dto.signed(user1.privateKey);
        // When
        const response = await client.contract.TransferToken(signedDto);
        // Then
        expect(response).toEqual(transactionSuccess());
      });

      it("resets", async () => {
        // Given
        const input = {
          tokenInstance: TokenInstanceKey.nftKey(feetPix.classKey, user1Nft),
          from: user2.identityKey,
          to: user1.identityKey,
          quantity: new BigNumber(1)
        };
        const dto = await createValidDTO(TransferTokenDto, input);
        const signedDto = dto.signed(user2.privateKey);
        // When
        const response = await client.contract.TransferToken(signedDto);
        // Then
        expect(response).toEqual(transactionSuccess());
      });
    });

    describe("TokenAllowanceApi || Lock", () => {
      it("Only lock authority can unlock token", async () => {
        // Given
        const lockInput = {
          lockAuthority: user1.identityKey,
          tokenInstances: [
            {
              tokenInstanceKey: TokenInstanceKey.nftKey(feetPix.classKey, user1Nft),
              quantity: new BigNumber(1),
              owner: user1.identityKey
            }
          ]
        };
        const lockDto = await createValidDTO(LockTokensDto, lockInput);
        const signedLockDto = lockDto.signed(user1.privateKey);
        await client.contract.LockTokens(signedLockDto);

        const unlockInput = {
          tokenInstances: [
            {
              tokenInstanceKey: TokenInstanceKey.nftKey(feetPix.classKey, user1Nft),
              quantity: new BigNumber(1)
            }
          ]
        };
        const unlockDto = await createValidDTO(UnlockTokensDto, unlockInput);

        const user1Unlock = unlockDto.signed(user1.privateKey);
        const user2Unlock = unlockDto.signed(user2.privateKey);
        // When
        const response1 = await client.contract.UnlockTokens(user2Unlock);
        const response2 = await client.contract.UnlockTokens(user1Unlock);
        // Then
        expect(response1).toEqual(transactionErrorKey("UNLOCK_FORBIDDEN_USER"));
        expect(response2).toEqual(transactionSuccess());
      });

      it("User1 grants lock allowance for token to User2", async () => {
        // Given
        const input = {
          tokenInstance: TokenInstanceKey.nftKey(feetPix.classKey, user1Nft).toQueryKey(),
          allowanceType: AllowanceType.Lock,
          quantities: [{ user: user2.identityKey, quantity: new BigNumber(1) }],
          uses: new BigNumber(1)
        };
        const dto = await createValidDTO(GrantAllowanceDto, input);
        const signedDto = dto.signed(user1.privateKey);
        // When
        const result = await client.contract.GrantAllowance(signedDto);
        // Then
        expect(instanceToPlain(result)).toEqual(transactionSuccess());
      });

      it("User2 can lock User1 token with Allowance", async () => {
        // Given
        const input = {
          lockAuthority: user1.identityKey,
          tokenInstances: [
            {
              tokenInstanceKey: TokenInstanceKey.nftKey(feetPix.classKey, user1Nft),
              quantity: new BigNumber(1),
              owner: user1.identityKey
            }
          ]
        };
        const dto = await createValidDTO(LockTokensDto, input);
        const signedDto = dto.signed(user2.privateKey);
        // When
        const response = await client.contract.LockTokens(signedDto);
        // Then
        expect(response).toEqual(transactionSuccess());
      });
    });

    describe("TokenBurnApi", () => {
      it("doesn't burn locked tokens", async () => {
        // Given
        const input = {
          tokenInstances: [
            {
              tokenInstanceKey: TokenInstanceKey.nftKey(feetPix.classKey, user1Nft),
              quantity: new BigNumber(1)
            }
          ]
        };
        const dto = await createValidDTO(BurnTokensDto, input);
        const signedDto = dto.signed(user1.privateKey);
        // When
        const response = await client.contract.BurnTokens(signedDto);
        // Then
        expect(response).toEqual(transactionErrorKey("TOKEN_LOCKED"));
      });

      it("Allows users to burn tokens (User1)", async () => {
        const unlockDto = (
          await createValidDTO(UnlockTokensDto, {
            tokenInstances: [
              {
                tokenInstanceKey: TokenInstanceKey.nftKey(feetPix.classKey, user1Nft),
                quantity: new BigNumber(1)
              }
            ]
          })
        ).signed(user1.privateKey);
        await client.contract.UnlockTokens(unlockDto);
        // Given
        const input = {
          tokenInstances: [
            {
              tokenInstanceKey: TokenInstanceKey.nftKey(feetPix.classKey, user1Nft),
              quantity: new BigNumber(1)
            }
          ]
        };
        const dto = await createValidDTO(BurnTokensDto, input);
        const signedDto = dto.signed(user1.privateKey);
        // When
        const response = await client.contract.BurnTokens(signedDto);
        // Then
        expect(response).toEqual(transactionSuccess());

        const fbInput = {
          owner: user1.identityKey,
          ...instanceToPlain(feetPix.classKey)
        };
        const fbDto = await createValidDTO(FetchBalancesDto, fbInput);
        const fbResponse = await client.contract.FetchBalances(fbDto);

        expect(fbResponse).toEqual(transactionSuccess());
        if (fbResponse.Data !== undefined)
          // expect nothing in inventory
          expect(fbResponse.Data[0]["instanceIds"]).toEqual([]);
      });

      it("Allows users to burn tokens (User2)", async () => {
        // Given
        const input = {
          tokenInstances: [
            {
              tokenInstanceKey: TokenInstanceKey.nftKey(feetPix.classKey, user2Nft),
              quantity: new BigNumber(1)
            }
          ]
        };
        const dto = await createValidDTO(BurnTokensDto, input);
        const signedDto = dto.signed(user2.privateKey);
        // When
        const response = await client.contract.BurnTokens(signedDto);
        // Then
        expect(response).toEqual(transactionSuccess());

        const fbInput = {
          owner: user2.identityKey,
          ...instanceToPlain(feetPix.classKey)
        };
        const fbDto = await createValidDTO(FetchBalancesDto, fbInput);
        const fbResponse = await client.contract.FetchBalances(fbDto);

        expect(fbResponse).toEqual(transactionSuccess());
        if (fbResponse.Data !== undefined)
          // expect nothing in inventory
          expect(fbResponse.Data[0]["instanceIds"]).toEqual([]);
      });
    });
  });

  describe("Currencies", () => {
    describe("TokenClassApi", () => {
      it("should let Curators create Token Class", async () => {
        // Given
        const input = {
          tokenClass: netBeans.classKey,
          ...netBeans.spec,
          authorities: netBeans.class.authorities
        };
        const dto = await createValidDTO(CreateTokenClassDto, input);
        const signedDto = dto.signed(client.contract.privateKey);
        // When
        const response = await client.contract.CreateTokenClass(signedDto);
        // Then
        if (response.Status === 1) expect(response).toEqual(transactionSuccess(netBeans.classKey));
        else {
          expect(response).toEqual(transactionErrorKey("TOKEN_ALREADY_EXISTS"));
          const utcInput = {
            tokenClass: netBeans.classKey,
            authorities: netBeans.class.authorities
          };
          const utcDto = await createValidDTO(UpdateTokenClassDto, utcInput);
          const signedUtcDto = utcDto.signed(client.contract.privateKey);
          await client.contract.UpdateTokenClass(signedUtcDto);
        }
      });

      it("Should FetchTokenClasses", async () => {
        // Given
        const input = {
          tokenClasses: [netBeans.classKey]
        };
        const dto = await createValidDTO(FetchTokenClassesDto, input);
        // When
        const response = await client.contract.FetchTokenClasses(dto);
        // Then
        expect(response.Status).toEqual(GalaChainResponseType.Success);

        if (response.Data !== undefined) {
          // NOTE: Default O, but increases over testing
          const data = response.Data[0];
          netBeans.class.totalSupply = netBeans.class.totalSupply.plus(data.totalSupply);
          expect(data.authorities.includes(users.testAdminId)).toBeTruthy;
          expect(data.authorities.includes(superUser.identityKey)).toBeTruthy;
          netBeans.class.authorities = data.authorities;
        }

        const expected = [instanceToPlain(netBeans.class)];
        expect(response.Data).toEqual(expected);
      });

      it("Should UpdateTokenClass", async () => {
        // Given
        const input = {
          tokenClass: netBeans.classKey,
          symbol: "UPDATED"
        };
        const dto = await createValidDTO(UpdateTokenClassDto, input);
        const signedDto = dto.signed(client.contract.privateKey);
        // When
        const response = await client.contract.UpdateTokenClass(signedDto);
        // Then
        expect(response).toEqual(transactionSuccess(netBeans.classKey));
        // And If
        const ftcInput = { tokenClasses: [netBeans.classKey] };
        const ftcDto = await createValidDTO(FetchTokenClassesDto, ftcInput);
        // When
        const ftcRes = await client.contract.FetchTokenClasses(ftcDto);
        // Then
        expect(ftcRes.Status).toEqual(GalaChainResponseType.Success);
        let expected = [instanceToPlain(netBeans.class)];
        expected[0].symbol = "UPDATED";
        expect(ftcRes.Data).toEqual(expected);
      });

      it("Should Reset", async () => {
        // Given
        const input = {
          tokenClass: netBeans.classKey,
          symbol: netBeans.spec.symbol
        };
        const dto = await createValidDTO(UpdateTokenClassDto, input);
        const signedDto = dto.signed(client.contract.privateKey);
        // When
        const response = await client.contract.UpdateTokenClass(signedDto);
        // Then
        expect(response).toEqual(transactionSuccess(netBeans.classKey));
        // And If
        const ftcInput = { tokenClasses: [netBeans.classKey] };
        const ftcDto = await createValidDTO(FetchTokenClassesDto, ftcInput);
        // When
        const ftcRes = await client.contract.FetchTokenClasses(ftcDto);
        // Then
        expect(ftcRes.Status).toEqual(GalaChainResponseType.Success);
        const expected = [instanceToPlain(netBeans.class)];
        expect(ftcRes.Data).toEqual(expected);
      });
    });

    describe("TokenAllowanceApi || Mint", () => {
      it("lets curators grant minting allowance for FT", async () => {
        // Given
        const input = {
          tokenInstance: TokenInstanceKey.fungibleKey(netBeans.classKey).toQueryKey(),
          allowanceType: AllowanceType.Mint,
          quantities: [
            { user: user1.identityKey, quantity: new BigNumber(10_000) },
            { user: user2.identityKey, quantity: new BigNumber(10_000) }
          ],
          uses: new BigNumber(10)
        };
        const dto = await createValidDTO(GrantAllowanceDto, input);
        const signedDto = dto.signed(client.contract.privateKey);
        // When
        const response = await client.contract.GrantAllowance(signedDto);
        // Then
        const expectedPayload = expect.arrayContaining([
          expect.objectContaining({
            ...netBeans.key,
            allowanceType: AllowanceType.Mint,
            grantedBy: users.testAdminId,
            grantedTo: user1.identityKey,
            quantity: "10000",
            created: expect.any(Number)
          }),
          expect.objectContaining({
            ...netBeans.key,
            allowanceType: AllowanceType.Mint,
            grantedBy: users.testAdminId,
            grantedTo: user2.identityKey,
            quantity: "10000",
            created: expect.any(Number)
          })
        ]);
        expect(response).toEqual(transactionSuccess(expectedPayload));
      });

      it("doesn't let non-authorities grant allowances", async () => {
        // Given
        const input = {
          tokenInstance: TokenInstanceKey.fungibleKey(netBeans.classKey).toQueryKey(),
          allowanceType: AllowanceType.Mint,
          quantities: [{ user: user1.identityKey, quantity: new BigNumber(10_000) }],
          uses: new BigNumber(10)
        };
        const dto = await createValidDTO(GrantAllowanceDto, input);
        const signedDto = dto.signed(user2.privateKey);
        // When
        const response = await client.contract.GrantAllowance(signedDto);
        // Then
        expect(response).toEqual(transactionErrorKey("NOT_A_TOKEN_AUTHORITY"));
      });
    });

    describe("TokenMintApi", () => {
      it("allows users to mint FT", async () => {
        // Given
        const user1MintDto = (
          await createValidDTO(MintTokenDto, {
            owner: user1.identityKey,
            tokenClass: netBeans.classKey,
            quantity: new BigNumber(10_000)
          })
        ).signed(user1.privateKey);
        const user2MintDto = (
          await createValidDTO(MintTokenDto, {
            owner: user2.identityKey,
            tokenClass: netBeans.classKey,
            quantity: new BigNumber(10_000)
          })
        ).signed(user2.privateKey);

        // When
        const user1Res = await client.contract.MintToken(user1MintDto);
        const user2Res = await client.contract.MintToken(user2MintDto);

        netBeans.class.totalSupply = netBeans.class.totalSupply.plus(20_000); // increment

        // Then
        expect(user1Res).toEqual(transactionSuccess());
        expect(user2Res).toEqual(transactionSuccess());
      });
    });

    describe("TokenBaseApi", () => {
      it("Users should have some FTs", async () => {
        // Given
        const input = { ...instanceToPlain(netBeans.classKey) };
        const dto = await createValidDTO(FetchBalancesDto, input);
        const user1Dto = dto.signed(user1.privateKey);
        const user2Dto = dto.signed(user2.privateKey);
        // When
        const user1checkResponse = await client.contract.FetchBalances(user1Dto);
        const user2checkResponse = await client.contract.FetchBalances(user2Dto);
        // Then
        expect(user1checkResponse.Data?.length).toBeGreaterThan(0);
        expect(user2checkResponse.Data?.length).toBeGreaterThan(0);
        if (user1checkResponse.Data !== undefined && user2checkResponse.Data !== undefined) {
          expect(user1checkResponse.Data[0]["quantity"]).toEqual("10000");
          expect(user2checkResponse.Data[0]["quantity"]).toEqual("10000");
        }
      });

      it("transfer FT between users", async () => {
        // Given
        const input = {
          tokenInstance: TokenInstanceKey.fungibleKey(netBeans.classKey),
          from: user1.identityKey,
          to: user2.identityKey,
          quantity: new BigNumber(10_000)
        };
        const dto = await createValidDTO(TransferTokenDto, input);
        const signedDto = dto.signed(user1.privateKey);
        // When
        const transferResponse = await client.contract.TransferToken(signedDto);

        // Then
        expect(transferResponse).toEqual(transactionSuccess());
      });

      it("Users should have some FTs", async () => {
        // Given
        const input = { ...instanceToPlain(netBeans.classKey) };
        const dto = await createValidDTO(FetchBalancesDto, input);
        const user1Dto = dto.signed(user1.privateKey);
        const user2Dto = dto.signed(user2.privateKey);
        // When
        const user1checkResponse = await client.contract.FetchBalances(user1Dto);
        const user2checkResponse = await client.contract.FetchBalances(user2Dto);
        // Then
        expect(user1checkResponse.Data?.length).toBeGreaterThan(0);
        expect(user2checkResponse.Data?.length).toBeGreaterThan(0);
        if (user1checkResponse.Data !== undefined && user2checkResponse.Data !== undefined) {
          expect(user1checkResponse.Data[0]["quantity"]).toEqual("0");
          expect(user2checkResponse.Data[0]["quantity"]).toEqual("20000");
        }
      });

      it("and back", async () => {
        // Given
        const input = {
          tokenInstance: TokenInstanceKey.fungibleKey(netBeans.classKey),
          from: user2.identityKey,
          to: user1.identityKey,
          quantity: new BigNumber(10_000)
        };
        const dto = await createValidDTO(TransferTokenDto, input);

        // When
        const transferResponse = await client.contract.TransferToken(dto.signed(user2.privateKey));

        // Then
        expect(transferResponse).toEqual(transactionSuccess());
      });

      it("resets", async () => {
        // Given
        const input = { ...instanceToPlain(netBeans.classKey) };
        const dto = await createValidDTO(FetchBalancesDto, input);
        const user1Dto = dto.signed(user1.privateKey);
        const user2Dto = dto.signed(user2.privateKey);
        // When
        const user1checkResponse = await client.contract.FetchBalances(user1Dto);
        const user2checkResponse = await client.contract.FetchBalances(user2Dto);
        // Then
        expect(user1checkResponse.Data?.length).toBeGreaterThan(0);
        expect(user2checkResponse.Data?.length).toBeGreaterThan(0);
        if (user1checkResponse.Data !== undefined && user2checkResponse.Data !== undefined) {
          expect(user1checkResponse.Data[0]["quantity"]).toEqual("10000");
          expect(user2checkResponse.Data[0]["quantity"]).toEqual("10000");
        }
      });
    });

    describe("TokenLockApi", () => {
      it("User1 should lock own token", async () => {
        // Given
        const input = {
          lockAuthority: user1.identityKey,
          tokenInstances: [
            {
              tokenInstanceKey: TokenInstanceKey.fungibleKey(netBeans.classKey),
              quantity: new BigNumber(1_000)
            }
          ]
        };
        const dto = await createValidDTO(LockTokensDto, input);
        const signedDto = dto.signed(user1.privateKey);
        // When
        const response = await client.contract.LockTokens(signedDto);
        // Then
        expect(response).toEqual(transactionSuccess());
      });

      it("User1 cannot transfer locked token", async () => {
        // Given
        const input = {
          tokenInstance: TokenInstanceKey.fungibleKey(netBeans.classKey),
          from: user1.identityKey,
          to: user2.identityKey,
          quantity: new BigNumber(9_001)
        };
        const dto = await createValidDTO(TransferTokenDto, input);
        const signedDto = dto.signed(user1.privateKey);
        // When
        const transferResponse = await client.contract.TransferToken(signedDto);
        // Then
        expect(transferResponse).toEqual(transactionErrorMessageContains("Insufficient balance"));
      });

      it("User1 should unlock own token", async () => {
        // Given
        const input = {
          tokenInstances: [
            {
              tokenInstanceKey: TokenInstanceKey.fungibleKey(netBeans.classKey),
              quantity: new BigNumber(1_000)
            }
          ]
        };
        const dto = await createValidDTO(UnlockTokensDto, input);
        const signedDto = dto.signed(user1.privateKey);
        // When
        const response = await client.contract.UnlockTokens(signedDto);
        // Then
        expect(response).toEqual(transactionSuccess());
      });

      it("User1 can transfer token after unlock", async () => {
        // Given
        const input = {
          tokenInstance: TokenInstanceKey.fungibleKey(netBeans.classKey),
          from: user1.identityKey,
          to: user2.identityKey,
          quantity: new BigNumber(9_001)
        };
        const dto = await createValidDTO(TransferTokenDto, input);
        const signedDto = dto.signed(user1.privateKey);
        // When
        const response = await client.contract.TransferToken(signedDto);
        // Then
        expect(response).toEqual(transactionSuccess());
      });

      it("resets", async () => {
        // Given
        const input = {
          tokenInstance: TokenInstanceKey.fungibleKey(netBeans.classKey),
          from: user2.identityKey,
          to: user1.identityKey,
          quantity: new BigNumber(9_001)
        };
        const dto = await createValidDTO(TransferTokenDto, input);
        const signedDto = dto.signed(user2.privateKey);
        // When
        const response = await client.contract.TransferToken(signedDto);
        // Then
        expect(response).toEqual(transactionSuccess());
      });
    });

    // /* NOT IMPLEMENTED */
    // describe("TokenAllowanceApi || Lock", () => {
    //   it("Only lock authority can unlock token", async () => {
    //     // Given
    //     const lockInput = {
    //       lockAuthority: user1.identityKey,
    //       tokenInstances: [
    //         {
    //           tokenInstanceKey: TokenInstanceKey.fungibleKey(netBeans.classKey),
    //           quantity: new BigNumber(1_000),
    //           owner: user1.identityKey
    //         }
    //       ]
    //     };
    //     const lockDto = await createValidDTO(LockTokensDto, lockInput);
    //     const signedLockDto = lockDto.signed(user1.privateKey);
    //     await client.contract.LockTokens(signedLockDto);

    //     const unlockInput = {
    //       tokenInstances: [
    //         {
    //           tokenInstanceKey: TokenInstanceKey.fungibleKey(netBeans.classKey),
    //           quantity: new BigNumber(1_000)
    //         }
    //       ]
    //     };
    //     const unlockDto = await createValidDTO(UnlockTokensDto, unlockInput);

    //     const user1Unlock = unlockDto.signed(user1.privateKey);
    //     const user2Unlock = unlockDto.signed(user2.privateKey);
    //     // When
    //     const response1 = await client.contract.UnlockTokens(user2Unlock);
    //     const response2 = await client.contract.UnlockTokens(user1Unlock);
    //     // Then
    //     expect(response1).toEqual(transactionErrorKey("UNLOCK_FORBIDDEN_USER"));
    //     expect(response2).toEqual(transactionSuccess());
    //   });

    //   it("User1 grants lock allowance for token to User2", async () => {
    //     // Given
    //     const input = {
    //       tokenInstance: TokenInstanceKey.fungibleKey(netBeans.classKey).toQueryKey(),
    //       allowanceType: AllowanceType.Lock,
    //       quantities: [{ user: user2.identityKey, quantity: new BigNumber(1) }],
    //       uses: new BigNumber(1)
    //     };
    //     const dto = await createValidDTO(GrantAllowanceDto, input);
    //     const signedDto = dto.signed(user1.privateKey);
    //     // When
    //     const result = await client.contract.GrantAllowance(signedDto);
    //     // Then
    //     expect(instanceToPlain(result)).toEqual(transactionSuccess());
    //   });

    //   it("User2 can lock User1 token with Allowance", async () => {
    //     // Given
    //     const input = {
    //       lockAuthority: user1.identityKey,
    //       tokenInstances: [
    //         {
    //           tokenInstanceKey: TokenInstanceKey.fungibleKey(netBeans.classKey),
    //           quantity: new BigNumber(1_000),
    //           owner: user1.identityKey
    //         }
    //       ]
    //     };
    //     const dto = await createValidDTO(LockTokensDto, input);
    //     const signedDto = dto.signed(user2.privateKey);
    //     // When
    //     const response = await client.contract.LockTokens(signedDto);
    //     // Then
    //     expect(response).toEqual(transactionSuccess());
    //   });
    // });

    describe("TokenBurnApi", () => {
      it("doesn't burn locked tokens", async () => {
        const lockDto = (
          await createValidDTO(LockTokensDto, {
            lockAuthority: user1.identityKey,
            tokenInstances: [
              {
                tokenInstanceKey: TokenInstanceKey.fungibleKey(netBeans.classKey),
                quantity: new BigNumber(1_000)
              }
            ]
          })
        ).signed(user1.privateKey);
        await client.contract.LockTokens(lockDto);

        // Given
        const input = {
          tokenInstances: [
            {
              tokenInstanceKey: TokenInstanceKey.fungibleKey(netBeans.classKey),
              quantity: new BigNumber(10_000)
            }
          ]
        };
        const dto = await createValidDTO(BurnTokensDto, input);
        const signedDto = dto.signed(user1.privateKey);
        // When
        const response = await client.contract.BurnTokens(signedDto);
        // Then
        expect(response).toEqual(transactionErrorMessageContains("Insufficient balance"));
      });

      it("Allows users to burn tokens (User1)", async () => {
        const unlockDto = (
          await createValidDTO(UnlockTokensDto, {
            tokenInstances: [
              {
                tokenInstanceKey: TokenInstanceKey.fungibleKey(netBeans.classKey),
                quantity: new BigNumber(1_000)
              }
            ]
          })
        ).signed(user1.privateKey);
        await client.contract.UnlockTokens(unlockDto);
        // Given
        const input = {
          tokenInstances: [
            {
              tokenInstanceKey: TokenInstanceKey.fungibleKey(netBeans.classKey),
              quantity: new BigNumber(10_000)
            }
          ]
        };
        const dto = await createValidDTO(BurnTokensDto, input);
        const signedDto = dto.signed(user1.privateKey);
        // When
        const response = await client.contract.BurnTokens(signedDto);
        // Then
        expect(response).toEqual(transactionSuccess());

        const fbInput = {
          owner: user1.identityKey,
          ...instanceToPlain(netBeans.classKey)
        };
        const fbDto = await createValidDTO(FetchBalancesDto, fbInput);
        const fbResponse = await client.contract.FetchBalances(fbDto);

        expect(fbResponse).toEqual(transactionSuccess());
        if (fbResponse.Data !== undefined)
          // expect nothing in inventory
          expect(fbResponse.Data[0]["quantity"]).toEqual("0");
      });

      it("Allows users to burn tokens (User2)", async () => {
        // Given
        const input = {
          tokenInstances: [
            {
              tokenInstanceKey: TokenInstanceKey.fungibleKey(netBeans.classKey),
              quantity: new BigNumber(10_000)
            }
          ]
        };
        const dto = await createValidDTO(BurnTokensDto, input);
        const signedDto = dto.signed(user2.privateKey);
        // When
        const response = await client.contract.BurnTokens(signedDto);
        // Then
        expect(response).toEqual(transactionSuccess());

        const fbInput = {
          owner: user2.identityKey,
          ...instanceToPlain(netBeans.classKey)
        };
        const fbDto = await createValidDTO(FetchBalancesDto, fbInput);
        const fbResponse = await client.contract.FetchBalances(fbDto);

        expect(fbResponse).toEqual(transactionSuccess());
        if (fbResponse.Data !== undefined)
          // expect nothing in inventory
          expect(fbResponse.Data[0]["quantity"]).toEqual("0");
      });
    });

    describe("High Throughput Minting", () => {});
  });

  describe("Assets", () => {
    describe("TokenClassApi", () => {
      it("Should FetchTokenClasses", async () => {
        // Given
        const input = {
          tokenClasses: [feetPix.classKey, netBeans.classKey]
        };
        const dto = await createValidDTO(FetchTokenClassesDto, input);
        // When
        const response = await client.contract.FetchTokenClasses(dto);
        // Then
        expect(response.Status).toEqual(GalaChainResponseType.Success);
        const expected = [instanceToPlain(feetPix.class), instanceToPlain(netBeans.class)];
        expect(response.Data).toEqual(expected);
      });
      // preferable because we can just send empty args
      it("Should FetchTokenClassesWithPagination", async () => {
        // Given
        const input = {};
        const dto = await createValidDTO(FetchTokenClassesWithPaginationDto, input);
        // When
        const response = await client.contract.FetchTokenClassesWithPagination(dto);
        // Then
        expect(response.Status).toEqual(GalaChainResponseType.Success);
        expect(response.Data?.nextPageBookmark).toEqual("");
        const results = [instanceToPlain(feetPix.class), instanceToPlain(netBeans.class)];
        expect(response.Data?.results).toEqual(results);
      });
    });

    describe("TokenAllowanceApi", () => {
      // honestly no idea what this is supposed to do
      xit("FullAllowanceCheck", async () => {
        const input = {
          grantedTo: user2.identityKey
        };
        const dto = await createValidDTO(FullAllowanceCheckDto, input);
        const response = await client.contract.FullAllowanceCheck(dto);
        console.log(response);
      });

      // Same here
      xit("RefreshAllowances", async () => {
        const raInput = {
          allowanceKey: new AllowanceKey(),
          grantedTo: user2.identityKey,
          uses: new BigNumber(10),
          expires: 0
        };
        const raDto = await createValidDTO(RefreshAllowanceDto, raInput);
        const input = { allowances: [raDto] };
        const dto = await createValidDTO(RefreshAllowancesDto, input);
        const signedDto = dto.signed(user1.privateKey);
        const response = await client.contract.RefreshAllowances(dto);
        console.log(response);
      });

      // TODO: Add a bunch of allowances before these two tests

      it("Deletes Allowances (Part 1)", async () => {
        let faDto, faRes;
        // Given
        const input = { grantedTo: user2.identityKey };

        faDto = await createValidDTO(FetchAllowancesDto, input);
        faRes = await client.contract.FetchAllowances(faDto);

        const dto = await createValidDTO(DeleteAllowancesDto, input);
        const signedDto = dto.signed(user2.privateKey);
        // When
        const response = await client.contract.DeleteAllowances(signedDto);
        // Then
        const numRemoved = faRes.Data?.results.length;
        expect(response).toEqual(transactionSuccess(numRemoved));

        faDto = await createValidDTO(FetchAllowancesDto, input);
        faRes = await client.contract.FetchAllowances(faDto);
        expect(faRes).toEqual(
          transactionSuccess(
            expect.objectContaining({
              nextPageBookmark: "",
              results: []
            })
          )
        );
      });

      it("Deletes Allowances (Part 2)", async () => {
        let faDto, faRes;
        // Given
        const input = { grantedTo: user1.identityKey };

        faDto = await createValidDTO(FetchAllowancesDto, input);
        faRes = await client.contract.FetchAllowances(faDto);

        const dto = await createValidDTO(DeleteAllowancesDto, input);
        const signedDto = dto.signed(user1.privateKey);
        // When
        const response = await client.contract.DeleteAllowances(signedDto);
        // Then
        const numRemoved = faRes.Data?.results.length;
        expect(response).toEqual(transactionSuccess(numRemoved));

        faDto = await createValidDTO(FetchAllowancesDto, input);
        faRes = await client.contract.FetchAllowances(faDto);
        expect(faRes).toEqual(
          transactionSuccess(
            expect.objectContaining({
              nextPageBookmark: "",
              results: []
            })
          )
        );
      });
    });
  });
});
