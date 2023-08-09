import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export function isValidAddressValidator(): ValidatorFn {
    const validatorFunction = (control:AbstractControl) : ValidationErrors | null => {

        const value = control.value as string;

        if (!value) {
          return null;
        }

        const hexAddressRegexPattern = new RegExp(/^0x[0-9a-zA-Z]{40}$/);
        const validHexAddress = hexAddressRegexPattern.test(value);
        const ensRegexPattern = new RegExp(/.eth$/);
        const validEnsAddress = ensRegexPattern.test(value.toLocaleLowerCase());
        const isValidAddress = validHexAddress || validEnsAddress;

        return isValidAddress ? null : {invalidAddress: true};
    }

    return validatorFunction;
}