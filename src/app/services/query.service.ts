import { Injectable, inject, signal } from '@angular/core';
import { Functions, httpsCallableData } from '@angular/fire/functions';
import { Observable, catchError, map, shareReplay, take, throwError } from 'rxjs';
import { AlchemyTokenData } from 'shared-models/alchemy-token-data.model';
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
  tokenMetaData$ = signal<AlchemyTokenData[] | undefined>(undefined);

  constructor(
    private evmService: EvmService
  ) { }

  fetchTokenData(walletAddress: string): Observable<AlchemyTokenData[]> {

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

    const fetchTokenDataHttpCall: (data: TokenDataRequest) => Observable<AlchemyTokenData[]> = httpsCallableData(
      this.functions,
      FbFunctionNames.ON_CALL_FETCH_TOKEN_DATA
    );
    const res = fetchTokenDataHttpCall(tokenDataRequest)
      .pipe(
        take(1),
        map(tokenMetadataArray => {
          console.log('Fetched this token metadata:', tokenMetadataArray);
          if (!tokenMetadataArray) {
            throw new Error(`No token metadata in response.`);
          }
          this.fetchTokenDataProcessing$.set(false);
          this.tokenMetaData$.set(tokenMetadataArray);
          return tokenMetadataArray;
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
