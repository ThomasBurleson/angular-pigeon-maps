/**
 * @license
 * Copyright Mindsapce LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Scaling } from "./scaling";
import { Point, Range, BoundingRect } from "./point";

/**
 * Ensure that the bounds are { >= 0 , < Math.pow(2, zoom) }
 */
export function constrainRange(src: Range, zoom: number): Range {
  return {
    min: new Point(
      Math.max(src.min.x, 0),
      Math.max(src.min.y, 0)
    ),
    max: new Point(
      Math.min(src.max.x, Math.pow(2, zoom) - 1),
      Math.min(src.max.y, Math.pow(2, zoom) - 1)
    )
  };
}


  