/// <reference path="../typings/index.d.ts" />
/// <reference path="../IPuzzle.ts" />

import noveltheory = require('util/EventSource');
import Shuffler = require('util/Shuffler');
import $ = require('jquery');
import dust = require('dustjs-linkedin')

//==== PRIVATE METHODS ====//
function _processSeed(seedString:string):number {
  var result = 0;
  for (var i = 0; i < seedString.length; i++) {
    result += seedString.charCodeAt(i) / 100;
  }
  return result;
}

function _resetTile($tile:JQuery) {
  $tile.removeClass('decrypted');
  var crypt:string = $tile.data('crypt');
  if (crypt) {
    $tile.text(crypt);
  }
}

function _getLetter(string:string):string {
  var alphabetRegex = /[A-Z]/i;
  if (string && alphabetRegex.test(string[0])) {
    return string[0];
  } else {
    return '';
  }
}

/**
 * A cryptogram puzzle.
 */
class Cryptogram extends noveltheory.EventSource implements IPuzzle {
  private _solution:string;
  private _cryptogram:string;
  private _cypher:string[];
  public $dom:JQuery;

  private _selectedCrypt:string;
  private _selectedDecrypt:string;

  private _eventNamescript:string = '.crypto';

  /**
   * Creates a cryptogram puzzle.
   * @param container
   * @param solution The solution of the puzzle.
   * @param seed The seed to use to shuffle the letters. If not supplied, the solution will become its own seed.
   */
  constructor(container:HTMLElement, solution:string, seed?:number) {
    super();
    this._solution = solution.toUpperCase();

    seed = seed || _processSeed(solution);

    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    var ucAlphabet = alphabet.split('');
    var lcAlphabet = alphabet.toLowerCase().split('');

    this._cypher = Shuffler.shuffleArray(ucAlphabet, seed);
    this._cryptogram = solution.toLowerCase();


    lcAlphabet.forEach((letter, letterIndex) => {
      var regex = new RegExp(letter, "g");
      this._cryptogram = this._cryptogram.replace(regex, this._cypher[letterIndex]);
    });

    dust.render('templates/cryptogram', {alphabet: ucAlphabet}, (err, out) => {
      this.$dom = $(container).html(out);

      var $word = $('<span class="word" />');

      var alphabetRegex = /[A-Z]/i;

      this._cryptogram.split('').forEach((letter, index) => {
        if (letter === ' ') {
          $('.puzzle', this.$dom).append($word);
          $word = $('<span class="word" />');
        } else {
          var newTile = $('<span class="tile" />');
          if (!alphabetRegex.test(letter)) {
            newTile.addClass('punctuation');
          } else {
            newTile.addClass('letter');
            newTile.data('crypt', letter);
            newTile.data('solution', this._solution.charAt(index));
          }
          newTile.text(letter);
          newTile.appendTo($word);
        }
      }, this);

      $('.puzzle', this.$dom).append($word);

      $('.letterBoard .letter', this.$dom).on('click' + this._eventNamescript, this._handleLetterBoardClick.bind(this));
      $('.puzzle .tile', this.$dom).not('.punctuation').on('click' + this._eventNamescript, this._handlePuzzleTileClick.bind(this));
      $(document).on('keyup' + this._eventNamescript, this._handleKeyUp.bind(this));
    });

  }

  private _setSelectedCrypt(letter:string, force?:boolean):string {
    letter = _getLetter(letter);
    if (letter || force) {
      this._selectedCrypt = letter;
    }
    var $puzzleBoard = $('.puzzle', this.$dom);
    $puzzleBoard.find('.tile').not('.decrypted').each((index, element) => {
      $(element).toggleClass('highlight', $(element).text() == this._selectedCrypt);
    });
    return this._selectedCrypt;
  }

  private _setSelectedDecrypt(letter:string, force?:boolean):string {
    letter = _getLetter(letter);
    if (letter || force) {
      this._selectedDecrypt = letter;
    }
    var $letterBoard = $('.letterBoard', this.$dom);
    $letterBoard.find('.highlight').removeClass('highlight');

    if (letter) {
      $letterBoard.find('.letter[data-letter="' + letter + '"]').addClass('highlight');
    }
    var $puzzleBoard = $('.puzzle', this.$dom);
    $puzzleBoard.find('.tile.decrypted').each((index, element) => {
      $(element).toggleClass('decrypt-highlight', $(element).text() == this._selectedDecrypt);
    });
    return this._selectedDecrypt;
  }

