/**
 * @license
 * Copyright Mindsapce LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";

import { Observable } from "rxjs/Observable";
import { animationFrame } from "rxjs/scheduler/animationFrame";
import { fromEvent } from "rxjs/observable/fromEvent";
import { interval } from "rxjs/observable/interval";
import {
  switchMap,
  tap,
  map,
  throttleTime,
  filter,
  concat,
  takeUntil,
  withLatestFrom,
  scan,
  distinctUntilChanged
} from "rxjs/operators";

import { Point, roundToPrecision } from "../utils/point";

export type ObservableOperator<T> = ((
  selector: Observable<T>
) => Observable<Point>);
export type PositionCallback<T> = (mEv: T) => ObservableOperator<T>;

@Injectable()
export class TileMapDrag {
  constructor(@Inject(DOCUMENT) protected document: any) {}

  private mouseUp$ = fromEvent(this.document, "mouseup");

  /**
   * Use `space` keyDown to enable mouse-click-drags to reposition
   * the map
   */
  observeSpaceOn(target: HTMLElement): Observable<Point> {
    const keyDown$ = fromEvent(window, "keydown");
    const keyUp$ = fromEvent(window, "keyup");
    const hitSpacebar = ev => ev.keyCode === 32;

    return keyDown$.pipe(
      filter(hitSpacebar),
      switchMap(_ => {
        const dragDone$ = keyUp$.pipe(concat(this.mouseUp$));
        return this.observeDragOn(target).pipe(takeUntil(dragDone$));
      })
    );
  }
  /**
   * Create an Observable to future mouseDrag events on target element. Emit
   * new topLeft positioning of target element.
   *
   * @param target HTML element (with absolute positioning )
   * @param useMotionSmoothing Use LERP motion smoothing ?
   * @param calculateTopLeftFn Partial application used to convert the current mouse position
   */
  observeDragOn(
    target: HTMLElement,
    useMotionSmoothing: boolean = true,
    capturePositionFn: PositionCallback<MouseEvent> = null
  ): Observable<Point> {
    const preventDefault = ev => ev.preventDefault();
    const mouseDown$ = fromEvent(target, "mousedown");
    const mouseMove$ = fromEvent(this.document, "mousemove");

    const mouseDrag$ = mouseDown$.pipe(
      switchMap((mEv: MouseEvent) => {
        capturePositionFn = capturePositionFn || capturePosition;

        // (1) Get current topLeft parent position (instead of position in parent)
        // Note this (1) ^ is the default logic unless overwritten by the PositionCallback argument.

        return mouseMove$.pipe(
          throttleTime(30, animationFrame), // limit mouseMove emits to ~ one (1) animationFrame
          tap(preventDefault),
          capturePositionFn(mEv),
          takeUntil(this.mouseUp$)
        );
      })
    );

    /**
     * For each animation frame, use the latest mouseDrag event to
     * LERP (linearly interpolated) the movement from the current position
     * to the 'latest' position. Here we use `.scan()` that accumulates
     * each animation frame the interpolated point...
     *
     * New mouseMove events are LERPed with the recent ACCUMULATED values
     *
     * Note: If animation frame is 60fps, then each frame ~= 33ms.
     *       With LERP_RATE == 0.10, the total interpolated movement
     *       requires ~330ms.
     */

    if (useMotionSmoothing) {
      const roundLERPs = x => roundToPrecision(x, 1);
      const equals = (x: Point, y: Point): boolean =>
        !!x && !!y && x.matches(y);

      return interval(0, animationFrame).pipe(
        withLatestFrom(mouseDrag$, (tick, move) => move),
        scan(lerp),
        map(roundLERPs),
        distinctUntilChanged(equals)
      );
    }

    return mouseDrag$;
  }
}

// ****************************************************************
// Internal functions
// ****************************************************************

/**
 * Higher-Order (aka Meta) funtion to create a Lettable operation that
 * converts current mouse position to topLeft position
 */
function capturePosition<T>(mouseDownEvent, useRounding = true) {
  const startTopLeft = calculateTopLeftOffset(mouseDownEvent); // immediate capture of point
  const adjustWithOffset = (currentPosition: Point) => {
    const pos: Point = currentPosition.offsetBy(startTopLeft);
    return useRounding ? roundToPrecision(pos, 0) : pos;
  };

  return (obs: Observable<MouseEvent>): Observable<Point> =>
    obs.pipe(map(toViewPortPosition), map(adjustWithOffset));
}

/**
 * Determine the current point of the mouseEvent relative to the upper left edge of the
 * content area (the viewport) of the browser window. Note: this point does not move even
 * if the user moves a scrollbar from within the browser.
 */
function toViewPortPosition(mouseEv: MouseEvent): Point {
  return new Point(mouseEv.clientX, mouseEv.clientY);
}

/**
 * For the current mouseDown event, calculate the
 * offset from the element's topLeft corner (relative to its parent)
 */
function calculateTopLeftOffset(ev): Point {
  const styles = window.getComputedStyle(ev.currentTarget),
    topLeft = Point.fromStyle(styles.left, styles.top),
    start = new Point(ev.clientX + window.scrollX, ev.clientY + window.scrollY);

  return new Point(topLeft.x - start.x, topLeft.y - start.y);
}

const LERP_RATE = 0.1;
/**
 * Linear interpolation function
 */

function lerp(start: Point, end: Point): Point {
  const delta = new Point(end.x - start.x, end.y - start.y);

  return new Point(
    start.x + delta.x * LERP_RATE,
    start.y + delta.y * LERP_RATE
  );
}
