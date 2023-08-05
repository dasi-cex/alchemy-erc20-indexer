import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { QueryService } from '../services/query.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-address-input',
  templateUrl: './address-input.component.html',
  styleUrls: ['./address-input.component.scss']
})
export class AddressInputComponent {

  inputForm = this.fb.group({
    address: ['', [Validators.required, Validators.pattern(/^0x[0-9a-zA-Z]{40}$/)]],
  });

  constructor(
    private fb: FormBuilder,
    private queryService: QueryService
  ) { }

  onSubmit() {
    const walletAddress = this.address.value;
    this.queryService.fetchTokenData(walletAddress)
      .pipe(take(1))
      .subscribe();
  }
  
  get address() {return this.inputForm.get('address') as AbstractControl<string>}

}
