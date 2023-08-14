import { TokenMetadataResponse, OwnedNft } from 'alchemy-sdk';

export interface AlchemyErc20TokenData {
  contractAddress: string;
  hexBalance: string | null;
  metaData: TokenMetadataResponse;
}

export interface AlchemyCombinedTokenData {
  erc20DataArray: AlchemyErc20TokenData[];
  nftDataArray: OwnedNft[];
}