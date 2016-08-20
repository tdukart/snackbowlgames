/// <reference path="typings/index.d.ts" />

interface IPuzzle {
  destroy():void
  giveHint():boolean
  showErrors():boolean
  reset()
}