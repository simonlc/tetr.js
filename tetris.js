/*
Author: Simon Laroche
Site: http://simon.lc/

Note: Before looking at this code, it would be wise to do a bit of reading about
the game so you know why some things are done a certain way.
*/

var version = '0.1.6';

/**
 * Define playfield size.
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
var nav = document.getElementsByTagName('nav')[0];
var footer = document.getElementsByTagName('footer')[0];
var h3 = document.getElementsByTagName('h3');
var set = document.getElementById('settings');

// Get canvases and contexts
var bgCanvas = document.getElementById('bg');
var holdCanvas = document.getElementById('hold');
var bgStackCanvas = document.getElementById('bgStack');
var stackCanvas = document.getElementById('stack');
var activeCanvas = document.getElementById('active');
var previewCanvas = document.getElementById('preview');
var spriteCanvas = document.getElementById('sprite');

var bgCtx = bgCanvas.getContext('2d');
var holdCtx = holdCanvas.getContext('2d');
var bgStackCtx = bgStackCanvas.getContext('2d');
var stackCtx = stackCanvas.getContext('2d');
var activeCtx = activeCanvas.getContext('2d');
var previewCtx = previewCanvas.getContext('2d');
var spriteCtx = spriteCanvas.getContext('2d');

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
var kickDataO = [
  [[0, 0]],
  [[0, 1]],
  [[-1, 1]],
  [[-1, 0]]
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
  x: 3,
  y: 0,
  kickData: kickDataO,
  tetro: [
    [0, 0, 0],
    [4, 4, 0],
    [4, 4, 0]]
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

var holdPiece;
var firstRun;
var shift;

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
  Block: ['Shaded', 'Solid', 'Glossy', 'Arika'],
  Ghost: ['Normal', 'Colored', 'Off'],
  Grid: ['Off', 'On']
};

var inc;
var gLoop;
var setLoop;
var cDown;

/**
 * 0 = Normal
 * 1 = win
 * 9 = loss
 */
var gameState;

var paused = false;
var lineLimit;
var grabBag;

var toGreyRow;
var gametype;
//var toDraw;
var lastX, lastY, lastPos, landed, newPiece;

// Stats
var lines;
var piecesSet;
var startTime;

// Keys
var keysDown = {};
var arrowReleased = true;
var arrowDelay = 0;
var rotateReleased = true;
var hardDropReleased = true;
var shiftReleased = true;
var holdReleased = true;

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

var key = {
  8: 'Backspace',
  9: 'Tab',
  13: 'Enter',
  16: 'Shift',
  17: 'Ctrl',
  18: 'Alt',
  19: 'Pause',
  20: 'Caps Lock',
  27: 'Esc',
  32: 'Space',
  33: 'PgUp',
  34: 'PgDn',
  35: 'End',
  36: 'Home',
  37: '←',
  38: '↑',
  39: '→',
  40: '↓',
  45: 'Insert',
  46: 'Delete',
  48: '0',
  49: '1',
  50: '2',
  51: '3',
  52: '4',
  53: '5',
  54: '6',
  55: '7',
  56: '8',
  57: '9',
  59: ';',
  61: '=',
  65: 'A',
  66: 'B',
  67: 'C',
  68: 'D',
  69: 'E',
  70: 'F',
  71: 'G',
  72: 'H',
  73: 'I',
  74: 'J',
  75: 'K',
  76: 'L',
  77: 'M',
  78: 'N',
  79: 'O',
  80: 'P',
  81: 'Q',
  82: 'R',
  83: 'S',
  84: 'T',
  85: 'U',
  86: 'V',
  87: 'W',
  88: 'X',
  89: 'Y',
  90: 'Z',
  96: '0kpad',
  97: '1kpad',
  98: '2kpad',
  99: '3kpad',
  100: '4kpad',
  101: '5kpad',
  102: '6kpad',
  103: '7kpad',
  104: '8kpad',
  105: '9kpad',
  106: '*',
  107: '+',
  109: '-',
  110: '.',
  111: '/',
  112: 'F1',
  113: 'F2',
  114: 'F3',
  115: 'F4',
  116: 'F5',
  117: 'F6',
  118: 'F7',
  119: 'F8',
  120: 'F9',
  121: 'F10',
  122: 'F11',
  123: 'F12',
  173: '-',
  187: '=',
  188: ',',
  190: '.',
  191: '/',
  192: '`',
  219: '[',
  220: '\\',
  221: ']',
  222: "'"
}

