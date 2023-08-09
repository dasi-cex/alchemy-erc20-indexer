import { TokenMetadataResponse } from 'alchemy-sdk';

export interface AlchemyTokenData {
  contractAddress: string;
  hexBalance: string | null;
  metaData: TokenMetadataResponse;
}