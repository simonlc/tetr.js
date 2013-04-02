/*
Author: Simon Laroche
Site: http://simon.lc/

Note: Before looking at this code, it would be wise to do a bit of reading about
the game so you know why some things are done a certain way.
*/

/**
 * Define playfield size.
 */
var cellSize;
var borderSize;
var stack;

/**
 * Get html elements. 
 */
var msg = document.getElementById('msg');
var stats = document.getElementById('stats');
var linesLeft = document.getElementById('lines');
var nav = document.getElementsByTagName('nav')[0];

// Get canvases and contexts (there's 8 of them each)
for (x = 0; x < document.getElementsByTagName('canvas').length; x++) {
  ID = document.getElementsByTagName('canvas')[x].id;
  eval('var ' + ID +
  'Canvas = document.getElementsByTagName("canvas")[x],' +
  ID + 'Ctx = ' + ID + 'Canvas.getContext("2d");');
}

/**
 * Piece data
 * [medium, light, dark]
 */
var cyan = ['#2aa198', '#4dbdb3', '#00877e']; //I
var blue = ['#268bd2', '#4da6ee', '#0072b6']; //J
var orange = ['#cb4b16', '#ea6630', '#ac3000']; //L
var yellow = ['#b58900', '#d2a32b', '#987000']; //O
var green = ['#859900', '#a0b42b', '#697f00']; //S
var purple = ['#6c71c4', '#878ae0', '#5158a9']; //T
var red = ['#dc322f', '#fc5246', '#bd001a']; //Z
var dark = ['#999', '#aaa', '#888'];
var grey = ['#ccc', '#ddd', '#bbb'];
var grey2 = ['#333', '#444', '#222'];
var colors = [grey, cyan, blue, orange, yellow, green, purple, red, dark, grey2];

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
var holdPiece;
var gravityUnit = 0.00390625;
var gravity;
var firstRun;

var shift;

var settings = {
  DAS: 12,
  ARR: 1,
  dark: false
};

var inc;
var gLoop;
var cDown;

/**
 * 0 = Normal
 * 1 = win
 * 9 = loss
 */
var gameState;
//var paused = false;
var lineLimit;
var gametype;
var gametypes = ['Sprint', 'Marathon'];
var grabBag;
var toGreyRow;

// Stats
var lines;
var piecesSet;
var startTime;
var score;
var level;

// Keys
var keysDown = {};
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
  hold: 67,
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

//var localScores = {
//    1: 'time' + 'piece' + 'ppm',
//}

function resize() {
  var a = document.getElementById('a');
  var b = document.getElementById('b');
  var c = document.getElementById('c');

  screenHeight = window.innerHeight - nav.offsetHeight - 1 - 32;
  borderSize = Math.max((screenHeight / 323), 1);
  cellSize = borderSize * 15;

  stackCanvas.width = borderSize + (cellSize + borderSize) * 10;
  stackCanvas.height = borderSize + (cellSize + borderSize) * 20;
  activeCanvas.width = stackCanvas.width;
  activeCanvas.height = stackCanvas.height;
  bgCanvas.width = stackCanvas.width;
  bgCanvas.height = stackCanvas.height;
  b.style.width = stackCanvas.width + 4 + 'px';
  b.style.height = stackCanvas.height + 4 + 'px';

  progressCanvas.height = stackCanvas.height;
  progressCanvas.width = borderSize * 3;

  holdCanvas.width = borderSize + (cellSize + borderSize) * 4;
  holdCanvas.height = borderSize + (cellSize + borderSize) * 3;
  bgHoldCanvas.width = holdCanvas.width;
  bgHoldCanvas.height = holdCanvas.height;
  a.style.width = holdCanvas.width + 4 + 'px';
  a.style.height = holdCanvas.height + 4 + 'px';

  previewCanvas.width = borderSize + (cellSize + borderSize) * 4;
  previewCanvas.height = borderSize + (cellSize + borderSize) * 9 * 2;
  bgPreviewCanvas.width = previewCanvas.width;
  bgPreviewCanvas.height = previewCanvas.height;
  c.style.width = previewCanvas.width + 4 + 'px';
  c.style.height = previewCanvas.height + 4 + 'px';

  // Scale the text so it fits in the thing.
  // TODO add min & max values (Math.min, and max).
  msg.style.lineHeight = stackCanvas.height + 'px';
  msg.style.fontSize = ~~(stackCanvas.width / 6) + 'px';
  linesLeft.style.fontSize = msg.style.fontSize;
  stats.style.fontSize = ~~(stackCanvas.width / 12) + 'px';

  bg(bgCtx);
  bg(bgHoldCtx);
  bg(bgPreviewCtx);
}
addEventListener('resize', resize, false);

/**
 * ========================== Model ===========================================
 */

