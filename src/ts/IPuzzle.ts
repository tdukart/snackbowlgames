/// <reference path="typings/tsd.d.ts" />

interface IPuzzle {
  destroy():void
  giveHint():boolean
  showErrors():boolean
  reset()
}