function resize() {
  // TODO make function to append 'px' to a thing.
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

  if (settings.Size === 1 && screenHeight > 602)
    cellSize = 15;
  else if (settings.Size === 2 && screenHeight > 602)
    cellSize = 30;
  else if (settings.Size === 3 && screenHeight > 902)
    cellSize = 45;
  else
    cellSize = Math.max(~~(screenHeight / 20), 10);

  var pad = (window.innerHeight - (cellSize * 20 + 2)) / 2 + 'px';
  content.style.padding = pad + ' 0 ' + pad;
  stats.style.bottom = pad;

  //TODO Combine all margins into one;

  // TODO em size body font.
  a.style.padding = '0 0.5rem ' + ~~(cellSize / 2) + 'px';

  stackCanvas.width = cellSize * 10;
  stackCanvas.height = cellSize * 20;
  activeCanvas.width = stackCanvas.width;
  activeCanvas.height = stackCanvas.height;
  bgStackCanvas.width = stackCanvas.width;
  bgStackCanvas.height = stackCanvas.height;
  b.style.width = stackCanvas.width + 'px';
  b.style.height = stackCanvas.height + 'px';

  holdCanvas.width = cellSize * 4;
  holdCanvas.height = cellSize * 2;
  a.style.width = holdCanvas.width + 'px';
  a.style.height = holdCanvas.height + 'px';

  previewCanvas.width = cellSize * 4;
  previewCanvas.height = stackCanvas.height;
  c.style.width = previewCanvas.width + 'px';
  c.style.height = previewCanvas.height + 'px';

  // Scale the text so it fits in the thing.
  msg.style.lineHeight = stackCanvas.height + 'px';
  msg.style.fontSize = ~~(stackCanvas.width / 6) + 'px';
  stats.style.fontSize = ~~(stackCanvas.width / 11) + 'px';
  document.documentElement.style.fontSize = ~~(stackCanvas.width / 16) + 'px';

  stats.style.width = holdCanvas.width + 'px';
  for (var i = 0, len = h3.length; i < len; i++) {
    h3[i].style.lineHeight = cellSize * 2 + 'px';
    h3[i].style.fontSize = ~~(stackCanvas.width / 11) + 'px';
  }

  makeSprite();

  if (settings.Grid === 1)
    bg(bgStackCtx);

  if (gameState === 0) {
    draw(stack, 0, 0, stackCtx);
    drawPreview();
    if (holdPiece) {
      draw(pieces[holdPiece].tetro, pieces[holdPiece].x - 3,
           2 + pieces[holdPiece].y, holdCtx);
    }
  }
}
addEventListener('resize', resize, false);

/**
 * ========================== Model ===========================================
 */

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

// shim layer with setTimeout fallback
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
  paused = false;
  msg.innerHTML = '';
  menu();
}

/**
 * Resets all the settings and starts the game.
 */
function init(gt) {
  menu();
  toGreyRow = 21;
  lastPos = 'reset';
  clearTimeout(gLoop);
  fallingPiece.reset();
  inc = 0;
  stack = newGrid(10, 22);
  clear(stackCtx);
  clear(activeCtx);
  clear(holdCtx);
  holdPiece = void 0;
  gametype = gt;
  if (settings.Gravity === 0)
    gravity = gravityUnit * 4;
  startTime = new Date().getTime();

  //XXX fix ugly code lolwut
  firstRun = true;
  grabBag = randomGenerator();
  grabBag.push.apply(grabBag, randomGenerator());

  // Stats
  if (gametype === 0) {
    lineLimit = 40;
  } else {
    lineLimit = 150;
  }
  lines = 0;
  piecesSet = 0;

  drawPreview();

  clearTimeout(cDown);
  countDownLoop();
}

