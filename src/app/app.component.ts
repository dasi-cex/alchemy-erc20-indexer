import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ng-erc20-indexer';
  version = '0.0.4';
  showVersion = false;

  onShowVersion() {
    this.showVersion = !this.showVersion;
  }

}
