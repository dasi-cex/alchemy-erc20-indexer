import { Component } from '@angular/core';
import { QueryService } from '../services/query.service';

@Component({
  selector: 'app-query-output',
  templateUrl: './query-output.component.html',
  styleUrls: ['./query-output.component.scss']
})
export class QueryOutputComponent {

  constructor(
    public queryService: QueryService
  ) {}

}
