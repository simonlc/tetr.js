/*
Author: Simon Laroche
Site: http://simon.lc/

Note: Before looking at this code, it would be wise to do a bit of reading about
the game so you know why some things are done a certain way.
*/
'use strict';

var version = '0.1.7';

/**
 * Playfield.
 */
var cellSize;
var stack;

/**
 * Get html elements. 
 */
var msg = document.getElementById('msg');
var stats = document.getElementById('stats');
var statsTime = document.getElementById('time');
var statsLines = document.getElementById('line');
var statsPiece = document.getElementById('piece');
var h3 = document.getElementsByTagName('h3');
var set = document.getElementById('settings');

// Get canvases and contexts
var holdCanvas = document.getElementById('hold');
var bgStackCanvas = document.getElementById('bgStack');
var stackCanvas = document.getElementById('stack');
var activeCanvas = document.getElementById('active');
var previewCanvas = document.getElementById('preview');
var spriteCanvas = document.getElementById('sprite');

var holdCtx = holdCanvas.getContext('2d');
var bgStackCtx = bgStackCanvas.getContext('2d');
var stackCtx = stackCanvas.getContext('2d');
var activeCtx = activeCanvas.getContext('2d');
var previewCtx = previewCanvas.getContext('2d');
var spriteCtx = spriteCanvas.getContext('2d');

/**
*Pausing variables
*/

var startPauseTime = 0;
var pauseTime = 0;

/**
 * Piece data
 */

// NOTE y values are inverted since our matrix counts from top to bottom.
var kickData = [
  [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]]
];
var kickDataI = [
  [[0, 0], [-1, 0], [2, 0], [-1, 0], [2, 0]],
  [[-1, 0], [0, 0], [0, 0], [0, -1], [0, 2]],
  [[-1, -1], [1, -1], [-2, -1], [1, 0], [-2, 0]],
  [[0, -1], [0, -1], [0, -1], [0, 1], [0, -2]]
];
// TODO get rid of this lol.
var kickDataO = [
  [[0, 0]],
  [[0, 0]],
  [[0, 0]],
  [[0, 0]]
];

// Define shapes and spawns.
var PieceI = {
  index: 0,
  x: 2,
  y: -1,
  kickData: kickDataI,
  tetro: [
    [0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0]]
};
var PieceJ = {
  index: 1,
  x: 3,
  y: 0,
  kickData: kickData,
  tetro: [
    [2, 2, 0],
    [0, 2, 0],
    [0, 2, 0]]
};
var PieceL = {
  index: 2,
  x: 3,
  y: 0,
  kickData: kickData,
  tetro: [
    [0, 3, 0],
    [0, 3, 0],
    [3, 3, 0]]
};
var PieceO = {
  index: 3,
  x: 4,
  y: 0,
  kickData: kickDataO,
  tetro: [
    [4, 4],
    [4, 4]]
};
var PieceS = {
  index: 4,
  x: 3,
  y: 0,
  kickData: kickData,
  tetro: [
    [0, 5, 0],
    [5, 5, 0],
    [5, 0, 0]]
};
var PieceT = {
  index: 5,
  x: 3,
  y: 0,
  kickData: kickData,
  tetro: [
    [0, 6, 0],
    [6, 6, 0],
    [0, 6, 0]]
};
var PieceZ = {
  index: 6,
  x: 3,
  y: 0,
  kickData: kickData,
  tetro: [
    [7, 0, 0],
    [7, 7, 0],
    [0, 7, 0]]
};
var pieces = [PieceI, PieceJ, PieceL, PieceO, PieceS, PieceT, PieceZ];

/**
 * Gameplay specific vars.
 */
var holdPiece;
var shift;
var gravityUnit = 0.00390625;
var gravity;
var gravityArr = (function() {
  var array = [];
  array.push(0);
  for (var i = 1; i < 64; i++)
    array.push(i / 64);
  for (var i = 1; i <= 20; i++)
    array.push(i);
  return array;
})();

var settings = {
  DAS: 10,
  ARR: 1,
  Gravity: 0,
  'Soft Drop': 31,
  'Lock Delay': 30,
  Size: 0,
  Sound: 0,
  Volume: 100,
  Block: 0,
  Ghost: 0,
  Grid: 0,
  Outline: 0
};

var setting = {
  DAS: range(0,31),
  ARR: range(0,11),
  Gravity: (function() {
    var array = [];
    array.push('Auto');
    array.push('0G');
    for (var i = 1; i < 64; i++)
      array.push(i + '/64G');
    for (var i = 1; i <= 20; i++)
      array.push(i + 'G');
    return array;
  })(),
  'Soft Drop': (function() {
    var array = [];
    for (var i = 1; i < 64; i++)
      array.push(i + '/64G');
    for (var i = 1; i <= 20; i++)
      array.push(i + 'G');
    return array;
  })(),
  'Lock Delay': range(0,101),
  Size: ['Auto', 'Small', 'Medium', 'Large'],
  Sound: ['Off', 'On'],
  Volume: range(0, 101),
  Block: ['Shaded', 'Solid', 'Glossy', 'Arika', 'World'],
  Ghost: ['Normal', 'Colored', 'Off'],
  Grid: ['Off', 'On'],
  Outline: ['Off', 'On']
};

var frame;
var inc;
var setLoop;

/**
 * 0 = Normal
 * 1 = win
 * 2 = countdown
 * 3 = game not played
 * 9 = loss
 */
var gameState = 3;

var paused = false;
var lineLimit;
var grabBag;

var replayKeys;
var watchingReplay = false;
var toGreyRow;
var gametype;
var lastX, lastY, lastPos, landed, newPiece;

// Stats
var lines;
var piecesSet;
var startTime;

