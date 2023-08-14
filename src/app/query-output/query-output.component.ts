import { Component } from '@angular/core';
import { QueryService } from '../services/query.service';

@Component({
  selector: 'app-query-output',
  templateUrl: './query-output.component.html',
  styleUrls: ['./query-output.component.scss']
})
export class QueryOutputComponent {

  // TODO: Turn this into a tab where one tab shows ERC20s and one tab shows NFTs

  constructor(
    public queryService: QueryService
  ) {}

}
