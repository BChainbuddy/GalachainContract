import {
  BatchMintTokenDto,
  BurnTokensDto,
  CreateTokenClassDto,
  DeleteAllowancesDto,
  FetchAllowancesDto,
  FetchAllowancesResponse,
  FetchBalancesDto,
  FetchBurnsDto,
  FetchMintRequestsDto,
  FetchTokenClassesDto,
  FetchTokenClassesResponse,
  FetchTokenClassesWithPaginationDto,
  FulfillMintDto,
  FullAllowanceCheckDto,
  FullAllowanceCheckResDto,
  GalaChainResponse,
  GrantAllowanceDto,
  HighThroughputMintTokenDto,
  LockTokenDto,
  LockTokensDto,
  MintRequestDto,
  MintTokenDto,
  MintTokenWithAllowanceDto,
  RefreshAllowancesDto,
  ReleaseTokenDto,
  TokenAllowance,
  TokenBalance,
  TokenBurn,
  TokenClass,
  TokenClassKey,
  TokenInstanceKey,
  TransferTokenDto,
  UnlockTokenDto,
  UnlockTokensDto,
  UpdateTokenClassDto,
  UseTokenDto
} from "@gala-chain/api";
import { ChainClient } from "@gala-chain/client";

interface TokenClassApi {
  CreateTokenClass(dto: CreateTokenClassDto): Promise<GalaChainResponse<TokenClassKey>>;
  FetchTokenClasses(dto: FetchTokenClassesDto): Promise<GalaChainResponse<TokenClass[]>>;
  FetchTokenClassesWithPagination(
    dto: FetchTokenClassesWithPaginationDto
  ): Promise<GalaChainResponse<FetchTokenClassesResponse>>;
  UpdateTokenClass(dto: UpdateTokenClassDto): Promise<GalaChainResponse<TokenClassKey>>;
}

interface TokenAllowanceApi {
  GrantAllowance(dto: GrantAllowanceDto): Promise<GalaChainResponse<TokenAllowance[]>>;
  FetchAllowances(dto: FetchAllowancesDto): Promise<GalaChainResponse<FetchAllowancesResponse>>;
  FullAllowanceCheck(dto: FullAllowanceCheckDto): Promise<GalaChainResponse<FullAllowanceCheckResDto>>;
  RefreshAllowances(dto: RefreshAllowancesDto): Promise<GalaChainResponse<TokenAllowance[]>>;
  DeleteAllowances(dto: DeleteAllowancesDto): Promise<GalaChainResponse<number>>;
}

interface TokenMintApi {
  RequestMint(dto: HighThroughputMintTokenDto): Promise<GalaChainResponse<FulfillMintDto>>;
  FetchMintRequests(dto: FetchMintRequestsDto): Promise<GalaChainResponse<MintRequestDto[]>>;
  FulfillMint(dto: FulfillMintDto): Promise<GalaChainResponse<TokenInstanceKey[]>>;
  HighThroughputMint(dto: HighThroughputMintTokenDto): Promise<GalaChainResponse<TokenInstanceKey[]>>;
  //
  MintToken(dto: MintTokenDto): Promise<GalaChainResponse<TokenInstanceKey[]>>;
  MintTokenWithAllowance(dto: MintTokenWithAllowanceDto): Promise<GalaChainResponse<TokenInstanceKey[]>>;
  BatchMintToken(dto: BatchMintTokenDto): Promise<GalaChainResponse<TokenInstanceKey[]>>;
}

interface TokenBurnApi {
  BurnTokens(dto: BurnTokensDto): Promise<GalaChainResponse<TokenBurn[]>>;
  FetchBurns(dto: FetchBurnsDto): Promise<GalaChainResponse<TokenBurn[]>>;
}

interface TokenLockApi {
  LockToken(dto: LockTokenDto): Promise<GalaChainResponse<TokenBalance>>;
  LockTokens(dto: LockTokensDto): Promise<GalaChainResponse<TokenBalance[]>>;
  UnlockToken(dto: UnlockTokenDto): Promise<GalaChainResponse<TokenBalance>>;
  UnlockTokens(dto: UnlockTokensDto): Promise<GalaChainResponse<TokenBalance[]>>;
}

interface ContractApi extends TokenClassApi, TokenAllowanceApi, TokenMintApi, TokenBurnApi, TokenLockApi {
  // TokenUtility
  FetchBalances(dto: FetchBalancesDto): Promise<GalaChainResponse<TokenBalance[]>>;
  TransferToken(dto: TransferTokenDto): Promise<GalaChainResponse<TokenBalance[]>>;
  UseToken(dto: UseTokenDto): Promise<GalaChainResponse<TokenBalance>>;
  ReleaseToken(dto: ReleaseTokenDto): Promise<GalaChainResponse<TokenBalance>>;
}

