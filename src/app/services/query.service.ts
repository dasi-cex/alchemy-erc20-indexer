import { Injectable, inject, signal } from '@angular/core';
import { Functions, httpsCallableData } from '@angular/fire/functions';
import { Observable, catchError, map, shareReplay, take, throwError } from 'rxjs';
import { AlchemyCombinedTokenData } from 'shared-models/alchemy-token-data.model';
import { FbFunctionNames } from 'shared-models/fb-function-names.model';
import { EvmService } from './evm.service';
import { TokenDataRequest } from 'shared-models/token-data-request.model';

@Injectable({
  providedIn: 'root'
})
export class QueryService {

  private functions: Functions = inject(Functions);

  fetchTokenDataError$ = signal<string | undefined>(undefined);
  fetchTokenDataProcessing$ = signal<boolean>(false);
  combinedTokenData = signal<AlchemyCombinedTokenData | undefined>(undefined);

  constructor(
    private evmService: EvmService
  ) { }

  fetchTokenData(walletAddress: string): Observable<AlchemyCombinedTokenData> {

    if (!this.evmService.isValidNetwork()) {
      const error = 'Invalid network detected. Please connect to Sepolia or Mainnet and try again.';
      this.fetchTokenDataError$.set(error);
      this.fetchTokenDataProcessing$.set(false);
      return throwError(() => new Error(error));
    }

    if (!this.evmService.isValidEnsRequest(walletAddress)) {
      const error = 'ENS queries are only available on Mainnet. Please switch networks and try again.';
      this.fetchTokenDataError$.set(error);
      this.fetchTokenDataProcessing$.set(false);
      return throwError(() => new Error(error));
    }

    const tokenDataRequest: TokenDataRequest = {
      address: walletAddress,
      chainId: this.evmService.providerNetwork$()!.chainId
    };

    console.log('Submitting fetchTokenData to server with this data', tokenDataRequest);
    this.fetchTokenDataError$.set(undefined);
    this.fetchTokenDataProcessing$.set(true);

    const fetchTokenDataHttpCall: (data: TokenDataRequest) => Observable<AlchemyCombinedTokenData> = httpsCallableData(
      this.functions,
      FbFunctionNames.ON_CALL_FETCH_TOKEN_DATA
    );
    const res = fetchTokenDataHttpCall(tokenDataRequest)
      .pipe(
        take(1),
        map(combinedTokenData => {
          console.log('Fetched this combinedTokenData:', combinedTokenData);
          if (!combinedTokenData) {
            throw new Error(`No combinedTokenData in response.`);
          }
          this.fetchTokenDataProcessing$.set(false);
          this.combinedTokenData.set(combinedTokenData);
          return combinedTokenData;
        }),
        shareReplay(),
        catchError(error => {
          this.fetchTokenDataError$.set(error);
          this.fetchTokenDataProcessing$.set(false);
          return throwError(() => new Error(error));
        })
      );

    return res;
  }
}
