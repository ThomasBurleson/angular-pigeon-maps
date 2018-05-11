/**
 * @license
 * Copyright Mindsapce LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Component, ChangeDetectionStrategy } from "@angular/core";

import { Observable } from "rxjs/Observable";
import { TileMapLoader } from "../services";

const PULSES = [1, 2, 3, 4, 5];

@Component({
  selector: "mb-progress-indicator",
  styleUrls: ["./tile-map-progress.component.css"],
  template: `
    <div class="pulse_box" *ngIf="loading$ | async">
      <div *ngFor="let i of pulses" class="pulse pulse_{{i}}"></div>
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TileMapProgressIndicator {
  pulses = PULSES;
  loading$: Observable<boolean> = this.loader.loading$;

  constructor(private loader: TileMapLoader) {}
}
