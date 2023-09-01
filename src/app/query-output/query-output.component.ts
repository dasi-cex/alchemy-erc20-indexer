import { Component, OnInit, Signal, computed, signal } from '@angular/core';
import { QueryService } from '../services/query.service';
import { EvmService } from '../services/evm.service';
import { EtherscanUrls } from 'shared-models/etherscan-urls.model';
import { EthereumChainIds } from 'shared-models/ethereum-chain-ids.model';

@Component({
  selector: 'app-query-output',
  templateUrl: './query-output.component.html',
  styleUrls: ['./query-output.component.scss']
})
export class QueryOutputComponent implements OnInit {

  etherscanUrl$: Signal<string> = signal(EtherscanUrls.MAINNET);

  constructor(
    public queryService: QueryService,
    public evmService: EvmService
  ) {}

  ngOnInit() {
    this.setEtherscanUrl();
  }

  private setEtherscanUrl() {
    this.etherscanUrl$ = computed(() => {
      switch(this.evmService.providerNetwork$()?.chainId) {
        case EthereumChainIds.MAINNET:
          return EtherscanUrls.MAINNET;
        case EthereumChainIds.SEPOLIA:
          return EtherscanUrls.SEPOLIA;
        case EthereumChainIds.GOERLI:
          return EtherscanUrls.GOERLI;
        default:
          return EtherscanUrls.MAINNET;
      }
    });
  }

}
