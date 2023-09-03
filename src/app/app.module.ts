import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { getApp, initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { ReCaptchaEnterpriseProvider, initializeAppCheck, provideAppCheck } from '@angular/fire/app-check';
import { environment } from '../environments/environment';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { provideFunctions,getFunctions } from '@angular/fire/functions';
import { AddressInputComponent } from './address-input/address-input.component';
import { QueryOutputComponent } from './query-output/query-output.component';

@NgModule({
  declarations: [
    AppComponent,
    AddressInputComponent,
    QueryOutputComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAppCheck(() => initializeAppCheck(getApp(), {
      provider: new ReCaptchaEnterpriseProvider('6Lcr9vYnAAAAAKjavvSIW4qOxCclaqmq5a83Bq4j'),
      isTokenAutoRefreshEnabled: true
    })),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions())
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