// Keys
var keysDown;
var lastKeys;
var released;
var shiftReleased;
var arrowReleased = true;
var arrowDelay = 0;

var binds = {
  pause: 27,
  moveLeft: 37,
  moveRight: 39,
  moveDown: 40,
  hardDrop: 32,
  holdPiece: 67,
  rotRight: 88,
  rotLeft: 90,
  rot180: 16,
  retry: 82
};
var flags = {
  hardDrop: 1,
  moveRight: 2,
  moveLeft: 4,
  moveDown: 8,
  holdPiece: 16,
  rotRight: 32,
  rotLeft: 64,
  rot180: 128,
};

var key = {
  8: 'Backspace', 9: 'Tab',     13: 'Enter',  16: 'Shift',
  17: 'Ctrl',     18: 'Alt',    19: 'Pause',  20: 'Caps Lock',
  27: 'Esc',      32: 'Space',  33: 'PgUp',   34: 'PgDn',
  35: 'End',      36: 'Home',   37: '←',      38: '↑',
  39: '→',        40: '↓',      45: 'Insert', 46: 'Delete',
  48: '0',        49: '1',      50: '2',      51: '3',
  52: '4',        53: '5',      54: '6',      55: '7',
  56: '8',        57: '9',      59: ';',      61: '=',
  65: 'A',        66: 'B',      67: 'C',      68: 'D',
  69: 'E',        70: 'F',      71: 'G',      72: 'H',
  73: 'I',        74: 'J',      75: 'K',      76: 'L',
  77: 'M',        78: 'N',      79: 'O',      80: 'P',
  81: 'Q',        82: 'R',      83: 'S',      84: 'T',
  85: 'U',        86: 'V',      87: 'W',      88: 'X',
  89: 'Y',        90: 'Z',      96: '0kpad',  97: '1kpad',
  98: '2kpad',    99: '3kpad',  100: '4kpad', 101: '5kpad',
  102: '6kpad',   103: '7kpad', 104: '8kpad', 105: '9kpad',
  106: '*',       107: '+',     109: '-',     110: '.',
  111: '/',       112: 'F1',    113: 'F2',    114: 'F3',
  115: 'F4',      116: 'F5',    117: 'F6',    118: 'F7',
  119: 'F8',      120: 'F9',    121: 'F10',   122: 'F11',
  123: 'F12',     173: '-',     187: '=',     188: ',',
  190: '.',       191: '/',     192: '`',     219: '[',
  220: '\\',      221: ']',     222: "'"
}

function resize() {
  var a = document.getElementById('a');
  var b = document.getElementById('b');
  var c = document.getElementById('c');
  var content = document.getElementById('content');

  // TODO Finalize this.
  // Aspect ratio: 1.024
  var screenHeight = window.innerHeight - 34;
  var screenWidth = ~~(screenHeight * 1.024);
  if (screenWidth > window.innerWidth)
    screenHeight = ~~(window.innerWidth / 1.024);

  if (settings.Size === 1 && screenHeight > 602) cellSize = 15;
  else if (settings.Size === 2 && screenHeight > 602) cellSize = 30;
  else if (settings.Size === 3 && screenHeight > 902) cellSize = 45;
  else cellSize = Math.max(~~(screenHeight / 20), 10);

  var pad = (window.innerHeight - (cellSize * 20 + 2)) / 2 + 'px';
  content.style.padding = pad + ' 0';
  stats.style.bottom = pad;

  // Size elements
  a.style.padding = '0 0.5rem ' + ~~(cellSize / 2) + 'px';

  stackCanvas.width = activeCanvas.width = bgStackCanvas.width = cellSize * 10;
  stackCanvas.height = activeCanvas.height = bgStackCanvas.height = cellSize * 20;
  b.style.width = stackCanvas.width + 'px';
  b.style.height = stackCanvas.height + 'px';

  holdCanvas.width = cellSize * 4;
  holdCanvas.height = cellSize * 2;
  a.style.width = holdCanvas.width + 'px';
  a.style.height = holdCanvas.height + 'px';

  previewCanvas.width = cellSize * 4;
  previewCanvas.height = stackCanvas.height;
  c.style.width = previewCanvas.width + 'px';
  c.style.height = b.style.height;

  // Scale the text so it fits in the thing.
  // TODO get rid of extra font sizes here.
  msg.style.lineHeight = b.style.height;
  msg.style.fontSize = ~~(stackCanvas.width / 6) + 'px';
  stats.style.fontSize = ~~(stackCanvas.width / 11) + 'px';
  document.documentElement.style.fontSize = ~~(stackCanvas.width / 16) + 'px';

  stats.style.width = a.style.width;
  for (var i = 0, len = h3.length; i < len; i++) {
    h3[i].style.lineHeight = a.style.height;
    h3[i].style.fontSize = stats.style.fontSize;
  }

  // Redraw graphics
  makeSprite();

  if (settings.Grid === 1)
    bg(bgStackCtx);

  if (gameState === 0) {
    if (!settings.Ghost) {
      draw(fallingPiece.tetro, fallingPiece.x,
           fallingPiece.y + fallingPiece.getDrop(22), activeCtx, 0);
    } else if (settings.Ghost === 1) {
      draw(fallingPiece.tetro, fallingPiece.x,
           fallingPiece.y + fallingPiece.getDrop(22), activeCtx);
    }
    draw(fallingPiece.tetro, fallingPiece.x, fallingPiece.y, activeCtx);
    drawStack();
    drawPreview();
    if (holdPiece) {
      if (holdPiece === 0 || holdPiece === 3) {
        draw(pieces[holdPiece].tetro, pieces[holdPiece].x - 3,
             2 + pieces[holdPiece].y, holdCtx);
      } else {
        draw(pieces[holdPiece].tetro, pieces[holdPiece].x - 2.5,
             2 + pieces[holdPiece].y, holdCtx);
      }
    }
  }
}
addEventListener('resize', resize, false);

