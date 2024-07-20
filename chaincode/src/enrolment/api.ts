import { GalaChainResponse } from "@gala-chain/api";
import { ChainClient } from "@gala-chain/client";

import { AppleTreeDto, AppleTreesDto, FetchTreesDto, HarvestAppleDto, PagedTreesDto } from "./methods/dtos";

interface ContractApi {
  PlantTree(dto: AppleTreeDto): Promise<GalaChainResponse<void>>;
  PlantTrees(dto: AppleTreesDto): Promise<GalaChainResponse<void>>;
  FetchTrees(dto: FetchTreesDto): Promise<GalaChainResponse<PagedTreesDto>>;
  HarvestApple(dto: HarvestAppleDto): Promise<GalaChainResponse<void>>;
}

export function api(client: ChainClient): ContractApi {
  return {
    PlantTree(dto: AppleTreeDto) {
      return client.submitTransaction("PlantTree", dto) as Promise<GalaChainResponse<void>>;
    },

    PlantTrees(dto: AppleTreesDto) {
      return client.submitTransaction("PlantTrees", dto) as Promise<GalaChainResponse<void>>;
    },

    FetchTrees(dto: FetchTreesDto) {
      return client.evaluateTransaction("FetchTrees", dto, PagedTreesDto);
    },

    HarvestApple(dto: HarvestAppleDto) {
      return client.submitTransaction("HarvestApple", dto) as Promise<GalaChainResponse<void>>;
    }
  };
}
