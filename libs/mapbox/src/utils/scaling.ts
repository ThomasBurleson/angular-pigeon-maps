/**
 * @license
 * Copyright Mindsapce LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export type Zooming = {
  zoom: number;
  rounded: number;
  delta: number;
};

export class Scaling {
  constructor(
    public scale: number,
    public width: number,
    public height: number
  ) {}
}
