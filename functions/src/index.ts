import { setGlobalOptions } from 'firebase-functions/v2/options';

// Set the maximum instances to 10 for all functions
setGlobalOptions({ maxInstances: 10 });

export { onCallFetchTokenData } from './on-call-fetch-token-data';