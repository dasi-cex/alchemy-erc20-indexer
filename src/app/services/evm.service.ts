import { Injectable, NgZone, signal } from '@angular/core';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';
import { EthereumChainIds } from 'shared-models/ethereum-chain-ids.model';

@Injectable({
  providedIn: 'root'
})
export class EvmService {

  providerNetwork$ = signal<ethers.providers.Network | undefined>(undefined);
  connectedAddress$ = signal<string | undefined>(undefined);
  currentProvider$ = signal<ethers.providers.Web3Provider | undefined>(undefined);
  listenersActive = false;

  constructor(
    private ngZone: NgZone,
  ) {
    this.fetchAndConfigureProvider()
      .catch(error => {
        console.log('Error configuring provider', error);
      });
   }

  // Trigger a Metamask Provider request
  async fetchAndConfigureProvider() {
    const mmProvider = await this.setCurrentProvider();
    await this.setCurrentAccounts();
    await this.setCurrentNetwork();
    if (!this.listenersActive) {
      this.monitorProviderChanges(mmProvider);
    }
  }

  private async setCurrentProvider() {
    const metamaskProvider = await detectEthereumProvider()
      .catch(error => {
        console.log('Error fetching metamask provider'); 
        throw error;
      });
    this.currentProvider$.set(new ethers.providers.Web3Provider((metamaskProvider as any)));
    return metamaskProvider;
  }

  private async setCurrentAccounts() {
    // This triggers a request to connect a wallet
    const currentAccounts = await (this.currentProvider$()!.send('eth_requestAccounts', []) as Promise<string[]>)
      .catch(error => {
        console.log('Error fetching provider accounts'); 
        throw error;
      }); 
    
    this.connectedAddress$.set(currentAccounts[0]); // Update the accounts
    console.log('Initial connected address is: ', this.connectedAddress$());
  }

  private async setCurrentNetwork() {
    const network = await this.currentProvider$()!.getNetwork()
      .catch(error => {
        console.log('Error fetching network'); 
        throw error;
      }); 

    this.providerNetwork$.set(network);
    console.log('Initial connected chain ID is: ', this.providerNetwork$()?.chainId);
    console.log('Initial connected chain name is: ', this.providerNetwork$()?.name);
  }

  // Initialize the listener for changes to the provider account. Not sure why this only works with metmask provider vs ethers provider
  private monitorProviderChanges(metamaskProvider: any) {
    this.listenersActive = true;
    metamaskProvider?.on('accountsChanged', (accounts: string[]) => {
      // Running this inside of ngZone because otherwise the change detection isn't triggered on observable update
      this.ngZone.run(() => {
        this.connectedAddress$.set(accounts[0]); // Update the accounts
        console.log('New connected address is:', this.connectedAddress$());
      })
    })

    metamaskProvider?.on('chainChanged', async (chainId: string) => {
      console.log('Chain change detected');
      // Running this inside of ngZone because otherwise the change detection isn't triggered on observable update
      const network = await this.currentProvider$()!.detectNetwork()
      .catch(error => {
        console.log('Error fetching network'); 
        throw error;
      });
      
      this.ngZone.run(() => {
        this.providerNetwork$.set(network); // Update the network
        console.log('New connected network is:', this.providerNetwork$()?.name);
      })
    })
  };

  isValidNetwork(): boolean {
    const chainId = this.providerNetwork$()?.chainId
    if (chainId && EthereumChainIds[chainId]) {
      return true;
    }
    return false;
  }

  isValidEnsRequest(address: string): boolean {
    const ensRegexPattern = new RegExp(/.eth$/);
    const validEnsAddress = ensRegexPattern.test(address.toLocaleLowerCase());
    const chainId = this.providerNetwork$()?.chainId;
    if (validEnsAddress && chainId !== EthereumChainIds.MAINNET) {
      return false;
    }
    return true;
  }
}
