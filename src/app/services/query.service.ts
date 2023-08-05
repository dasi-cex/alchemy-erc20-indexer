import { Injectable, inject, signal } from '@angular/core';
import { Functions, httpsCallableData } from '@angular/fire/functions';
import { TokenMetadataResponse } from 'alchemy-sdk';
import { Observable, catchError, map, shareReplay, take, throwError } from 'rxjs';
import { FbFunctionNames } from 'shared-models/fb-function-names.model';

@Injectable({
  providedIn: 'root'
})
export class QueryService {

  private functions: Functions = inject(Functions);

  fetchTokenDataError$ = signal<string | undefined>(undefined);
  fetchTokenDataProcessing$ = signal<boolean>(false);
  tokenMetaData$ = signal<TokenMetadataResponse[] | undefined>(undefined);

  constructor(
    
  ) { }

  fetchTokenData(walletAddress: string): Observable<TokenMetadataResponse[]> {
    console.log('Submitting fetchTokenData to server with this data', walletAddress);
    this.fetchTokenDataError$.set(undefined);
    this.fetchTokenDataProcessing$.set(true);
    console.log('Will deploy to this function name', FbFunctionNames.ON_CALL_FETCH_TOKEN_DATA);

    const fetchTokenDataHttpCall: (data: string) => Observable<TokenMetadataResponse[]> = httpsCallableData(
      this.functions,
      FbFunctionNames.ON_CALL_FETCH_TOKEN_DATA
    );
    const res = fetchTokenDataHttpCall(walletAddress)
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
          return throwError(() => new Error(error));
        })
      );

    return res;
  }
}
