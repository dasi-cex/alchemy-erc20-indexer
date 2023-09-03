import { CallableOptions, CallableRequest, HttpsError, onCall } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions/v2';
import { Alchemy, AlchemySettings, Network, OwnedNft } from 'alchemy-sdk';
import { AlchemyVars } from '../../shared-models/alchemy-vars.model';
import { AlchemyCombinedTokenData, AlchemyErc20TokenData } from '../../shared-models/alchemy-token-data.model';
import { TokenDataRequest } from '../../shared-models/token-data-request.model';
import { EthereumChainIds } from '../../shared-models/ethereum-chain-ids.model';

const alchemySepoliaApiKey = defineSecret(AlchemyVars.ALCHEMY_SEPOLIA_API_KEY);
const alchemyMainnetApiKey = defineSecret(AlchemyVars.ALCHEMY_MAINNET_API_KEY);

const fetchTokenData = async (tokenDataRequest: TokenDataRequest): Promise<AlchemyCombinedTokenData> => {
  let walletAddress = tokenDataRequest.address;
  
  const config = getAlchemyConfig(tokenDataRequest.chainId);
  const alchemy = new Alchemy(config);
  
  if (isEnsName(walletAddress)) {
    const resolvedAddress = await resolveEnsName(walletAddress, alchemy);
    if (!resolvedAddress) {
      logger.log(`No address associated with ${walletAddress} was found.`);
      
      // If no address associated with ENS, return empty arrays
      return {
        erc20DataArray: [],
        nftDataArray: []
      };
    }
    walletAddress = resolvedAddress;
  }

  const erc20DataArray: AlchemyErc20TokenData[] = await fetchErc20Data(walletAddress, alchemy);
  const nftDataArray: OwnedNft[] = await fetchNftData(walletAddress, alchemy);

  const combinedTokenData: AlchemyCombinedTokenData = {
    erc20DataArray,
    nftDataArray
  };

  return combinedTokenData;
}

const fetchErc20Data = async (walletAddress: string, alchemy: Alchemy): Promise<AlchemyErc20TokenData[]> => {
  const alchemyResponse = await alchemy.core.getTokenBalances(walletAddress)
    .catch(err => {logger.log(`Failed to getTokenBalances from Alchemy`, err); throw new HttpsError('internal', err);});

  const tokenDataPromises = alchemyResponse.tokenBalances.map(async tokenData => {
    const metaData = await alchemy.core.getTokenMetadata(
      tokenData.contractAddress
    );

    const contractAddress = tokenData.contractAddress;
    const hexBalance = tokenData.tokenBalance;

    const alchemyTokenData: AlchemyErc20TokenData = {
      contractAddress,
      hexBalance,
      metaData
    }

    return alchemyTokenData;
  })

  const tokenDataArray = Promise.all(tokenDataPromises);

  return tokenDataArray;
}

const fetchNftData = async (walletAddress: string, alchemy: Alchemy): Promise<OwnedNft[]> => {
  const alchemyResponse = await alchemy.nft.getNftsForOwner(walletAddress)
    .catch(err => {logger.log(`Failed to getNftsForOwner from Alchemy`, err); throw new HttpsError('internal', err);});

  const ownedNftArray = alchemyResponse.ownedNfts;

  return ownedNftArray;
}

const getAlchemyConfig = (chainId: number): AlchemySettings => {
  let config: AlchemySettings;

  switch(chainId) {
    case EthereumChainIds.SEPOLIA:
      config = {
        apiKey: alchemySepoliaApiKey.value(),
        network: Network.ETH_SEPOLIA,
      };
      logger.log('Sepolia network request detected.')
      return config;
    
    case EthereumChainIds.MAINNET:
      config = {
        apiKey: alchemyMainnetApiKey.value(),
        network: Network.ETH_MAINNET,
      };
      logger.log('Mainnet network request detected.')
      return config;
    
    default:
      config = {
        apiKey: alchemySepoliaApiKey.value(),
        network: Network.ETH_SEPOLIA,
      };
      logger.log('No match found for Chain ID. Defaulting to Sepolia.')
      return config;
  }

}

const isEnsName = (address: string): boolean => {
  const formattedAddress = address.toLowerCase();
  const lastFourCharacters = formattedAddress.slice(-4);
  return lastFourCharacters === ".ens";
}

const resolveEnsName = async (ensAddress: string, alchemy: Alchemy): Promise<string | null> => {
  return alchemy.core.resolveName(ensAddress)
    .catch(err => {logger.log(`Failed to resolve ENS name from Alchemy`, err); throw new HttpsError('internal', err);});;
}

/////// DEPLOYABLE FUNCTIONS ///////

const callableOptions: CallableOptions = {
  secrets: [alchemySepoliaApiKey, alchemyMainnetApiKey],
  enforceAppCheck: true
}

export const onCallFetchTokenData = onCall( callableOptions, async (request: CallableRequest<TokenDataRequest>): Promise<AlchemyCombinedTokenData> => {
  const tokenDataRequest = request.data;
  logger.log('onCallFetchTokenData request received with this data:', tokenDataRequest);
  return fetchTokenData(tokenDataRequest);
});