/**
 * Creates a "grab bag" of the 7 tetrominos. The first
 *  drop of the first generation can not be an S, O, or Z piece.
 */
function randomGenerator() {
  var pieceList = [0, 1, 2, 3, 4, 5, 6];
  // NOTE Probably a better way of doing this (without a while loop.)
    // look into filter method.
  pieceList.sort(function() {return 0.5 - Math.random()});
  //TODO Get rid of this check, and put it in init or something.
  //TODO Don't make functions within a loop.
  if (firstRun) {
    while (pieceList[0] === 3 || pieceList[0] === 4 || pieceList[0] === 6) {
      pieceList.sort(function() {return 0.5 - Math.random()});
    }
    firstRun = false;
  }
  return pieceList;
}

/**
 * Checks if position and orientation passed is valid.
 *  We call it for every action instead of only once in case one of the actions
 *  is still valid, we don't want to block it.
 */
function moveValid(cx, cy, tetro) {
  cx = cx + fallingPiece.x;
  cy = ~~(cy + fallingPiece.y);

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
          if (y + fallingPiece.y > 1) {
            valid = true;
          }
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
      if (stack[x][row]) {
        count++;
      }
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

  // Move the stack down.
  clear(stackCtx);
  draw(stack, 0, 0, stackCtx);
}

/**
 * Draws the stats next to the tetrion.
 */
function statistics() {
  var thisFrame = Date.now();
  var time = thisFrame - startTime;

  // Seconds and minutes for displaying clock.
  var seconds = (time / 1000 % 60).toFixed(2);
  var minutes = ~~(time / 60000);
  time = ((minutes < 10 ? '0' : '') + minutes).slice(-2) +
          (seconds < 10 ? ':0' : ':') + seconds;

  statsTime.innerHTML = time;
}

/**
 * Fade to grey animation played when player loses. Skip is used to slow down
 *  the animation.
 */
var skip = false;
function gameOverAnimation() {
  if (toGreyRow >= 2 && skip) {
    for (var x = 0; x < 10; x++) {
      if (stack[x][toGreyRow]) {
        stack[x][toGreyRow] = gameState - 1;
      }
    }
    clear(stackCtx);
    draw(stack, 0, 0, stackCtx);
    toGreyRow--;
    skip = false;
    return;
  } else {
    clearTimeout(gLoop);
  }
  skip = true;
}

/**
 * Main update function that runs every frame.
 */
function update() {
  if (!fallingPiece.active) {

    // TODO Do this better.
    //for property in pieces, fallingpiece.prop = piece.prop
    fallingPiece.tetro = pieces[grabBag[inc]].tetro;
    fallingPiece.kickData = pieces[grabBag[inc]].kickData;
    fallingPiece.x = pieces[grabBag[inc]].x;
    fallingPiece.y = pieces[grabBag[inc]].y;
    fallingPiece.index = pieces[grabBag[inc]].index;

    fallingPiece.active = true;
    newPiece = true;

    // Determine if we need another grab bag.
    if (inc < 6) {
      inc++;
    } else {
      grabBag = grabBag.slice(-7);
      grabBag.push.apply(grabBag, randomGenerator());
      inc = 0;
    }

    // Check for blockout.
    if (!moveValid(0, 0, fallingPiece.tetro)) {
      gameState = 9;
      msg.innerHTML = 'BLOCK OUT!';
      menu(3);
    } else {
      drawPreview();
    }
  }

  if (rotateReleased) {
    if (binds.rotLeft in keysDown) {
      fallingPiece.rotate(-1);
      rotateReleased = false;
    } else if (binds.rotRight in keysDown) {
      fallingPiece.rotate(1);
      rotateReleased = false;
    } else if (binds.rot180 in keysDown) {
      fallingPiece.rotate(1);
      fallingPiece.rotate(1);
      rotateReleased = false;
    }
  }

  // 1. When key pressed instantly move over once.
  if (shiftReleased) {
    fallingPiece.shift(shift);
  // 3. Once the delay is complete, move over once.
  //     Inc delay so this doesn't run again.
  } else if (fallingPiece.shiftDelay === settings.DAS && settings.DAS != 0) {
    fallingPiece.shift(shift);
    if (settings.ARR != 0)
      fallingPiece.shiftDelay++;
  // 5. If ARR Delay is full, move piece, and reset delay and repeat.
  } else if (fallingPiece.arrDelay === settings.ARR && settings.ARR != 0) {
    fallingPiece.shift(shift);
  // 2. Apply DAS delay
  } else if (fallingPiece.shiftDelay < settings.DAS) {
    fallingPiece.shiftDelay++;
  // 4. Apply DAS delay
  } else if (fallingPiece.arrDelay < settings.ARR) {
    fallingPiece.arrDelay++;
  }

  if (binds.moveDown in keysDown) {
    fallingPiece.shift('down');
  }
  if (holdReleased && binds.holdPiece in keysDown) {
    fallingPiece.hold();
    holdReleased = false;
  }
  if (hardDropReleased && binds.hardDrop in keysDown) {
    fallingPiece.hardDrop();
    hardDropReleased = false;
  }

  fallingPiece.update();

  // Win
  if (lines >= lineLimit) {
    gameState = 1;
    msg.innerHTML = 'GREAT!';
    menu(3);
  }

  statistics();
}

