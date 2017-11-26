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

import { Point } from '../utils/point';

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
      capturePosition   : PositionCallback = null ): Observable<Point> {
    
    const mouseDown$ = Observable.fromEvent(target, 'mousedown');
    const mouseMove$ = Observable.fromEvent(this.document, 'mousemove');

    const mouseDrag$ = mouseDown$.switchMap((mEv:MouseEvent) => {
      capturePosition = capturePosition || captureTopLeftStart;
      
      // Get current position relative to start topleft
      // unless overwritter by the PositionCallback argument.
      const calculateCurrentPosition = capturePosition(mEv);

      return mouseMove$
      .throttleTime( 2, animationFrame )
      .do(  preventDefault )
        .map( viewPortPosition )
        .let( calculateCurrentPosition )
        .takeUntil( this.mouseUp$ );
    });

    /**
     * Mouse/touch moves linearly interpolated on every animation frame
     */ 
    if (useMotionSmoothing) {
      return Observable.interval(0, animationFrame)
          .withLatestFrom(mouseDrag$, (tick, move) => move)
          .scan(lerp);
    }

    return mouseDrag$;    
  }

  private mouseUp$ = Observable.fromEvent(this.document, 'mouseup');
  
}

// ****************************************************************
// Internal functions
// ****************************************************************

/**
 * Kill all default mouse event responses
 */
function preventDefault(event) {
  event.preventDefault();
}

/**
 * Determine the current point of the mouseEvent relative to the upper left edge of the 
 * content area (the viewport) of the browser window. Note: this point does not move even 
 * if the user moves a scrollbar from within the browser.
 */
function viewPortPosition(mouseEv: MouseEvent): Point {
  return new Point(mouseEv.clientX, mouseEv.clientY);
}

/**
 * For the current mouseDown event, calculate the
 * offset from the element's topLeft corner
 */
function calculateTopLeftOffset(ev):Point {
  const styles    = window.getComputedStyle(ev.currentTarget),
        topLeft   = Point.fromStyle( styles.left, styles.top ),
        start     = new Point( ev.clientX + window.scrollX, ev.clientY + window.scrollY );

  return new Point(topLeft.x - start.x, topLeft.y - start.y);
}

/**
 * Partial application to create a Lettable operation that
 * converts current mouse position to topLeft position
 */
function captureTopLeftStart(mouseDownEvent) {
  const startTopLeft = calculateTopLeftOffset(mouseDownEvent);
  const convertPosition = (currentPosition: Point) => {
          return currentPosition.offsetBy(startTopLeft);
        };
  return (obs):Observable<Point> => obs.map(convertPosition);
}

/**
 * Linear interpolation function
 */ 
function lerp(start:Point, end:Point):Point {
  const rate = 0.10;
  const delta = new Point(end.x - start.x, end.y - start.y);
  
  return new Point(
    start.x + (delta.x * rate),
    start.y + (delta.y * rate)
  );
};