export function api(client: ChainClient): ContractApi {
  return {
    // TokenUtility
    FetchBalances(dto: FetchBalancesDto) {
      return client.evaluateTransaction("FetchBalances", dto) as Promise<GalaChainResponse<TokenBalance[]>>;
    },
    TransferToken(dto: TransferTokenDto) {
      return client.submitTransaction("TransferToken", dto) as Promise<GalaChainResponse<TokenBalance[]>>;
    },
    UseToken(dto: UseTokenDto) {
      return client.submitTransaction("UseToken", dto) as Promise<GalaChainResponse<TokenBalance>>;
    },
    ReleaseToken(dto: ReleaseTokenDto) {
      return client.submitTransaction("ReleaseToken", dto) as Promise<GalaChainResponse<TokenBalance>>;
    },
    // TokenClass
    CreateTokenClass(dto: CreateTokenClassDto) {
      return client.submitTransaction("CreateTokenClass", dto) as Promise<GalaChainResponse<TokenClassKey>>;
    },
    FetchTokenClasses(dto: FetchTokenClassesDto) {
      return client.evaluateTransaction("FetchTokenClasses", dto) as Promise<GalaChainResponse<TokenClass[]>>;
    },
    FetchTokenClassesWithPagination(dto: FetchTokenClassesWithPaginationDto) {
      return client.evaluateTransaction("FetchTokenClassesWithPagination", dto) as Promise<
        GalaChainResponse<FetchTokenClassesResponse>
      >;
    },
    UpdateTokenClass(dto: UpdateTokenClassDto) {
      return client.submitTransaction("UpdateTokenClass", dto) as Promise<GalaChainResponse<TokenClassKey>>;
    },
    // TokenAllowance
    GrantAllowance(dto: GrantAllowanceDto) {
      return client.submitTransaction("GrantAllowance", dto) as Promise<GalaChainResponse<TokenAllowance[]>>;
    },
    FetchAllowances(dto: FetchAllowancesDto) {
      return client.evaluateTransaction("FetchAllowances", dto) as Promise<
        GalaChainResponse<FetchAllowancesResponse>
      >;
    },
    FullAllowanceCheck(dto: FullAllowanceCheckDto) {
      return client.evaluateTransaction("FullAllowanceCheck", dto) as Promise<
        GalaChainResponse<FullAllowanceCheckResDto>
      >;
    },
    RefreshAllowances(dto: RefreshAllowancesDto) {
      return client.submitTransaction("RefreshAllowances", dto) as Promise<
        GalaChainResponse<TokenAllowance[]>
      >;
    },
    DeleteAllowances(dto: DeleteAllowancesDto) {
      return client.submitTransaction("DeleteAllowances", dto) as Promise<GalaChainResponse<number>>;
    },
    // TokenMint
    RequestMint(dto: HighThroughputMintTokenDto) {
      return client.submitTransaction("RequestMint", dto) as Promise<GalaChainResponse<FulfillMintDto>>;
    },
    FetchMintRequests(dto: FetchMintRequestsDto) {
      return client.evaluateTransaction("FetchMintRequests", dto) as Promise<
        GalaChainResponse<MintRequestDto[]>
      >;
    },
    FulfillMint(dto: FulfillMintDto) {
      return client.submitTransaction("FulfillMint", dto) as Promise<GalaChainResponse<TokenInstanceKey[]>>;
    },
    HighThroughputMint(dto: HighThroughputMintTokenDto) {
      return client.submitTransaction("HighThroughputMint", dto) as Promise<
        GalaChainResponse<TokenInstanceKey[]>
      >;
    },
    // TokenMint ++
    MintToken(dto: MintTokenDto) {
      return client.submitTransaction("MintToken", dto) as Promise<GalaChainResponse<TokenInstanceKey[]>>;
    },
    MintTokenWithAllowance(dto: MintTokenWithAllowanceDto) {
      return client.submitTransaction("MintTokenWithAllowance", dto) as Promise<
        GalaChainResponse<TokenInstanceKey[]>
      >;
    },
    BatchMintToken(dto: BatchMintTokenDto) {
      return client.submitTransaction("BatchMintToken", dto) as Promise<
        GalaChainResponse<TokenInstanceKey[]>
      >;
    },
    // TokenBurn
    BurnTokens(dto: BurnTokensDto) {
      return client.submitTransaction("BurnTokens", dto) as Promise<GalaChainResponse<TokenBurn[]>>;
    },
    FetchBurns(dto: FetchBurnsDto) {
      return client.evaluateTransaction("FetchBurns", dto) as Promise<GalaChainResponse<TokenBurn[]>>;
    },
    // TokenLock
    LockToken(dto: LockTokenDto) {
      return client.submitTransaction("LockToken", dto) as Promise<GalaChainResponse<TokenBalance>>;
    },
    LockTokens(dto: LockTokensDto) {
      return client.submitTransaction("LockTokens", dto) as Promise<GalaChainResponse<TokenBalance[]>>;
    },
    UnlockToken(dto: UnlockTokenDto) {
      return client.submitTransaction("UnlockToken", dto) as Promise<GalaChainResponse<TokenBalance>>;
    },
    UnlockTokens(dto: UnlockTokensDto) {
      return client.submitTransaction("UnlockTokens", dto) as Promise<GalaChainResponse<TokenBalance[]>>;
    }
  };
}
