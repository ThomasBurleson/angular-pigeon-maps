# A Look at Angular Alongside React - Familiar Code

This project will provide a comparison of similarities and best practices between Angular and React applications (and libraries).
Two branches will be provided:

*  `angular`:  Angular Pigeon Maps (with mono-repository)
   * Based on an ES5 implementation [React v16 project](https://github.com/mariusandra/pigeon-maps), this Angular (5.x) implementation uses a mono-repository to publish both the application and library portions of Pigeon Maps. This branch demonstrates the benefits of using Angular with Typescript, DI, and RxJS. 

*  `react`: React Pigeon Maps (with Typescript)
   * Using many of models and services from the Angular.5 version, this Reacet (16) implementation shows the similarity between the two (2) JavaScript technologies.

## Pigeon Maps

This application uses a MapBox library to create a simple application with rich mapping features.

![pigeon-maps-app-ng-5](https://user-images.githubusercontent.com/210413/33245394-dfbf5eec-d2cc-11e7-9b13-683c3a764069.jpg)

Using MapBox API, the `mapbox` library will asynchronously load and build a TileMap display using a specified zoom level and global Latitude/Longitude coordinate.

---

(11/26/2017) - The following features are still **PENDING**:

  *  zooming, and 
  *  mouse drag navigation
  *  touch support

---

<br/>

## Using MapBox

This application is composed of `application` components with a **MapBox** library. 

To use the library, 

1) Import the `MapBoxModule`:

```js
@NgModule({
  imports: [
    BrowserModule,
    MapBoxModule
  ],
  declarations: [
    ....
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

2) Use the the TileMap view component:

```html
<mb-tile-map
  class="mapBox"
  [provider]="'outdoors'"
  [center]="[50.879, 4.6997]" 
  [zoom]="13" >

    <mb-tile-marker 
      *ngFor="let it of markers" 
      [anchor]="it" 
      (selected)="onMarkerSelected(it)">
          <!-- 0...n POI markers -->
    </mb-tile-marker>

</mb-tile-map>
```

## Map Options

The MapBox library publishes seven (7) providers (builders) for tile map urls. Each provider will return different tiles for the current LatLong coordinates
and zoom level.

![pigeon-maps](https://user-images.githubusercontent.com/210413/33244982-0645f180-d2c7-11e7-84eb-78253d16a86f.jpg)


## MapBox Architecture

The library publishes view components, data models, and services. 


![pigeon-maps-source](https://user-images.githubusercontent.com/210413/33249795-19deb062-d2f2-11e7-8438-973e07594155.jpg)

----

Of special note are the reactive (Rx) services:

#### [**TileMapDrag**](https://github.com/ThomasBurleson/angular-pigeon-maps/blob/master/src/app/mapbox/services/tile-map-drag.ts#L48-L70) service

Use Observables to enable map-dragging support. Enable LERP (linear interpolation) to animate each map move.

```js
/**
 * Create an Observable to future mouseDrag events on target element. Emit
 * new topLeft positioning of target element.
 */
TileMapDrag::observeDragOn(
      target            : HTMLElement, 
      useMotionSmoothing: boolean          = true,
      getTopLeft        : PositionCallback = null ): Observable<Point> {

  const mouseDown$ = Observable.fromEvent(target, 'mousedown');
  const mouseMove$ = Observable.fromEvent(this.document, 'mousemove');

  const mouseDrag$ = mouseDown$.switchMap((mEv) => {
    const startOffset = calculateTopLeftOffset(mEv);
    return mouseMove$
      .throttleTime( 2, animationFrame )
      .do(  preventDefault )
      .map( viewPortPosition )
      .let( (getTopLeft || calculateTopLeft)(startOffset) )
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
```  

#### [**TileMapLoader**](https://github.com/ThomasBurleson/angular-pigeon-maps/blob/master/src/app/mapbox/services/tile-map-loader.ts#L33-L50) service

Use Observables to asynchronously load all tile images [that have not been previously loaded]. 
When all images loads are completed, emit a `ready` event to notify all subscribers. 

Also use the **`loading$`** observable to allow application-level components
to be notified when the TileMap view component is updating/refreshing.

```js
/**
 * Load all images; announce done using Observable.
 */
TileMapLoader::load( tiles:Array<Tile> ): Observable<Array<Tile>> {
  const pending : Array<string> = this.extractUnknownUrls(tiles);
  
  // Emit list of tiles only when all the tile url images have been loaded
  return !pending.length ? Observable.of(tiles) : Observable.create( observer => {
    this.loadRequest.next(true);
    
    let list$ = Observable.forkJoin( pending.map(this.loadImage) )
            .subscribe( ready => {
              // Add current list [of recently loaded images] to the registry
              this.registry = this.registry.concat(pending); 
              
              observer.next(tiles);
              observer.complete();

              this.loadRequest.next(false);
            });  

    return () => {
      list$.unsubscribe();   
    };   
  });
}
```






## Development 

Run `ng serve` to build the applicaiton and auto-start a dev web server. Then navigate to `http://localhost:4200/`. 

> The app will automatically reload if you change any of the source files.