/**
 * ========================== Model ===========================================
 */

/**
 * Resets all the settings and starts the game.
 */
function init(gt) {
  if (gt === 'replay') {
    watchingReplay = true;
  } else {
    watchingReplay = false;
    replayKeys = {};
    replayKeys.seed = ~~(Math.random() * 2147483645) + 1;
    gametype = gt;
  }

  lineLimit = 40;

  //Reset
  keysDown = 0;
  lastKeys = 0;
  released = 255;
  shift = 0;
  shiftReleased = true;

  rng.seed = replayKeys.seed;
  toGreyRow = 21;
  frame = 0;
  inc = 0;
  lastPos = 'reset';
  fallingPiece.reset();
  stack = newGrid(10, 22);
  holdPiece = void 0;
  if (settings.Gravity === 0) gravity = gravityUnit * 4;
  startTime = Date.now();

  //XXX fix ugly code lolwut
  while (1) {
    grabBag = randomGenerator();
    if ([3,4,6].indexOf(grabBag[0]) === -1) break;
  }
  grabBag.push.apply(grabBag, randomGenerator());

  lines = 0;
  piecesSet = 0;

  statsPiece.innerHTML = piecesSet;
  statsLines.innerHTML = lineLimit - lines;
  statistics();
  clear(stackCtx);
  clear(activeCtx);
  clear(holdCtx);
  drawPreview();

  menu();

  if (gameState === 3) {
    gameState = 2;
    gameLoop();
  } else {
    gameState = 2;
  }
}

function range(start, end, inc) {
  inc = inc || 1;
  var array = [];
  for (var i = start; i < end; i += inc) {
    array.push(i);
  }
  return array;
}

/**
 * Add divisor method so we can do clock arithmetics. This is later used to
 *  determine tetromino orientation.
 */
Number.prototype.mod = function(n) {
  return ((this % n) + n) % n;
};

/**
 * Shim.
 */
window.requestAnimFrame = (function () {
  return window.requestAnimationFrame       ||
         window.mozRequestAnimationFrame    ||
         window.webkitRequestAnimationFrame ||
         function (callback) {
           window.setTimeout(callback, 1000 / 60);
         };
})();

/**
 * Creates a matrix for the playfield.
 */
function newGrid(x, y) {
  var cells = new Array(x);
  for (var i = 0; i < x; i++) {
    cells[i] = new Array(y);
  }
  return cells;
}

function unpause() {
  paused = !paused;
  pauseTime += (Date.now() - startPauseTime);
  msg.innerHTML = '';
  menu();
}

function pause() {
  if (gameState != 3) {
  paused = !paused;
  startPauseTime = Date.now();
  msg.innerHTML = "Paused";
  menu(4);    
  }
}

/**
 * Creates a "grab bag" of the 7 tetrominos. The first
 *  drop of the first generation can not be an S, O, or Z piece.
 */
function randomGenerator() {
  var pieceList = [0, 1, 2, 3, 4, 5, 6];
  return pieceList.sort(function() {return 0.5 - rng.next()});
}

/**
 * Park Miller "Minimal Standard" PRNG.
 */
//TODO put random seed method in here.
var rng = new (function() {
  this.seed = 1;
  this.next = function() {
    return (this.gen() / 2147483647);
  }
  this.gen = function() {
    return this.seed = (this.seed * 16807) % 2147483647;
  }
})();

/**
 * Draws the stats next to the tetrion.
 */
function statistics() {
  var time = Date.now() - startTime - pauseTime;
  var seconds = (time / 1000 % 60).toFixed(2);
  var minutes = ~~(time / 60000);
  statsTime.innerHTML = (minutes < 10 ? '0' : '') + minutes +
                        (seconds < 10 ? ':0' : ':') + seconds;
}

/**
 * Checks if position and orientation passed is valid.
 *  We call it for every action instead of only once a frame in case one
 *  of the actions is still valid, we don't want to block it.
 */
function moveValid(cx, cy, tetro) {
  cx = cx + fallingPiece.x;
  cy = Math.floor(cy + fallingPiece.y);

  for (var x = 0; x < tetro.length; x++) {
    for (var y = 0; y < tetro[x].length; y++) {
      if (tetro[x][y] &&
      ((cx + x < 0 || cx + x >= 10 || cy + y >= 22) ||
      stack[cx + x][cy + y])) {
        return false;
      }
    }
  }
  fallingPiece.lockDelay = 0;
  return true;
}

/**
 * Adds tetro to the stack, and clears lines if they fill up.
 */
function addPiece(tetro) {

  // Add the piece to the stack, and check which lines are modified.
  var range = [];
  var valid = false;
  for (var x = 0; x < tetro.length; x++) {
    for (var y = 0; y < tetro[x].length; y++) {
      if (tetro[x][y]) {
        stack[x + fallingPiece.x][y + fallingPiece.y] = tetro[x][y];
        if (range.indexOf(y + fallingPiece.y) === -1) {
          range.push(y + fallingPiece.y);
          // This checks if any cell is in the play field. If there
          //  isn't any this is called a lock out and the game ends.
          if (y + fallingPiece.y > 1) valid = true;
        }
      }
    }
  }

  // Lock out
  if (!valid) {
    gameState = 9;
    msg.innerHTML = 'LOCK OUT!';
    menu(3);
    return;
  }

  // Check modified lines for full lines.
  range = range.sort(function(a,b){return a-b});
  for (var row = range[0], len = row + range.length; row < len; row++) {
    var count = 0;
    for (var x = 0; x < 10; x++) { // 10 is the stack width
      if (stack[x][row]) count++;
    }
    // Clear the line. This basically just moves down the stack.
    // TODO Ponder during the day and see if there is a more elegant solution.
    if (count === 10) {
      lines++; // NOTE stats
      for (var y = row; y >= -1; y--) {
        for (var x = 0; x < 10; x++) {
          stack[x][y] = stack[x][y - 1];
        }
      }
    }
  }

  piecesSet++; // NOTE Stats

  statsPiece.innerHTML = piecesSet;
  statsLines.innerHTML = lineLimit - lines;

  // Redraw the stack.
  drawStack();
}