var FallingPiece = function() {
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
  this.rotate = function(direction) {

    // Rotates the tetromino's matrix.
    var rotated = [];
    switch (direction) {
    case -1:
      for (var i = this.tetro.length - 1; i >= 0; i--) {
        rotated[i] = [];
        for (var row = 0; row < this.tetro.length; row++) {
          rotated[i][this.tetro.length - 1 - row] = this.tetro[row][i];
        }
      }
      break;
    case 1:
      for (var i = 0; i < this.tetro.length; i++) {
        rotated[i] = [];
        for (var row = this.tetro.length - 1; row >= 0; row--) {
          rotated[i][row] = this.tetro[row][this.tetro.length - 1 - i];
        }
      }
      break;
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
  this.shift = function(direction) {
    fallingPiece.arrDelay = 0;
    shiftReleased = false;
    switch(direction) {
    case 'left':
      if (settings.ARR === 0 && this.shiftDelay === settings.DAS) {
        for (var i = 1; i < 10; i++) {
          if (moveValid(-i, 0, this.tetro)) {
            continue;
          } else {
            this.x += -i + 1;
            break;
          }
        }
      } else {
        if (moveValid(-1, 0, this.tetro))
          this.x -= 1;
      }
      break;
    case 'right':
      if (settings.ARR === 0 && this.shiftDelay === settings.DAS) {
        for (var i = 1; i < 10; i++) {
          if (moveValid(i, 0, this.tetro)) {
            continue;
          } else {
            this.x += i - 1;
            break;
          }
        }
      } else {
        if (moveValid(1, 0, this.tetro))
          this.x += 1;
      }
      break;
    case 'down':
      if (moveValid(0, 1, this.tetro)) {
        var grav = gravityArr[settings['Soft Drop'] + 1];
        if (grav > 1)
          this.y += this.getDrop(grav);
        else
          this.y += grav;
      }
      break;
    }
  }
  this.hardDrop = function() {
    this.y += this.getDrop(20);
    this.lockDelay = settings['Lock Delay'];
  }
  this.getDrop = function(distance) {
    for (var i = 1; i <= distance; i++) {
      if (!moveValid(0, i, this.tetro)) {
        return i - 1;
      }
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
      this.y = ~~this.y;
      if (this.lockDelay >= settings['Lock Delay']) {
        addPiece(this.tetro);
        this.reset();
      } else {
        this.lockDelay++;
      }
    }
  }
}
var fallingPiece = new FallingPiece();

// ========================== View ============================================

function bg(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  function bgGrid(color) {
    ctx.fillStyle = color;
    for (var x = -1; x < ctx.canvas.width + 1; x += cellSize) {
      ctx.fillRect(x, 0, 2, ctx.canvas.height);
    }
    for (var y = -1; y < ctx.canvas.height + 1; y += cellSize) {
      ctx.fillRect(0, y, ctx.canvas.width, 2);
    }
  }
  bgGrid('#1c1c1c');
}

function makeSprite() {
  var len = 9; // ammount of colors.
  spriteCanvas.width = cellSize * len;
  spriteCanvas.height = cellSize;
  for (var i = 0; i < len; i++) {
    drawMino(i, 0, i, spriteCtx);
  }
}

function drawCell(x, y, color, ctx) {
  x = x * cellSize;
  x = ~~x
  y = ~~y * cellSize - 2 * cellSize;
  ctx.drawImage(spriteCanvas, color * cellSize, 0, cellSize, cellSize, x, y, cellSize, cellSize);
}
/**
 * Draws a mino.
 */
function drawMino(x, y, color, ctx) {
  x = x * cellSize;
  x = ~~x
  y = ~~y;

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
    // TODO hex these.
    // 0         25         37         52         -21        -45
    ['#c1c1c1', 'rgb(263,263,263)', 'rgb(299,299,299)', 'rgb(344,344,344)', 'rgb(136,136,136)', 'rgb(77,77,77)'],
    ['#25bb9b', 'rgb(123,257,223)', 'rgb(159,293,258)', 'rgb(204,339,302)', 'rgb(-116,129,101)', 'rgb(-94,68,46)'],
    ['#3397d9', 'rgb(108,220,289)', 'rgb(147,254,325)', 'rgb(194,298,372)', 'rgb(-201,98,159)', 'rgb(-146,44,96)'],
    ['#e67e23', 'rgb(316,193,102)', 'rgb(356,227,134)', 'rgb(406,271,176)', 'rgb(170,72,-26)', 'rgb(101,5,-82)'],
    ['#efc30f', 'rgb(327,264,106)', 'rgb(366,299,140)', 'rgb(415,345,184)', 'rgb(182,138,-74)', 'rgb(113,79,-87)'],
    ['#9ccd38', 'rgb(239,275,129)', 'rgb(275,311,162)', 'rgb(321,357,205)', 'rgb(107,146,-27)', 'rgb(44,86,-61)'],
    ['#9c5ab8', 'rgb(220,157,254)', 'rgb(255,190,289)', 'rgb(300,233,334)', 'rgb(93,40,126)', 'rgb(33,-14,67)'],
    ['#e64b3c', 'rgb(315,146,119)', 'rgb(355,180,151)', 'rgb(405,224,191)', 'rgb(167,-11,10)', 'rgb(96,-56,-65)'],
    ['#898989', 'rgb(203,203,203)', 'rgb(237,237,237)', 'rgb(281,281,281)', 'rgb(84,84,84)', 'rgb(31,31,31)']
  ];
  var tgm = [
    ['#313131', '#737373', '#848484', '#5a5a5a', '#181818', '#212121'],
    ['#f70808', '#ffa500', '#ffbd00', '#ff4210', '#ce0000', '#de0000'],
    ['#0029f7', '#00b5ff', '#00d6ff', '#007bff', '#0000ce', '#0000de'],
    ['#ff6b00', '#ffbd00', '#ffd600', '#ff9400', '#de4200', '#e75200'],
    ['#b59400', '#ffff00', '#ffff00', '#e7d600', '#a56b00', '#ad8400'],
    ['#ad00ad', '#ff29ff', '#ff31ff', '#f710f7', '#8c008c', '#940094'],
    ['#00a5d6', '#00ffff', '#00ffff', '#00def7', '#007bce', '#008cce'],
    ['#00ad00', '#6bff00', '#94ff00', '#18e700', '#008400', '#009400'],
    ['#313131', '#737373', '#848484', '#5a5a5a', '#181818', '#212121']
  ];

  if (settings.Block === 0) {
    // Shaded
    ctx.fillStyle = shaded[color][1];
    ctx.fillRect(x, y, cellSize, cellSize);

    ctx.fillStyle = shaded[color][3];
    ctx.fillRect(x, y + cellSize / 2, cellSize, cellSize / 2);

    ctx.fillStyle = shaded[color][0];
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + cellSize / 2, y + cellSize / 2);
    ctx.lineTo(x, y + cellSize);
    ctx.fill();

    ctx.fillStyle = shaded[color][2];
    ctx.beginPath();
    ctx.moveTo(x + cellSize, y);
    ctx.lineTo(x + cellSize / 2, y + cellSize / 2);
    ctx.lineTo(x + cellSize, y + cellSize);
    ctx.fill();
  } else if (settings.Block === 1) {
    // Flat
    ctx.fillStyle = shaded[color][0];
    ctx.fillRect(x, y, cellSize, cellSize);
  } else if (settings.Block === 2) {
    // Glossy
    var k = Math.max(~~(cellSize * 0.083), 1);

    var grad = ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
    grad.addColorStop(0.5, glossy[color][4]);
    grad.addColorStop(1, glossy[color][5]);
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, cellSize, cellSize);

    var grad = ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
    grad.addColorStop(0, glossy[color][3]);
    grad.addColorStop(0.5, glossy[color][2]);
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, cellSize - k, cellSize - k);

    var grad = ctx.createLinearGradient(x + k, y + k, x + cellSize - k, y + cellSize - k);
    grad.addColorStop(0, glossy[color][0]);
    grad.addColorStop(0.5, glossy[color][1]);
    grad.addColorStop(0.5, glossy[color][0]);
    grad.addColorStop(1, glossy[color][1]);
    ctx.fillStyle = grad;
    ctx.fillRect(x + k, y + k, cellSize - k * 2, cellSize - k * 2);

  } else if (settings.Block === 3) {
    // Arika
    var k = Math.max(~~(cellSize * 0.125), 1);

    ctx.fillStyle = tgm[color][0];
    ctx.fillRect(x, y, cellSize, cellSize);

    var grad = ctx.createLinearGradient(x, y + k, x, y + cellSize - k * 2);
    grad.addColorStop(0, tgm[color][1]);
    grad.addColorStop(1, tgm[color][0]);
    ctx.fillStyle = grad;
    ctx.fillRect(x + k, y + k, cellSize - k * 2, cellSize - k * 2);

    var grad = ctx.createLinearGradient(x, y + k, x, y + cellSize - k * 2);
    grad.addColorStop(0, tgm[color][2]);
    grad.addColorStop(1, tgm[color][3]);
    ctx.fillStyle = grad;
    ctx.fillRect(x, y + k, k, cellSize - k * 2);

    ctx.fillStyle = tgm[color][4];
    ctx.fillRect(x + cellSize - k, y + k, k, cellSize - k * 2);

    ctx.fillStyle = tgm[color][1];
    ctx.fillRect(x, y, cellSize - k, k);

    ctx.fillStyle = tgm[color][2];
    ctx.fillRect(x, y, cellSize / 2, k);

    ctx.fillStyle = tgm[color][4];
    ctx.fillRect(x + k, y + cellSize - k, cellSize - k, k);

    ctx.fillStyle = tgm[color][5];
    ctx.fillRect(x + cellSize / 2, y + cellSize - k, cellSize / 2, k);
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
      if (tetro[x][y]) {
        if (color === void 0) {
          drawCell(x + cx, y + cy, tetro[x][y], ctx);
        } else {
          drawCell(x + cx, y + cy, color, ctx);
        }
      }
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

// ========================== Controller ======================================

//document.onkeydown = function(e) {
addEventListener('keydown', function(e) {
  if ([32,37,38,39,40].indexOf(e.keyCode) != -1) {
    e.preventDefault();
  }
  if (e.keyCode === binds.moveLeft && !keysDown[e.keyCode]) {
    // Reset key
    fallingPiece.shiftDelay = 0;
    fallingPiece.arrDelay = 0;
    shiftReleased = true;
    shift = 'left';
  }
  if (e.keyCode === binds.moveRight && !keysDown[e.keyCode]) {
    // Reset key
    fallingPiece.shiftDelay = 0;
    fallingPiece.arrDelay = 0;
    shiftReleased = true;
    shift = 'right';
  }
  //if (bindsArr.indexOf(e.keyCode) != -1) {
  //  e.preventDefault();
  //}
  if (e.keyCode === binds.pause) {
    // TODO Pause game function
    if (paused) {
      paused = false;
      msg.innerHTML = '';
      menu();
    } else {
      paused = true;
      msg.innerHTML = 'Paused';
      menu(4);
    }
  }
  if (e.keyCode === binds.retry) {
    init(gametype);
  }
  keysDown[e.keyCode] = true;
}, false);
addEventListener('keyup', function(e) {
  delete keysDown[e.keyCode];

  //if shift == right and moveright: shift released
  if (shift === 'right' && e.keyCode === binds.moveRight && keysDown[binds.moveLeft]) {
    fallingPiece.shiftDelay = 0;
    fallingPiece.arrDelay = 0;
    shiftReleased = true;
    shift = 'left';
  } else if (shift === 'left' && e.keyCode === binds.moveLeft && keysDown[binds.moveRight]) {
    fallingPiece.shiftDelay = 0;
    fallingPiece.arrDelay = 0;
    shiftReleased = true;
    shift = 'right';
  } else if (e.keyCode === binds.moveRight && keysDown[binds.moveLeft]) {
    shift = 'left';
  } else if (e.keyCode === binds.moveLeft && keysDown[binds.moveRight]) {
    shift = 'right';
  } else if (e.keyCode === binds.moveLeft || e.keyCode === binds.moveRight) {
    // Reset key
    fallingPiece.shiftDelay = 0;
    fallingPiece.arrDelay = 0;
    shiftReleased = true;
    shift = 0;
  }
  // Prevent repeating.
  if (e.keyCode === binds.rot180 || e.keyCode === binds.rotLeft || e.keyCode === binds.rotRight)
    rotateReleased = true;
  if (e.keyCode === binds.hardDrop)
    hardDropReleased = true;
  if (e.keyCode === binds.holdPiece)
    holdReleased = true;

}, false);


// ========================== Loop ============================================


function gameLoop() {
  // TODO upgrade to request animation frame.
  gLoop = setTimeout(gameLoop, 1000 / 60);
  //requestAnimFrame(gameLoop);

  if (!gameState) {
    update();

    if ((fallingPiece.x !== lastX ||
    ~~fallingPiece.y !== lastY ||
    fallingPiece.pos !== lastPos ||
    newPiece) &&
    fallingPiece.active) {
      clear(activeCtx);
      // TODO make prettier.
      if (!settings.Ghost && !landed) {
        draw(fallingPiece.tetro, fallingPiece.x,
             fallingPiece.y + fallingPiece.getDrop(22), activeCtx, 0);
      } else if (settings.Ghost === 1 && !landed) {
        draw(fallingPiece.tetro, fallingPiece.x,
             fallingPiece.y + fallingPiece.getDrop(22), activeCtx);
      }
      draw(fallingPiece.tetro, fallingPiece.x, fallingPiece.y, activeCtx);
    }
    lastX = fallingPiece.x;
    lastY = ~~fallingPiece.y;
    lastPos = fallingPiece.pos;
    newPiece = false;
  } else {
    gameOverAnimation();
  }
}

function countDownLoop() {
  var end = startTime + 1999;
  var thisFrame = Date.now();
  var time = end - thisFrame;
  if (time > 1000) {
    msg.innerHTML = 'READY';
  } else {
    msg.innerHTML = 'GO!';
  }
  if (time >= 0) {
    cDown = setTimeout(countDownLoop, 1000 / 10);
  } else {
    clearTimeout(cDown);
    msg.innerHTML = '';
    gameState = 0;
    gameLoop();
    startTime = new Date().getTime();
  }
}
