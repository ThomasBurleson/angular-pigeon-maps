/**
 * @license
 * Copyright Mindsapce LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from "@angular/core";

import { TileMapComponent } from "../components";
import { isRetina, Point, LatLong } from "../utils";

@Component({
  selector: "mb-tile-marker",
  template: `
  <div className='tileMarker'  
      [ngStyle]="markerPosition"
      (click)="select.emit($event)"
      (mouseover)="this.selected = true;"
      (mouseout)="this.selected = false;" >

        <img [src]="markerUrl" width="29" height="34" />

  </div>
  `
})
export class TileMarkerComponent {
  /**
   * LatLong values that should be converted to pixel coordinates (by TileMap)
   */
  @Input() anchor: Array<number>;
  @Input() enablePointer = true;
  @Input()
  set selected(value: boolean) {
    this._isSelected = value;
    this.select.emit(this);
  }
  get selected(): boolean {
    return this._isSelected;
  }

  @Output()
  select: EventEmitter<TileMarkerComponent> = new EventEmitter<
    TileMarkerComponent
  >();

  // ********************************************
  // Template properties
  // ********************************************

  /**
   *  Pixel coordinates for Marker image
   *  Note: this is derived from the LatLong `anchor` point...
   */
  topLeft = new Point(50, 20);

  /**
   * Use alternate images based on Retina display and `isSelected` value
   */
  get markerUrl(): string {
    const url = this.selected
      ? isRetina()
        ? "pin-hover@2x.png"
        : "pin-hover.png"
      : isRetina()
        ? "pin@2x.png"
        : "pin.png";

    return `assets/img/${url}`;
  }

  /**
   *
   */

  get markerPosition() {
    const anchorPt = new LatLong(this.anchor[0], this.anchor[1]);
    return {
      position: "absolute",
      cursor: this.enablePointer ? "pointer" : "default",
      transform: `translate(${this.topLeft.x - 15}px, ${this.topLeft.y - 31}px)`
    };
  }

  /**
   * Is the current marker selected (displayed as hovered state)
   */
  protected _isSelected = false;
}