var fallingPiece = new (function() {
  this.x;
  this.y;
  this.pos = 0;
  this.tetro;
  this.index;
  this.kickData;
  this.lockDelay = 0;
  this.shiftDelay = 0;
  this.arrDelay = 0;
  this.active = false;
  this.held = false;

  this.reset = function() {
    this.pos = 0;
    this.tetro = [];
    this.active = false;
    this.held = false;
    landed = false;
  }
  this.newPiece = function() {
    if (!this.active) {

      // TODO Do this better.
      //for property in pieces, this.prop = piece.prop
      this.tetro = pieces[grabBag[inc]].tetro;
      this.kickData = pieces[grabBag[inc]].kickData;
      this.x = pieces[grabBag[inc]].x;
      this.y = pieces[grabBag[inc]].y;
      this.index = pieces[grabBag[inc]].index;

      this.active = true;
      newPiece = true;

      // Determine if we need another grab bag.
      //TODO Do this better. (make grabbag object)
      if (inc < 6) {
        inc++;
      } else {
        grabBag = grabBag.slice(-7);
        grabBag.push.apply(grabBag, randomGenerator());
        inc = 0;
      }
      drawPreview();

      // Check for blockout.
      if (!moveValid(0, 0, this.tetro)) {
        gameState = 9;
        msg.innerHTML = 'BLOCK OUT!';
        menu(3);
      }
    }
  }
  this.rotate = function(direction) {

    // Rotates the tetromino's matrix.
    var rotated = [];
    if (direction === -1) {
      for (var i = this.tetro.length - 1; i >= 0; i--) {
        rotated[i] = [];
        for (var row = 0; row < this.tetro.length; row++) {
          rotated[i][this.tetro.length - 1 - row] = this.tetro[row][i];
        }
      }
    } else {
      for (var i = 0; i < this.tetro.length; i++) {
        rotated[i] = [];
        for (var row = this.tetro.length - 1; row >= 0; row--) {
          rotated[i][row] = this.tetro[row][this.tetro.length - 1 - i];
        }
      }
    }

    // Goes thorugh kick data until it finds a valid move.
    var curPos = this.pos.mod(4);
    var newPos = (this.pos + direction).mod(4);

    for (var x = 0, len = this.kickData[0].length; x < len; x++) {
      if (moveValid(
      this.kickData[curPos][x][0] - this.kickData[newPos][x][0],
      this.kickData[curPos][x][1] - this.kickData[newPos][x][1],
      rotated
      )) {
        this.x += this.kickData[curPos][x][0] -
                  this.kickData[newPos][x][0];
        this.y += this.kickData[curPos][x][1] -
                  this.kickData[newPos][x][1];
        this.tetro = rotated;
        this.pos = newPos;
        break;
      }
    }
  }
  this.checkShift = function() {
    if (keysDown & flags.moveLeft && !(lastKeys & flags.moveLeft)) {
      this.shiftDelay = 0;
      this.arrDelay = 0;
      shiftReleased = true;
      shift = -1;
    } else if (keysDown & flags.moveRight && !(lastKeys & flags.moveRight)) {
      this.shiftDelay = 0;
      this.arrDelay = 0;
      shiftReleased = true;
      shift = 1;
    }
    //shift released
    if (shift === 1 &&
    !(keysDown & flags.moveRight) && lastKeys & flags.moveRight && keysDown & flags.moveLeft) {
      this.shiftDelay = 0;
      this.arrDelay = 0;
      shiftReleased = true;
      shift = -1;
    } else if (shift === -1 &&
    !(keysDown & flags.moveLeft) && lastKeys & flags.moveLeft && keysDown & flags.moveRight) {
      this.shiftDelay = 0;
      this.arrDelay = 0;
      shiftReleased = true;
      shift = 1;
    } else if (
    !(keysDown & flags.moveRight) && lastKeys & flags.moveRight && keysDown & flags.moveLeft) {
      shift = -1;
    } else if (
    !(keysDown & flags.moveLeft) && lastKeys & flags.moveLeft && keysDown & flags.moveRight) {
      shift = 1;
    } else if ((!(keysDown & flags.moveLeft) && lastKeys & flags.moveLeft) ||
               (!(keysDown & flags.moveRight) && lastKeys & flags.moveRight)) {
      this.shiftDelay = 0;
      this.arrDelay = 0;
      shiftReleased = true;
      shift = 0;
    }
    if (shift) {
      // 1. When key pressed instantly move over once.
      if (shiftReleased) {
        this.shift(shift);
        this.shiftDelay++;
        shiftReleased = false;
      // 2. Apply DAS delay
      } else if (this.shiftDelay < settings.DAS) {
        this.shiftDelay++;
      // 3. Once the delay is complete, move over once.
      //     Inc delay so this doesn't run again.
      } else if (this.shiftDelay === settings.DAS && settings.DAS !== 0) {
        this.shift(shift);
        if (settings.ARR !== 0) this.shiftDelay++;
      // 4. Apply ARR delay
      } else if (this.arrDelay < settings.ARR) {
        this.arrDelay++;
      // 5. If ARR Delay is full, move piece, and reset delay and repeat.
      } else if (this.arrDelay === settings.ARR && settings.ARR !== 0) {
        this.shift(shift);
      }
    }
  }
  this.shift = function(direction) {
    this.arrDelay = 0;
    if (settings.ARR === 0 && this.shiftDelay === settings.DAS) {
      for (var i = 1; i < 10; i++) {
        if (!moveValid(i * direction, 0, this.tetro)) {
          this.x += i * direction - direction;
          break;
        }
      }
    } else if (moveValid(direction, 0, this.tetro)) {
      this.x += direction;
    }
  }
  this.shiftDown = function() {
    if (moveValid(0, 1, this.tetro)) {
      var grav = gravityArr[settings['Soft Drop'] + 1];
      if (grav > 1)
        this.y += this.getDrop(grav);
      else
        this.y += grav;
    }
  }
  this.hardDrop = function() {
    this.y += this.getDrop(20);
    this.lockDelay = settings['Lock Delay'];
  }
  this.getDrop = function(distance) {
    for (var i = 1; i <= distance; i++) {
      if (!moveValid(0, i, this.tetro))
        return i - 1;
    }
    return i - 1;
  }
  this.hold = function() {
    if (!this.held) {
      if (holdPiece !== void 0) {
        var temp = holdPiece;
        this.x = pieces[holdPiece].x;
        this.y = pieces[holdPiece].y;
        this.pos = 0;
        this.tetro = pieces[holdPiece].tetro;
        this.kickData = pieces[holdPiece].kickData;
        holdPiece = this.index;
        this.index = temp;
        newPiece = true;
      } else {
        holdPiece = this.index;
        this.reset();
      }
      this.held = true;
      //Draw Hold
      clear(holdCtx);
      if (holdPiece === 0 || holdPiece === 3) {
        draw(pieces[holdPiece].tetro, pieces[holdPiece].x - 3,
             2 + pieces[holdPiece].y, holdCtx);
      } else {
        draw(pieces[holdPiece].tetro, pieces[holdPiece].x - 2.5,
             2 + pieces[holdPiece].y, holdCtx);
      }
    }
  }
  this.update = function() {
    if (moveValid(0, 1, this.tetro)) {
      landed = false;
      if (settings.Gravity) {
        var grav = gravityArr[settings.Gravity - 1];
        if (grav > 1)
          this.y += this.getDrop(grav);
        else
          this.y += grav;
      } else {
        this.y += gravity;
      }
    } else {
      landed = true;
      this.y = Math.floor(this.y);
      if (this.lockDelay >= settings['Lock Delay']) {
        addPiece(this.tetro);
        this.reset();
      } else {
        var a = 1 / setting['Lock Delay'][settings['Lock Delay']];
        activeCtx.globalCompositeOperation = 'source-atop';
        activeCtx.fillStyle = 'rgba(0,0,0,' + a + ')';
        activeCtx.fillRect(0, 0, activeCanvas.width, activeCanvas.height);
        activeCtx.globalCompositeOperation = 'source-over';
        this.lockDelay++;
      }
    }
  }
})();

