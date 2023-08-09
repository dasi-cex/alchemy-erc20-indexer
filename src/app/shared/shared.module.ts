import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HexBalanceToDecimalPipe } from './pipes/hex-balance-to-decimal.pipe';



@NgModule({
  declarations: [
    HexBalanceToDecimalPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
    HexBalanceToDecimalPipe
  ]
})
export class SharedModule { }