  private _handlePuzzleTileClick(event?:JQueryMouseEventObject) {
    this._setSelectedCrypt($(event.target).data('crypt'));
    this._handleLetterInput();
  }

  private _handleLetterBoardClick(event?:JQueryMouseEventObject) {
    this._setSelectedDecrypt($(event.target).text());
    this._handleLetterInput();
  }

  private _handleKeyUp(event?:JQueryKeyEventObject) {
    if (event && event.keyCode) {
      var letter = String.fromCharCode(event.keyCode);
      this._setSelectedDecrypt(letter);
      this._handleLetterInput();
    }
  }

  private _handleLetterInput() {
    if (this._selectedCrypt && this._selectedDecrypt) {
      var matchCount = 0;
      $('.puzzle .tile', this.$dom).each((index, element) => {
        var $tile = $(element);
        if ($tile.data('crypt') == this._selectedCrypt) {
          var decrypt = this._selectedDecrypt;
          setTimeout(() => {
            $tile.text(decrypt).addClass('decrypted');
            this.trigger('decryptLetter');
          }, matchCount * 100);
          matchCount++;
        } else if ($tile.is('.decrypted') && $tile.text() == this._selectedDecrypt) {
          setTimeout(() => {
            this.trigger('clearLetter');
            _resetTile($tile);
          }, matchCount * 100);
          matchCount++;
        }
      });
      this._setSelectedCrypt('', true);
      this._setSelectedDecrypt('', true);
      setTimeout(() => {
        if (this._checkSolution()) {
          this.trigger('complete');
        }
        this.updateLetterBoard();
      }, matchCount * 100);
    }
  }

  private updateLetterBoard():void {
    var usedDecrypt = [];
    $('.puzzle .tile.decrypted', this.$dom).each((index, element) => {
      var letter = $(element).text();
      if (usedDecrypt.indexOf(letter) == -1) {
        usedDecrypt.push(letter);
      }
    });

    $('.letterBoard .letter', this.$dom).each((index, element) => {
      $(element).toggleClass('used', usedDecrypt.indexOf($(element).data('letter')) > -1);
    });
  }

  private _checkSolution():boolean {
    var result = true;
    $('.puzzle .tile.letter', this.$dom).each((index, element) => {
      var $tile = $(element);
      if (!$tile.is('.decrypted') || $tile.text() !== $tile.data('solution')) {
        result = false;
      }
    });

    return result;
  }

  public reset() {
    var count = 0;
    $('.puzzle .tile.decrypted', this.$dom).each((index, element) => {
      setTimeout(() => {
        this.trigger('clearLetter');
        _resetTile($(element));
      }, count * 100);
      count++;
    });
    $('.letterBoard .letter.used', this.$dom).removeClass('used');
  }

  public showErrors():boolean {
    if (!this._checkSolution()) {
      var count = 0;
      $('.puzzle .tile.decrypted', this.$dom).each((index, element) => {
        var $tile = $(element);
        if ($tile.text() != $tile.data('solution')) {
          setTimeout(()=> {
            this.trigger('clearLetter');
            _resetTile($tile);
            this.updateLetterBoard();
          }, count * 100);
          count++;
        }
      });

      return true;
    } else {
      return false;
    }
  }

  public giveHint():boolean {
    if (!this._checkSolution()) {
      var $tiles = $('.puzzle .tile.letter', this.$dom);
      for (var i = 0; i < $tiles.length * 15; i++) {
        var randomIndex = Math.floor(Math.random() * $tiles.length);
        var $tile = $tiles.eq(randomIndex);
        if (!$tile.is('.decrypted') || $tile.text() !== $tile.data('solution')) {
          this._selectedCrypt = $tile.data('crypt');
          this._selectedDecrypt = $tile.data('solution');
          this._handleLetterInput();
          return true;
        }
      }
    }
    return false;
  }

  public destroy():void {
    $(document).off(this._eventNamescript);
  }

}

export = Cryptogram