// ========================== View ============================================

function bg(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = '#1c1c1c';
  for (var x = -1; x < ctx.canvas.width + 1; x += cellSize) {
    ctx.fillRect(x, 0, 2, ctx.canvas.height);
  }
  for (var y = -1; y < ctx.canvas.height + 1; y += cellSize) {
    ctx.fillRect(0, y, ctx.canvas.width, 2);
  }
}

/**
 * Draws a pre-rendered mino.
 */
function drawCell(x, y, color, ctx) {
  x = x * cellSize;
  x = ~~x;
  y = ~~y * cellSize - 2 * cellSize;
  ctx.drawImage(spriteCanvas, color * cellSize, 0, cellSize, cellSize, x, y, cellSize, cellSize);
}

/**
 * Pre-renders all mino colors.
 */
function makeSprite() {
  var shaded = [
    // 0         +10        -10        -20
    ['#c1c1c1', '#dddddd', '#a6a6a6', '#8b8b8b'],
    ['#25bb9b', '#4cd7b6', '#009f81', '#008568'],
    ['#3397d9', '#57b1f6', '#007dbd', '#0064a2'],
    ['#e67e23', '#ff993f', '#c86400', '#a94b00'],
    ['#efc30f', '#ffdf3a', '#d1a800', '#b38e00'],
    ['#9ccd38', '#b9e955', '#81b214', '#659700'],
    ['#9c5ab8', '#b873d4', '#81409d', '#672782'],
    ['#e64b3c', '#ff6853', '#c62c25', '#a70010'],
    ['#898989', '#a3a3a3', '#6f6f6f', '#575757']
  ];
  var glossy = [
    //25         37         52         -21        -45
    ['#ffffff', '#ffffff', '#ffffff', '#888888', '#4d4d4d'],
    ['#7bffdf', '#9fffff', '#ccffff', '#008165', '#00442e'],
    ['#6cdcff', '#93feff', '#c2ffff', '#00629f', '#002c60'],
    ['#ffc166', '#ffe386', '#ffffb0', '#aa4800', '#650500'],
    ['#ffff6a', '#ffff8c', '#ffffb8', '#b68a00', '#714f00'],
    ['#efff81', '#ffffa2', '#ffffcd', '#6b9200', '#2c5600'],
    ['#dc9dfe', '#ffbeff', '#ffe9ff', '#5d287e', '#210043'],
    ['#ff9277', '#ffb497', '#ffe0bf', '#a7000a', '#600000'],
    ['#cbcbcb', '#ededed', '#ffffff', '#545454', '#1f1f1f']
  ];
  var tgm = [
    ['#7b7b7b', '#303030', '#6b6b6b', '#363636'],
    ['#f08000', '#a00000', '#e86008', '#b00000'],
    ['#00a8f8', '#0000b0', '#0090e8', '#0020c0'],
    ['#f8a800', '#b84000', '#e89800', '#c85800'],
    ['#e8e000', '#886800', '#d8c800', '#907800'],
    ['#f828f8', '#780078', '#e020e0', '#880088'],
    ['#00e8f0', '#0070a0', '#00d0e0', '#0080a8'],
    ['#78f800', '#007800', '#58e000', '#008800'],
    ['#7b7b7b', '#303030', '#6b6b6b', '#363636'],
  ];
  var world = [];
  world[0] = tgm[0];
  world[1] = tgm[6];
  world[2] = tgm[2];
  world[3] = tgm[3];
  world[4] = tgm[4];
  world[5] = tgm[7];
  world[6] = tgm[5];
  world[7] = tgm[1];
  world[8] = tgm[8];

  spriteCanvas.width = cellSize * 9;
  spriteCanvas.height = cellSize;
  for (var i = 0; i < 9; i++) {
    var x = i * cellSize;
    if (settings.Block === 0) {
      // Shaded
      spriteCtx.fillStyle = shaded[i][1];
      spriteCtx.fillRect(x, 0, cellSize, cellSize);

      spriteCtx.fillStyle = shaded[i][3];
      spriteCtx.fillRect(x, cellSize / 2, cellSize, cellSize / 2);

      spriteCtx.fillStyle = shaded[i][0];
      spriteCtx.beginPath();
      spriteCtx.moveTo(x, 0);
      spriteCtx.lineTo(x + cellSize / 2, cellSize / 2);
      spriteCtx.lineTo(x, cellSize);
      spriteCtx.fill();

      spriteCtx.fillStyle = shaded[i][2];
      spriteCtx.beginPath();
      spriteCtx.moveTo(x + cellSize, 0);
      spriteCtx.lineTo(x + cellSize / 2, cellSize / 2);
      spriteCtx.lineTo(x + cellSize, cellSize);
      spriteCtx.fill();
    } else if (settings.Block === 1) {
      // Flat
      spriteCtx.fillStyle = shaded[i][0];
      spriteCtx.fillRect(x, 0, cellSize, cellSize);
    } else if (settings.Block === 2) {
      // Glossy
      var k = Math.max(~~(cellSize * 0.083), 1);

      var grad = spriteCtx.createLinearGradient(x, 0, x + cellSize, cellSize);
      grad.addColorStop(0.5, glossy[i][3]);
      grad.addColorStop(1, glossy[i][4]);
      spriteCtx.fillStyle = grad;
      spriteCtx.fillRect(x, 0, cellSize, cellSize);

      var grad = spriteCtx.createLinearGradient(x, 0, x + cellSize, cellSize);
      grad.addColorStop(0, glossy[i][2]);
      grad.addColorStop(0.5, glossy[i][1]);
      spriteCtx.fillStyle = grad;
      spriteCtx.fillRect(x, 0, cellSize - k, cellSize - k);

      var grad = spriteCtx.createLinearGradient(x + k, k, x + cellSize - k, cellSize - k);
      grad.addColorStop(0, shaded[i][0]);
      grad.addColorStop(0.5, glossy[i][0]);
      grad.addColorStop(0.5, shaded[i][0]);
      grad.addColorStop(1, glossy[i][0]);
      spriteCtx.fillStyle = grad;
      spriteCtx.fillRect(x + k, k, cellSize - k * 2, cellSize - k * 2);

    } else if (settings.Block === 3 || settings.Block === 4) {
      // Arika
      if (settings.Block === 4) tgm = world;
      var k = Math.max(~~(cellSize * 0.125), 1);

      spriteCtx.fillStyle = tgm[i][1];
      spriteCtx.fillRect(x, 0, cellSize, cellSize);
      spriteCtx.fillStyle = tgm[i][0];
      spriteCtx.fillRect(x, 0, cellSize, ~~(cellSize / 2));

      var grad = spriteCtx.createLinearGradient(x, k, x, cellSize - k);
      grad.addColorStop(0, tgm[i][2]);
      grad.addColorStop(1, tgm[i][3]);
      spriteCtx.fillStyle = grad;
      spriteCtx.fillRect(x + k, k, cellSize - k*2, cellSize - k*2);

      var grad = spriteCtx.createLinearGradient(x, k, x, cellSize);
      grad.addColorStop(0, tgm[i][0]);
      grad.addColorStop(1, tgm[i][3]);
      spriteCtx.fillStyle = grad;
      spriteCtx.fillRect(x, k, k, cellSize - k);

      var grad = spriteCtx.createLinearGradient(x, 0, x, cellSize - k);
      grad.addColorStop(0, tgm[i][2]);
      grad.addColorStop(1, tgm[i][1]);
      spriteCtx.fillStyle = grad;
      spriteCtx.fillRect(x + cellSize - k, 0, k, cellSize - k);
    }
  }
}

