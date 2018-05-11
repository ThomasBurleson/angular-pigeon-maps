/**
 * @license
 * Copyright Mindsapce LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { TileMapCoordinates } from "../models/tile-map-info";
import { Scaling } from "./scaling";
import { Point } from "./point";
import { TileMap } from "../models/tile-map";

export type CSS_Style = { [key: string]: string | number | null };

/**
 * Exported MapStyles for inline CSS in the TileMap
 */
export type MapStyles = {
  box: CSS_Style;
  list: CSS_Style;
};

/**
 * TileMapStyles uses a TileMap to generate appropriate inline CSS for both
 * the TileMap box and the tile list
 */
export class TileMapStyles {
  get styles(): MapStyles {
    return this.buildStyles();
  }

  constructor(map: TileMap) {
    this.coordinates = map.coordinates;
  }

  /**
   * Build TileMap styles based on current configuration
   */
  private buildStyles(): MapStyles {
    return {
      box: this.buildBoxStyles(),
      list: this.buildListStyles()
    } as MapStyles;
  }

  /**
   * Build the CSS styles for the TileMap Box
   */
  buildBoxStyles(): CSS_Style {
    const scaling: Scaling = this.coordinates.scaling;

    return {
      top: 0,
      left: 0,
      width: `${scaling.width}px`,
      height: `${scaling.height}px`,
      position: "absolute",
      overflow: "hidden",
      willChange: "transform",
      transform: `scale(${scaling.scale}, ${scaling.scale})`,
      transformOrigin: "top left"
    };
  }

  /**
   * Build the CSS styles for the TileMap <img> set
   */
  buildListStyles(): CSS_Style {
    const scaling: Scaling = this.coordinates.scaling;
    const max: Point = this.coordinates.max;
    const min: Point = this.coordinates.min;
    const center: Point = this.coordinates.center;
    const left: number = -((center.x - min.x) * 256 - scaling.width / 2);
    const top: number = -((center.y - min.y) * 256 - scaling.height / 2);

    return {
      position: "absolute",
      width: `${(max.x - min.x + 1) * 256}px`,
      height: `${(max.y - min.y + 1) * 256}px`,
      "will-change": "transform",
      transform: `translate(${left}px, ${top}px)`,
      "pointer-events": "none"
    };
  }

  /**
   *
   */
  private coordinates: TileMapCoordinates;
}
