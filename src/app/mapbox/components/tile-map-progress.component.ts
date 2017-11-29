
import { 
  Component, 
  ChangeDetectionStrategy
} from "@angular/core";

import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/of';

import { TileMapLoader } from "../services";

const PULSES = [1,2,3,4,5];

@Component({
  selector : 'mb-progress-indicator',
  styleUrls: [
    './tile-map-progress.component.css'
  ],
  template : `
    <div class="pulse_box" *ngIf="loading$ | async as loading">
      <div *ngFor="let i of pulses" class="pulse pulse_{{i}}"></div>
      <ng-content></ng-content>
    </div>
  `,
  changeDetection : ChangeDetectionStrategy.OnPush
})
export class TileMapProgressIndicator { 
  pulses = PULSES;
  loading$ : Observable<boolean> = this.loader.loading$;
  
  constructor(private loader: TileMapLoader){ }
}