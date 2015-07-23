/// <reference path="../typings/tsd.d.ts" />

class Shuffler {
  public static shuffleArray(array:Array<any>, seed?:number):Array<any> {
    var counter = array.length;
    var temp;
    var index;
    var result = array.slice(0);

    if (seed == null) {
      seed = Math.random();
    }

    // While there are elements in the array
    while (counter > 0) {
      // Pick a random index
      index = Math.floor(this.getSeededRandom(seed++) * counter);

      // Decrease counter by 1
      counter--;

      // And swap the last element with it
      temp = result[counter];
      result[counter] = result[index];
      result[index] = temp;
    }

    return result;
  }

  private static getSeededRandom(seed:number):number {
    var x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
}

export = Shuffler;