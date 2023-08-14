import { Pipe, PipeTransform } from '@angular/core';
import { BigNumber } from 'ethers';
import { AlchemyErc20TokenData } from 'shared-models/alchemy-token-data.model';

@Pipe({
  name: 'hexBalanceToDecimal'
})
export class HexBalanceToDecimalPipe implements PipeTransform {

  transform(tokenData: AlchemyErc20TokenData): number {
    if (!tokenData || typeof tokenData !== 'object' || !tokenData.hexBalance || !tokenData.metaData.decimals) {
      return 0;
    }

    const hexBalance = tokenData.hexBalance;
    const decimalsQty = tokenData.metaData.decimals;

    const bigNumber = BigNumber.from(hexBalance);
    const decimalValue = bigNumber.div(BigNumber.from(10).pow(decimalsQty));
    const remainder = bigNumber.mod(BigNumber.from(10).pow(decimalsQty));
    const fractionalValue = remainder.mul(100).div(BigNumber.from(10).pow(decimalsQty));

    const formattedOutput = `${decimalValue}.${fractionalValue.toString().padStart(2, '0')}`;
    return +formattedOutput;
  }

}
