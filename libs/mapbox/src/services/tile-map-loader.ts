/**
 * @license
 * Copyright Mindsapce LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Injectable } from "@angular/core";

import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import { Subject } from "rxjs/Subject";

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/forkJoin';

import { Tile } from "../models/tile";


/**
 * Asynchronously load all images that have not been previously loaded
 * When all images loads are completed, announce a `ready` event.
 */
@Injectable()
export class TileMapLoader {
  loading$  : Observable<boolean>;

  constructor() {
    this.loadRequest   = new Subject<boolean>();
    this.loading$      = this.loadRequest.asObservable();
  }

  /**
   * Load all images; announce done using Observable.
   */
  load( tiles:Array<Tile> ): Observable<Array<Tile>> {
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

  /**
   * Return observable for pending image loading 
   */
  private loadImage( url ) {
    return Observable.create(observer => {
      var img = new Image();
          img.src = url;
          img.onload  = () =>    {  observer.next(img);  observer.complete(); observer = null; };
          img.onerror = (err) => {  observer.error(err);  }
    });
 }
  /**
   * Filter the current tile set to extract the urls of new/UNKNOWN
   * tiles.
   */
  private extractUnknownUrls(tiles:Array<Tile>= []):Array<string> {
    const extractUrls = (it:Tile):string => it.url;
    const isNew = (url:string) => (this.registry.indexOf(url) < 0);

    return tiles
      .map(extractUrls)
      .filter(isNew);
  }

  private registry : Array<string> = [ ];

  private loadRequest : Subject<boolean>;
}