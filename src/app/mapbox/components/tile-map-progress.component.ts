
import { 
  Component, 
  ChangeDetectionStrategy
} from "@angular/core";

import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/of';

import { TileMapLoader } from "../services";

@Component({
  selector : 'mb-progress-indicator',
  styleUrls: [
    './tile-map-progress.component.css'
  ],
  template : `
    <div class="pulse_box" *ngIf="loading$ | async as loading">
      <div class="pulse pulse_1"></div>
      <div class="pulse pulse_2"></div>
      <div class="pulse pulse_3"></div>
      <div class="pulse pulse_4"></div>
      <div class="pulse pulse_5"></div>
      <ng-content></ng-content>
    </div>
  `,
  changeDetection : ChangeDetectionStrategy.OnPush
})
export class TileMapProgressIndicator { 
  loading$ : Observable<boolean> = this.loader.loading$;
  
  constructor(private loader: TileMapLoader){ }
}