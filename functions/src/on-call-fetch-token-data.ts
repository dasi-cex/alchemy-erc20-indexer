import { CallableOptions, CallableRequest, HttpsError, onCall } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions/v2';
import { Alchemy, Network, TokenMetadataResponse } from 'alchemy-sdk';
import { AlchemyVars } from '../../shared-models/alchemy-vars.model';

const alchemySepoliaApiKey = defineSecret(AlchemyVars.ALCHEMY_SEPOLIA_API_KEY);

const fetchTokenData = async (walletAddress: string) => {
  const config = {
    apiKey: alchemySepoliaApiKey.value(),
    network: Network.ETH_SEPOLIA,
  };

  const alchemy = new Alchemy(config);
  const alchemyResponse = await alchemy.core.getTokenBalances(walletAddress)
    .catch(err => {logger.log(`Failed to fetchTokenBalances from Alchemy`, err); throw new HttpsError('unknown', err);});

  const tokenDataPromises = alchemyResponse.tokenBalances.map(tokenBalance => {
    const tokenData = alchemy.core.getTokenMetadata(
      tokenBalance.contractAddress
    );
    return tokenData;
  })
  
  const tokenDataArray = Promise.all(tokenDataPromises);

  return tokenDataArray;
}

/////// DEPLOYABLE FUNCTIONS ///////

const callableOptions: CallableOptions = {
  secrets: [alchemySepoliaApiKey]
}

export const onCallFetchTokenData = onCall( callableOptions, async (request: CallableRequest<string>): Promise<TokenMetadataResponse[]> => {
  const walletAddress = request.data;
  logger.log('onCallFetchTokenData request received with this data:', walletAddress);
  return fetchTokenData(walletAddress);
});