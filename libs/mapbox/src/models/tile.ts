/**
 * @license
 * Copyright Mindsapce LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Point } from "../utils/point";
import { MapUrlFactory } from "../services/tile-map-provider";

/**
 * `Tile` model used to build a 2-D list/grid TileMap data model
 *
 *  Note: The default grid size is 256 x 256 tiles/cells
 */
export class Tile {
  constructor(
    public left: number,
    public top: number,
    public key: string,
    public url: string,
    public active: boolean = true,
    public width: number = 256,
    public height: number = 256
  ) {}

  get bounds(): object {
    return {
      left: `${this.left}px`,
      top: `${this.top}px`,
      width: `${this.width}px`,
      height: `${this.height}px`
    };
  }

  static trackBy(index, tile): string {
    return tile.key;
  }
}

/**
 * Type signature for the Tile build function
 */
export type TileFactory = (
  x: number,
  y: number,
  zoom: number,
  min: Point,
  active?: boolean
) => Tile;

/**
 * Create a Tile data item that will be used in the HTML layer
 * to load and position an <img> element [for each item].
 */
export function createTileFactory(buildUrl: MapUrlFactory = null): TileFactory {
  return function makeTile(
    x: number,
    y: number,
    zoom: number,
    min: Point,
    active: boolean = true
  ): Tile {
    const left = (x - min.x) * 256;
    const top = (y - min.y) * 256;
    const key = `${x}-${y}-${zoom}`;
    const url = buildUrl(x, y, zoom);

    return new Tile(left, top, key, url, active);
  };
}
