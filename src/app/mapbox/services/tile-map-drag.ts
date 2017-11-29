import {DOCUMENT} from '@angular/common';
import {Inject, Injectable} from '@angular/core';

import { Observable } from "rxjs/Observable";
import { Scheduler } from 'rxjs/Scheduler';
import { animationFrame } from 'rxjs/scheduler/animationFrame';

import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/distinctUntilChanged';

import { Point, roundToPrecision } from '../utils/point';

export type PositionCallback = (mEv: MouseEvent) => ((selector: Observable<Point>) => Observable<Point>);

@Injectable()
export class TileMapDrag {
  constructor(@Inject(DOCUMENT) protected document: any) { }

  /**
   * Use `space` keyDown to enable mouse-click-drags to reposition
   * the map
   */
  observeSpaceOn(target:HTMLElement):Observable<Point> {
    const keyDown$    = Observable.fromEvent(window, 'keydown');
    const keyUp$      = Observable.fromEvent(window, 'keyup');
    const hitSpacebar = (ev => ev.keyCode == 32);
      
    return keyDown$
      .filter( hitSpacebar )
      .switchMap( _ => {
        const dragDone$ = keyUp$.concat(this.mouseUp$);
        return this.observeDragOn(target).takeUntil( dragDone$ )
      });
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
      target            : HTMLElement, 
      useMotionSmoothing: boolean          = true,
      capturePositionFn : PositionCallback = null ): Observable<Point> {
    
    const preventDefault = (ev) => ev.preventDefault();
    const mouseDown$ = Observable.fromEvent(target, 'mousedown');
    const mouseMove$ = Observable.fromEvent(this.document, 'mousemove');

    const mouseDrag$ = mouseDown$.switchMap((mEv:MouseEvent) => {
      capturePositionFn = capturePositionFn || capturePosition;
      
      // (1) Get current topLeft parent position (instead of position in parent)
      // Note this (1) ^ is the default logic unless overwritten by the PositionCallback argument.

      return mouseMove$
        .throttleTime( 30, animationFrame ) // limit mouseMove emits to ~ one (1) animationFrame
        .do(  preventDefault )
        .let( capturePositionFn(mEv) )
        .takeUntil( this.mouseUp$ );
    });

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
      const roundLERPs = (x) => roundToPrecision(x, 1);
      const equals = (x:Point, y:Point): boolean  => !!x && !!y && x.matches(y);

      return Observable.interval(0, animationFrame)
          .withLatestFrom( mouseDrag$, (tick, move) => move )
          .scan( lerp )
          .map( roundLERPs )
          .distinctUntilChanged( equals );
    }

    return mouseDrag$;    
  }

  private mouseUp$ = Observable.fromEvent(this.document, 'mouseup');
  
}

// ****************************************************************
// Internal functions
// ****************************************************************

/**
 * Higher-Order (aka Meta) funtion to create a Lettable operation that
 * converts current mouse position to topLeft position
 */
function capturePosition(mouseDownEvent, useRounding = true) {
  const startTopLeft = calculateTopLeftOffset(mouseDownEvent);  // immediate capture of point
  const adjustWithOffset = (currentPosition: Point) => {
          const pos : Point = currentPosition.offsetBy(startTopLeft);
          return useRounding ? roundToPrecision(pos, 0) : pos;
        };

  return (obs):Observable<Point> => obs
      .map( toViewPortPosition )
      .map( adjustWithOffset );
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
function calculateTopLeftOffset(ev):Point {
  const styles    = window.getComputedStyle(ev.currentTarget),
        topLeft   = Point.fromStyle( styles.left, styles.top ),
        start     = new Point( ev.clientX + window.scrollX, ev.clientY + window.scrollY );

  return new Point(topLeft.x - start.x, topLeft.y - start.y);
}


const LERP_RATE = 0.10;
/**
 * Linear interpolation function
 */ 
function lerp(start:Point, end:Point):Point {
  const delta = new Point(end.x - start.x, end.y - start.y);
  
  return new Point(
    start.x + (delta.x * LERP_RATE),
    start.y + (delta.y * LERP_RATE)
  );

};