/**
 * Clear canvas.
 */
function clear(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

/**
 * Takes an array of minos and tells drawCell where to draw it.
 */
function draw(tetro, cx, cy, ctx, color) {
  for (var x = 0, len = tetro.length; x < len; x++) {
    for (var y = 0, wid = tetro[x].length; y < wid; y++) {
      if (tetro[x][y]) drawCell(x + cx, y + cy, color !== void 0 ? color : tetro[x][y], ctx);
    }
  }
}

/**
 * Draws the grabbag for the piece preview.
 */
function drawPreview() {
  clear(previewCtx);
  for (var i = 0; i < 6; i++) {
    if (grabBag[inc + i] === 0 || grabBag[inc + i] === 3) {
      draw(pieces[grabBag[inc + i]].tetro, pieces[grabBag[inc + i]].x - 3,
           pieces[grabBag[inc + i]].y + 2 + i * 3, previewCtx);
    } else {
      draw(pieces[grabBag[inc + i]].tetro, pieces[grabBag[inc + i]].x - 2.5,
           pieces[grabBag[inc + i]].y + 2 + i * 3, previewCtx);
    }
  }
}

/**
 * Draws the stack.
 */
function drawStack() {
  clear(stackCtx);
  draw(stack, 0, 0, stackCtx);

  // TODO wrap this with an option.
  stackCtx.globalCompositeOperation = 'source-atop';
  stackCtx.fillStyle = 'rgba(0,0,0,0.3)';
  stackCtx.fillRect(0, 0, stackCanvas.width, stackCanvas.height);
  stackCtx.globalCompositeOperation = 'source-over';

  if (settings.Outline) {
    var b = ~~(cellSize / 8);
    var c = cellSize;
    var lineCanvas = document.createElement('canvas');
    lineCanvas.width = stackCanvas.width;
    lineCanvas.height = stackCanvas.height;
    var lineCtx = lineCanvas.getContext('2d');
    lineCtx.fillStyle = 'rgba(255,255,255,0.5)';
    lineCtx.beginPath();
    for (var x = 0, len = stack.length; x < len; x++) {
      for (var y = 0, wid = stack[x].length; y < wid; y++) {
        if (stack[x][y]) {
          if (x < 9 && !stack[x + 1][y]) {
            lineCtx.fillRect(x * c + c - b, y * c - (2 * c), b, c);
          }
          if (x > 0 && !stack[x - 1][y]) {
            lineCtx.fillRect(x * c, y * c - (2 * c), b, c);
          }
          if (y < 21 && !stack[x][y + 1]) {
            lineCtx.fillRect(x * c, y * c - (2 * c) + c - b, c, b);
          }
          if (!stack[x][y - 1]) {
            lineCtx.fillRect(x * c, y * c - (2 * c), c, b);
          }
          // Diags
          if (x < 9 && y < 21) {
            if (!stack[x + 1][y] && !stack[x][y + 1]) {
              lineCtx.clearRect(x * c + c - b, y * c - (2 * c) + c - b, b, b);
              lineCtx.fillRect(x * c + c - b, y * c - (2 * c) + c - b, b, b);
            } else if (!stack[x + 1][y + 1] && stack[x + 1][y] && stack[x][y + 1]) {
              lineCtx.moveTo(x * c + c, y * c - (2 * c) + c - b);
              lineCtx.lineTo(x * c + c, y * c - (2 * c) + c);
              lineCtx.lineTo(x * c + c - b, y * c - (2 * c) + c);
              lineCtx.arc(x * c + c, y * c - (2 * c) + c, b, 3 * Math.PI / 2, Math.PI, true);
            }
          }
          if (x < 9) {
            if (!stack[x + 1][y] && !stack[x][y - 1]) {
              lineCtx.clearRect(x * c + c - b, y * c - (2 * c), b, b);
              lineCtx.fillRect(x * c + c - b, y * c - (2 * c), b, b);
            } else if (!stack[x + 1][y - 1] && stack[x + 1][y] && stack[x][y - 1]) {
              lineCtx.moveTo(x * c + c - b, y * c - (2 * c));
              lineCtx.lineTo(x * c + c, y * c - (2 * c));
              lineCtx.lineTo(x * c + c, y * c - (2 * c) + b);
              lineCtx.arc(x * c + c, y * c - (2 * c), b, Math.PI / 2, Math.PI, false);
            }
          }
          if (x > 0 && y < 21) {
            if (!stack[x - 1][y] && !stack[x][y + 1]) {
              lineCtx.clearRect(x * c, y * c - (2 * c) + c - b, b, b);
              lineCtx.fillRect(x * c, y * c - (2 * c) + c - b, b, b);
            } else if (!stack[x - 1][y + 1] && stack[x - 1][y] && stack[x][y + 1]) {
              lineCtx.moveTo(x * c, y * c - (2 * c) + c - b);
              lineCtx.lineTo(x * c, y * c - (2 * c) + c);
              lineCtx.lineTo(x * c + b, y * c - (2 * c) + c);
              lineCtx.arc(x * c, y * c - (2 * c) + c, b, Math.PI * 2, 3 * Math.PI / 2, true);
            }
          }
          if (x > 0) {
            if (!stack[x - 1][y] && !stack[x][y - 1]) {
              lineCtx.clearRect(x * c, y * c - (2 * c), b, b);
              lineCtx.fillRect(x * c, y * c - (2 * c), b, b);
            } else if (!stack[x - 1][y - 1] && stack[x - 1][y] && stack[x][y - 1]) {
              lineCtx.moveTo(x * c + b, y * c - (2 * c));
              lineCtx.lineTo(x * c, y * c - (2 * c));
              lineCtx.lineTo(x * c, y * c - (2 * c) + b);
              lineCtx.arc(x * c, y * c - (2 * c), b, Math.PI / 2, Math.PI * 2, true);
            }
          }
        }
      }
    }
    lineCtx.fill();
    stackCtx.drawImage(lineCanvas, 0, 0);
  }
}

// ========================== Controller ======================================

//document.onkeydown = function(e) {
addEventListener('keydown', function(e) {
  if ([32,37,38,39,40].indexOf(e.keyCode) !== -1)
    e.preventDefault();
  //if (bindsArr.indexOf(e.keyCode) !== -1)
  //  e.preventDefault();
  if (e.keyCode === binds.pause) {
    if (paused) {
      unpause();
    } else {
      pause();
    }
  }
  if (e.keyCode === binds.retry) {
    init(gametype);
  }
  if (!watchingReplay) {
    if (e.keyCode === binds.moveLeft) {
      keysDown |= flags.moveLeft;
    } else if (e.keyCode === binds.moveRight) {
      keysDown |= flags.moveRight;
    } else if (e.keyCode === binds.moveDown) {
      keysDown |= flags.moveDown;
    } else if (e.keyCode === binds.hardDrop) {
      keysDown |= flags.hardDrop;
    } else if (e.keyCode === binds.rotRight) {
      keysDown |= flags.rotRight;
    } else if (e.keyCode === binds.rotLeft) {
      keysDown |= flags.rotLeft;
    } else if (e.keyCode === binds.rot180) {
      keysDown |= flags.rot180;
    } else if (e.keyCode === binds.holdPiece) {
      keysDown |= flags.holdPiece;
    }
  }
}, false);
addEventListener('keyup', function(e) {
  if (!watchingReplay) {
    if (e.keyCode === binds.moveLeft && keysDown & flags.moveLeft) {
      keysDown ^= flags.moveLeft;
    } else if (e.keyCode === binds.moveRight && keysDown & flags.moveRight) {
      keysDown ^= flags.moveRight;
    } else if (e.keyCode === binds.moveDown && keysDown & flags.moveDown) {
      keysDown ^= flags.moveDown;
    } else if (e.keyCode === binds.hardDrop && keysDown & flags.hardDrop) {
      keysDown ^= flags.hardDrop;
    } else if (e.keyCode === binds.rotRight && keysDown & flags.rotRight) {
      keysDown ^= flags.rotRight;
    } else if (e.keyCode === binds.rotLeft && keysDown & flags.rotLeft) {
      keysDown ^= flags.rotLeft;
    } else if (e.keyCode === binds.rot180 && keysDown & flags.rot180) {
      keysDown ^= flags.rot180;
    } else if (e.keyCode === binds.holdPiece && keysDown & flags.holdPiece) {
      keysDown ^= flags.holdPiece;
    }
  }
}, false);


// ========================== Loop ============================================

/**
 * Runs every frame.
 */
function update() {
  if (lastKeys !== keysDown && !watchingReplay) {
    replayKeys[frame] = keysDown;
  } else if (frame in replayKeys) {
    keysDown = replayKeys[frame];
  }

  if (!(lastKeys & flags.holdPiece) && flags.holdPiece & keysDown) {
    fallingPiece.hold();
  }

  fallingPiece.newPiece();

  if (flags.rotLeft & keysDown && !(lastKeys & flags.rotLeft)) {
    fallingPiece.rotate(-1);
  } else if (flags.rotRight & keysDown && !(lastKeys & flags.rotRight)) {
    fallingPiece.rotate(1);
  } else if (flags.rot180 & keysDown && !(lastKeys & flags.rot180)) {
    fallingPiece.rotate(1);
    fallingPiece.rotate(1);
  }

  fallingPiece.checkShift();

  if (flags.moveDown & keysDown) {
    fallingPiece.shiftDown();
  }
  if (!(lastKeys & flags.hardDrop) && flags.hardDrop & keysDown) {
    fallingPiece.hardDrop();
  }

  fallingPiece.update();

  // Win
  if (lines >= lineLimit) {
    gameState = 1;
    msg.innerHTML = 'GREAT!';
    menu(3);
  }

  statistics();

  if (lastKeys !== keysDown) {
    lastKeys = keysDown;
  }
}


function gameLoop() {
  requestAnimFrame(gameLoop);

  frame++;

  // Countdown
  if (gameState === 0) {
    
    if (!paused) {
      update();
    }

    if ((fallingPiece.x !== lastX ||
    Math.floor(fallingPiece.y) !== lastY ||
    fallingPiece.pos !== lastPos ||
    newPiece) &&
    fallingPiece.active) {
      clear(activeCtx);
      // TODO make prettier.
      if (!settings.Ghost && !landed) {
        draw(fallingPiece.tetro, fallingPiece.x,
             fallingPiece.y + fallingPiece.getDrop(22), activeCtx, 0);
      } else if (settings.Ghost === 1 && !landed) {
        activeCtx.globalAlpha = 0.3;
        draw(fallingPiece.tetro, fallingPiece.x,
             fallingPiece.y + fallingPiece.getDrop(22), activeCtx);
        activeCtx.globalAlpha = 1;
      }
      draw(fallingPiece.tetro, fallingPiece.x, fallingPiece.y, activeCtx);
    }
    lastX = fallingPiece.x;
    lastY = Math.floor(fallingPiece.y);
    lastPos = fallingPiece.pos;
    newPiece = false;
  } else if (gameState === 2) {
    // Count Down
    if (frame < 50) {
      if (msg.innerHTML !== 'READY') msg.innerHTML = 'READY';
    } else if (frame < 100) {
      if (msg.innerHTML !== 'GO!') msg.innerHTML = 'GO!';
    } else {
      msg.innerHTML = '';
      gameState = 0;
      startTime = Date.now();
    }
    // DAS Preload TODO
    if (lastKeys !== keysDown && !watchingReplay) {
      replayKeys[frame] = keysDown;
    } else if (frame in replayKeys) {
      keysDown = replayKeys[frame];
    }
    if (keysDown & flags.moveLeft) {
      lastKeys = keysDown;
      fallingPiece.shiftDelay = settings.DAS;
      shiftReleased = false;
      shift = -1;
    } else if (keysDown & flags.moveRight) {
      lastKeys = keysDown;
      fallingPiece.shiftDelay = settings.DAS;
      shiftReleased = false;
      shift = 1;
    }
  } else if (toGreyRow >= 2){
    /**
     * Fade to grey animation played when player loses.
     */
    clear(activeCtx); // TODO Move this.
    if (frame % 2) {
      for (var x = 0; x < 10; x++) {
        if (stack[x][toGreyRow]) stack[x][toGreyRow] = gameState - 1;
      }
      drawStack();
      toGreyRow--;
    }
  }
}