/**
 * Add divisor method so we can do clock arithmetics. This is later used to
 *  determine tetromino orientation.
 */
Number.prototype.mod = function(n) {
  return ((this % n) + n) % n;
};

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

/**
 * Resets all the settings and starts the game.
 */
function init(gt) {
  toGreyRow = 21;
  clearTimeout(gLoop);
  fallingPiece.reset();
  inc = 0;
  stack = newGrid(10, 22);
  clear(stackCtx);
  clear(activeCtx);
  clear(holdCtx);
  holdPiece = void 0;
  gametype = gt;
  gravity = gravityUnit * 4;
  startTime = new Date().getTime();

  //TODO add first draw of grab bag here.
  //XXX fix ugly code lolwut
  firstRun = true;
  grabBag = randomGenerator();
  grabBag.push.apply(grabBag, randomGenerator());

  // Stats
  if (gametype === 0) {
    lineLimit = 40; //TODO select 10, 20, or 40
  } else {
    lineLimit = 150;
    score = 0;
    level = 1;
  }
  lines = 0;
  piecesSet = 0;
  score = 0;
  //time;
  //actions;
  level = 0;
  //combo = 0;
  statistics();

  drawPreview();
  progressUpdate();

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
    while (pieceList[0] == 3 || pieceList[0] == 4 || pieceList[0] == 6) {
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
  //TODO move this away
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
        if (range.indexOf(y + fallingPiece.y) == -1) {
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
    msg.innerHTML = 'KO!';
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
    if (count == 10) {
      lines++; //NOTE stats
      for (var y = row; y > 0; y--) {
        for (var x = 0; x < 10; x++) {
          stack[x][y] = stack[x][y - 1];
        }
      }
      progressUpdate();
    }
  }
  // Move lines down.

  // Move the stack down.
  piecesSet++; // Stats
  clear(stackCtx);
  draw(stack, 0, 0, stackCtx);
}

/**
 * Draws the stats next to the tetrion.
 */
function statistics() {
  var thisFrame = Date.now();
  time = thisFrame - startTime;

  minutes = time / 1000 / 60;
  lpm = (lines / minutes).toString().slice(0, 8);
  ppm = (piecesSet / minutes).toString().slice(0, 8);
  if (isNaN(lpm))
    lpm = 0;
  if (isNaN(ppm))
    ppm = 0;

  // Seconds and minutes for displaying clock.
  seconds = (time / 1000 % 60).toFixed(2);
  minutes = ~~(time / 60000);
  time = ((minutes < 10 ? '0' : '') + minutes).slice(-2) +
          (seconds < 10 ? ':0' : ':') + seconds;

  stats.innerHTML = '<h2>' + gametypes[gametype] + '</h2><table>' +
               '<tr><th>Line:<td>' + (lineLimit - lines) + 
               '<tr><th>Piece:<td>' + piecesSet +
               '<tr><th>Line/Min:<td>' + lpm +
               '<tr><th>Piece/Min:<td>' + ppm +
               '<tr><th>Time:<td>' + time +
               '</table>';
  linesLeft.innerHTML = lineLimit - lines;
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
    fallingPiece.tetro = pieces[grabBag[inc]].tetro;
    fallingPiece.kickData = pieces[grabBag[inc]].kickData;
    fallingPiece.x = pieces[grabBag[inc]].x;
    fallingPiece.y = pieces[grabBag[inc]].y;
    fallingPiece.index = pieces[grabBag[inc]].index;

    fallingPiece.active = true;

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
      msg.innerHTML = 'KO!';
    } else {
      drawPreview();
    }
  }

  // TODO Move to controller.
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
  } else if (fallingPiece.shiftDelay == settings.DAS && settings.DAS != 0) {
    fallingPiece.shift(shift);
    if (settings.ARR != 0)
      fallingPiece.shiftDelay++;
  // 5. If ARR Delay is full, move piece, and reset delay and repeat.
  } else if (fallingPiece.arrDelay == settings.ARR && settings.ARR != 0) {
    fallingPiece.shift(shift);
    // TODO Put this in method
    fallingPiece.arrDelay = 0;
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
  if (holdReleased && binds.hold in keysDown) {
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
    shiftReleased = false;
    switch(direction) {
    case 'left':
      if (settings.ARR == 0 && this.shiftDelay == settings.DAS) {
        for (var i = 0; i < 10; i++) {
          if (!moveValid(-i, 0, this.tetro)) {
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
      if (settings.ARR == 0 && this.shiftDelay == settings.DAS) {
        for (var i = 0; i < 10; i++) {
          if (!moveValid(i, 0, this.tetro)) {
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
      if (moveValid(0, 1, this.tetro))
        this.y += 1;
      break;
    }
  }
  this.hardDrop = function() {
    this.y += this.getDrop();
    this.lockDelay = 30;
  }
  this.getDrop = function() {
    var i = 1;
    for (i = 1; i < 22; i++) {
      if (!moveValid(0, i, this.tetro)) {
        return i - 1;
      }
    }
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
      } else {
        holdPiece = this.index;
        this.reset();
      }
      this.held = true;
      clear(holdCtx);
      draw(pieces[holdPiece].tetro, pieces[holdPiece].x - 3,
           2 + pieces[holdPiece].y, holdCtx);
    }
  }
  this.update = function() {
    // Apply gravity.
    if (moveValid(0, 1, this.tetro)) {
      this.y += gravity;
    } else {
      // We've landed.
      this.y = ~~this.y;
      if (this.lockDelay >= 30) {
        // Set piece.
        addPiece(this.tetro);
        this.held = false;
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
  // TODO have work with light and dark.
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (settings.dark)
    ctx.fillStyle = '#0b0b0b';
  else
    ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  function bgGrid(cellSize, borderSize, color) {
    ctx.fillStyle = color;
    for (var x = 0; x < ctx.canvas.width + 1; x += cellSize + borderSize) {
      ctx.fillRect(x, 0, borderSize, ctx.canvas.height);
    }
    for (var y = 0; y < ctx.canvas.height + 1; y += cellSize + borderSize) {
      ctx.fillRect(0, y, ctx.canvas.width, borderSize);
    }
  }
  if (settings.dark)
    bgGrid(cellSize, borderSize, '#111');
  else
    bgGrid(cellSize, borderSize, '#eee');
}

/**
 * Draws a mino.
 */
function drawCell(x, y, color, ctx) {
  x = ~~x * (cellSize + borderSize) + borderSize;
  y = (~~y * (cellSize + borderSize) + borderSize) - 2 * (cellSize + borderSize);
  ctx.fillStyle = color[1];
  ctx.fillRect(x, y, cellSize, cellSize);

  ctx.fillStyle = color[2];
  ctx.fillRect(x, y + cellSize / 2, cellSize, cellSize / 2);

  ctx.fillStyle = color[0];
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + cellSize, y + cellSize);
  ctx.lineTo(x + cellSize, y);
  ctx.lineTo(x, y + cellSize);
  ctx.fill();
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
          drawCell(x + cx, y + cy, colors[tetro[x][y]], ctx);
        } else {
          drawCell(x + cx, y + cy, colors[color], ctx);
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
  draw(pieces[grabBag[inc + i]].tetro, pieces[grabBag[inc + i]].x - 3,
       pieces[grabBag[inc + i]].y + 2 + i * 3, previewCtx);
  }
}

//TODO display none if not sprint or use for levels or soemthing.
function progressUpdate() {
  if (lines <= 10) {
    progressCtx.fillStyle = green[1];
  } else if (lines > 30) {
    progressCtx.fillStyle = red[1];
  } else {
    progressCtx.fillStyle = yellow[1];
  }
  progressCtx.fillRect(0, 0, progress.width, progress.height);
  progressCtx.clearRect(0, 0, progress.width, progress.height * lines / lineLimit);
}

// ========================== Controller ======================================

//document.onkeydown = function(e) {
addEventListener('keydown', function(e) {
  if ([32,37,38,39,40].indexOf(e.keyCode) != -1) {
    e.preventDefault();
  }
  if (e.keyCode == binds.moveLeft && !keysDown[e.keyCode]) {
    // Reset key
    fallingPiece.shiftDelay = 0;
    fallingPiece.arrDelay = 0;
    shiftReleased = true;
    shift = 'left';
  }
  if (e.keyCode == binds.moveRight && !keysDown[e.keyCode]) {
    // Reset key
    fallingPiece.shiftDelay = 0;
    fallingPiece.arrDelay = 0;
    shiftReleased = true;
    shift = 'right';
  }
  //if (bindsArr.indexOf(e.keyCode) != -1) {
  //  e.preventDefault();
  //}
  //if (e.keyCode == binds.pause) {
  //  toggleMenu(pauseMenu);
  //}
  if (e.keyCode == binds.retry) {
    init(gametype);
  }
  keysDown[e.keyCode] = true;
}, false);
addEventListener('keyup', function(e) {
  delete keysDown[e.keyCode];

  //if shift == right and moveright: shift released
  if (shift == 'right' && e.keyCode == binds.moveRight && keysDown[binds.moveLeft]) {
    fallingPiece.shiftDelay = 0;
    fallingPiece.arrDelay = 0;
    shiftReleased = true;
    shift = 'left';
  } else if (shift == 'left' && e.keyCode == binds.moveLeft && keysDown[binds.moveRight]) {
    fallingPiece.shiftDelay = 0;
    fallingPiece.arrDelay = 0;
    shiftReleased = true;
    shift = 'right';
  } else if (e.keyCode == binds.moveRight && keysDown[binds.moveLeft]) {
    shift = 'left';
  } else if (e.keyCode == binds.moveLeft && keysDown[binds.moveRight]) {
    shift = 'right';
  } else if (e.keyCode == binds.moveLeft || e.keyCode == binds.moveRight) {
    // Reset key
    fallingPiece.shiftDelay = 0;
    fallingPiece.arrDelay = 0;
    shiftReleased = true;
    shift = 0;
  }
  // Prevent repeating.
  if (e.keyCode == binds.rot180 || e.keyCode == binds.rotLeft || e.keyCode == binds.rotRight)
    rotateReleased = true;
  if (e.keyCode == binds.hardDrop)
    hardDropReleased = true;
  if (e.keyCode == binds.hold)
    holdReleased = true;

}, false);


// ========================== Loop ============================================


function gameLoop() {
  // TODO upgrade to request animation frame.
  if (!gameState) {
    update();
    clear(activeCtx);
    if (settings.dark) {
      draw(fallingPiece.tetro, fallingPiece.x,
           fallingPiece.y + fallingPiece.getDrop(), activeCtx, 9);
    } else {
      draw(fallingPiece.tetro, fallingPiece.x,
           fallingPiece.y + fallingPiece.getDrop(), activeCtx, 0);
    }
    draw(fallingPiece.tetro, fallingPiece.x, fallingPiece.y, activeCtx);
  } else {
    gameOverAnimation();
  }

  gLoop = setTimeout(gameLoop, 1000 / 60);
}

function countDownLoop() {
  end = startTime + 1999;
  var thisFrame = Date.now();
  time = end - thisFrame;
  if (time > 1000) {
    //TODO find better allcaps font
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

/**
 * Menu Buttons
 */
function toggleMenu(menuName) {
  if (menuName.style.display == 'none' && menu.style.display == 'none') {
    // Open menu
    menu.style.display = 'table';
    menuName.style.display = 'block';
  //} else if (menuName.style.display == 'none' && menu.style.display != 'none') {
  //  //switch menus
  //  for (i = 0; i < menus.length; i++) {
  //    menus[i].style.display = 'none';
  //  }
  //  menuName.style.display = 'inline-block';
  } else {
    //close the menu
    menu.style.display = 'none';
    menuName.style.display = 'none';
  }
}

/**
 * Local Storage
 */
var newKey,
  currCell,
  controls = document.getElementById('controls'),
  controlCells = controls.getElementsByTagName('td');
var inputs = document.getElementsByTagName('input');
var outputs = document.getElementsByTagName('output');

// Give controls an event listener.
for (var i = 0, len = controlCells.length; i < len; i++) {
  controlCells[i].onclick = function() {
    this.innerHTML = 'Press key';
    currCell = this;
  }
}
// Give settings an event listener.
for (var i = 0, len = inputs.length; i < len; i++) {
  inputs[i].onchange = function() {

    if (this.type == 'checkbox')
      settings[this.name] = this.checked;
    else
      settings[this.name] = this.value;
    if (outputs[this.name])
      outputs[this.name].value = this.value;

    localStorage.setItem('settings', JSON.stringify(settings));

    if (settings.dark)
      document.getElementsByTagName('html')[0].id = 'dark';
    else
      document.getElementsByTagName('html')[0].id = '';

    resize();
  }
}

// Listen for key input if a control has been clicked on.
addEventListener('keyup', function(e) {
  //TODO unbind key if used elsewhere
  // if click outside of cell or press esc clear currCell
  // get names for keycodes
  // reset binds button.
  if (currCell) {
    binds[currCell.id] = e.keyCode;
    currCell.innerHTML = key[e.keyCode];
    localStorage.setItem('binds', JSON.stringify(binds));
    currCell = 0;
  }
}, false);

function loadLocalData() {
  if (localStorage['binds']) {
    binds = JSON.parse(localStorage.getItem('binds'));
    for (var i = 0, len = controlCells.length; i < len; i++) {
      controlCells[i].innerHTML = key[binds[controlCells[i].id]];
    }
  }
  if (localStorage['settings']) {
    settings = JSON.parse(localStorage.getItem('settings'));
    for (var i = 0, len = inputs.length; i < len; i++) {
      if (inputs[i].type == 'checkbox') {
        inputs[i].checked = settings[inputs[i].name];
      } else {
        inputs[i].value = settings[inputs[i].name];
      }
      if (outputs[i])
        outputs[i].value = settings[inputs[i].name];
    }
  }
  if (settings.dark)
    document.getElementsByTagName('html')[0].id = 'dark';
}
loadLocalData();
resize();
