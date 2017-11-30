/**
 * RxJS Tween functionality based on talks by @BenLesh
 * 
 * @example(1)
 *  // Rotate handle like clock. 
 *  // Each tick movement is motion-animated with tween over 900ms.
 *  
 *  const clockHand = document.querySelector('.clockHand');
 * 
 *  Observable.timer(0, 1000)
 *    .map(t => t * 360 / 60 )          // convert to rotation degrees (with 60 increments)
 *    .let( tween(900, elasticOut) )    // in 900ms, tween the change in rotation [from one position to the next]
 *    .subscribe( val => {
 *      clockHand.style.transform = `rotate(${val}deg)` 
 *    });
 *
 * @example(2)
 *  // Drop 1..n balls 300px vertically (duration == 900ms) 
 *  // with a stagger of 500ms between each
 * 
 *  const balls = document.querySelectorAll('.ball');
 *  const moveBall = (ball) => (source$) => source$.do(val => {
 *          ball.style.transform = `translate3d(0, ${val}px, 0)`;
 *        });
 * 
 *  Observable.from(balls)
 *    .concatMap((ball, i) => Observable.of(300)
 *        .delay( i * 500 )
 *        .let( tween(900, elasticOut) )
 *        .let( moveBall(ball) )
 *     )
 *    .subscribe(_ => console.log('All ball animations done!') );
 *
 * @see https://www.youtube.com/watch?v=X_RnO7KSR-4
 */

import { Observable } from "rxjs/Observable";
import { Scheduler } from 'rxjs/Scheduler';
import { animationFrame } from 'rxjs/scheduler/animationFrame';

import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/startWith';


/**
 * tween() is a higher-order function to specify a duration and easing
 * for any animation observable.
 * 
 * @param ms tween duration value
 * @param easing penner easing function
 */
export const tween = (duration:number, easing) => (timer$):Observable<number> =>
timer$
  .let( prevAndCurrent(0) )
  .switchMap( ([initTime, nextTime]) => {
    return timerFor(duration)
      .map( easing )
      .map( tweenValue(nextTime - initTime) )
      .map( partial => initTime + partial )
  });

// *****************************************************************************
// Private functions
// *****************************************************************************

/**
 * Create a timer whose interval is based on the scheduler
 * 
 * @param scheduler Defaults to an AnimationFrame timer
 */
const timer = (scheduler = animationFrame) =>
  Observable.defer(()=> {
    const start = scheduler.now();
    return Observable.interval(0, scheduler)
      .map(() => scheduler.now() - start);
  });

/**
 * Created a Timer that only emits [values between 0...1] for a specifc duration.
 * 
 * @param ms duration in milliseconds for the timer to run
 * @param scheduler Defaults to AnimationFrame time
 */
const timerFor = (ms:number, scheduler = animationFrame ) => 
  timer(scheduler)
  .map(elapsed => elapsed/ms)
  .takeWhile( t => t <= 1 )
  .concat(Observable.of(1));
  
/**
 * Higher order function to capture the total value 
 * used to determine partial value over partial time (0...1)
 * 
 * @param v Total value 
 */
const tweenValue = (v) => (t) => t * v; 

/**
 * ElasticOut Easing function
 * @param t number value between 0->1
 */
const elasticOut = (t) => {
  return Math.sin(-13.0 * (t + 1.0) * Math.PI/2) * Math.pow(2.0, -10.0 * t) + 1.0;
};

/**
 * Grouping operator to gather start-end time
 * @param initiaPos 
 */
const prevAndCurrent = (initiaTime) => (time$) => 
  time$
    .startWith(initiaTime)
    .bufferCount(2, 1);

