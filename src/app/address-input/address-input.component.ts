import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { QueryService } from '../services/query.service';
import { take } from 'rxjs';
import { EvmService } from '../services/evm.service';
import { isValidAddressValidator } from '../shared/validators/is-valid-address.validator';

@Component({
  selector: 'app-address-input',
  templateUrl: './address-input.component.html',
  styleUrls: ['./address-input.component.scss']
})
export class AddressInputComponent {

  inputForm = this.fb.group({
    address: ['', [Validators.required, isValidAddressValidator()]],
  });

  constructor(
    private fb: FormBuilder,
    public queryService: QueryService,
    public evmService: EvmService
  ) { }

  onSubmit() {
    const walletAddress = this.address.value;
    this.queryService.fetchTokenData(walletAddress)
      .pipe(take(1))
      .subscribe();
  }

  // First ensure the wallet is connected, then scan the address
  async onScanConnectedWallet() {
    console.log('Found this connected address:', this.evmService.connectedAddress$());
    if (!this.evmService.connectedAddress$()) {
      await this.evmService.fetchAndConfigureProvider();
    }
    
    if (this.evmService.connectedAddress$()) {
      this.address.setValue(this.evmService.connectedAddress$() as string);
      this.onSubmit();
    }
  }

  get address() {return this.inputForm.get('address') as AbstractControl<string>}

}
