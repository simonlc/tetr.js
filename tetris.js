/*
Author: Simon Laroche
Site: http://simon.lc/
Demo: http://simon.lc/tetr.js

Note: Before looking at this code, it would be wise to do a bit of reading about
the game so you know why some things are done a certain way.
*/
'use strict';

/**
 * Playfield.
 */
var column;

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

var otherStackCanvas = document.getElementById('otherStack');
var otherStackCtx = otherStackCanvas.getContext('2d');

var stack = new Stack(stackCtx);
var otherStack = new Stack(otherStackCtx);

var preview = new Preview();
var piece = new Piece();

var frame;

/**
*Pausing variables
*/

var startPauseTime;
var pauseTime;

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

var replayKeys;
var watchingReplay = false;
var toGreyRow;
var gametype;
//TODO Make dirty flags for each canvas, draw them all at once during frame call.
// var dirtyHold, dirtyActive, dirtyStack, dirtyPreview;
var lastX, lastY, lastPos, landed;

// Stats
var lines;
var statsFinesse;
var piecesSet;
var startTime;
var digLines;

// Keys
var keysDown;
var lastKeys;
var released;

var binds = {
  pause: 27,
  holdPiece: 16,
  rotRight: 38,
  rotLeft: 88,
  rot180: 19,
  moveLeft: 37,
  moveRight: 39,
  moveDown: 40,
  hardDrop: 32,
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

function resize() {
  var a = document.getElementById('a');
  var b = document.getElementById('b');
  var c = document.getElementById('c');

  var other = document.getElementById('other');
  var content = document.getElementById('content');

  // TODO Finalize this.
  // Aspect ratio: 1.024
  var screenHeight = window.innerHeight - 34;
  var screenWidth = ~~(screenHeight * 1.024);
  var cellSize;
  
  if (screenWidth > window.innerWidth)
    screenHeight = ~~(window.innerWidth / 1.024);

  if (settings.Size === 1 && screenHeight > 602) {
    cellSize = 15;
  }
  else if (settings.Size === 2 && screenHeight > 602) {
    cellSize = 30;
  }
  else if (settings.Size === 3 && screenHeight > 902) {
    cellSize = 45;
  }
  else {
    cellSize = Math.max(~~(screenHeight / 20), 10);
  }

  var pad = (window.innerHeight - (cellSize * 20 + 2)) / 2 + 'px';
  content.style.padding = pad + ' 0';
  stats.style.bottom = pad;

  // Size elements
  a.style.padding = '0 0.5rem ' + ~~(cellSize / 2) + 'px';

  stackCanvas.width = activeCanvas.width = bgStackCanvas.width = cellSize * 10;
  stackCanvas.height = activeCanvas.height = bgStackCanvas.height = cellSize * 20;
  stackCanvas.cellSize = 2;
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

  otherStackCanvas.width = stackCanvas.width;
  otherStackCanvas.height = stackCanvas.height;

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
  makeSprite(cellSize);
  stackCanvas.cellSize = holdCanvas.cellSize = bgStackCanvas.cellSize = 
    activeCanvas.cellSize = previewCanvas.cellSize = spriteCanvas.cellSize = cellSize;

  otherStackCanvas.cellSize = cellSize - 5;

  if (settings.Grid === 1)
    bg(bgStackCtx);

  if (gameState === 0) {
    piece.drawGhost();
    piece.draw();
    stack.draw();
    otherStack.draw();
    preview.draw();
    if (hold.piece) {
      hold.draw();
    }
  }
}
addEventListener('resize', resize, false);
resize();
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
    // TODO Make new seed and rng method.
    replayKeys.seed = ~~(Math.random() * 2147483645) + 1;
    gametype = gt;
  }

  lineLimit = 40;

  //Reset
  column = 0;
  keysDown = 0;
  lastKeys = 0;
  released = 255;
  //TODO Check if needed.
  piece.shiftDir = 0;
  piece.shiftReleased = true;

  startPauseTime = 0;
  pauseTime = 0;
  paused = false;

  rng.seed = replayKeys.seed;
  toGreyRow = 21;
  frame = 0;
  lastPos = 'reset';
  stack.new(10, 22);
  otherStack.new(10, 22);
  hold.piece = void 0;
  if (settings.Gravity === 0) gravity = gravityUnit * 4;
  startTime = Date.now();

  preview.init()
  //preview.draw();

  statsFinesse = 0;
  lines = 0;
  piecesSet = 0;

  statsPiece.innerHTML = piecesSet;
  statsLines.innerHTML = lineLimit - lines;
  statistics();
  clear(stackCtx);
  clear(otherStackCtx);
  clear(activeCtx);
  clear(holdCtx);

  if (gametype === 3) {
    // Dig Race
    // make ten random numbers, make sure next isn't the same as last?
    //TODO make into function or own file.

    digLines = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

    statsLines.innerHTML = 10;
    statsLines.innerHTML = 10;
    var randomNums = [];
    for (var i = 0; i < 10; i++) {
      var random = ~~(rng.next() * 10);
      if (random !== randomNums[i - 1])
        randomNums.push(random);
      else {
        i--;
      }
    }
    for (var y = 21; y > 11; y--) {
      for (var x = 0; x < 10; x++) {
        if (randomNums[y - 12] !== x) {
            stack.grid[x][y] = 8;
          }
      }
    }
    stack.draw();
  }

  menu();

  // Only start a loop if one is not running already.
  if (gameState === 3) {
    gameState = 2;
    gameLoop();
  } else {
    gameState = 2;
  }
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

function pause() {
  if (gameState === 0) {
    paused = true;
    startPauseTime = Date.now();
    msg.innerHTML = "Paused";
    menu(4);
  }
}

function unpause() {
  paused = false;
  pauseTime += (Date.now() - startPauseTime);
  msg.innerHTML = '';
  menu();
}

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

// ========================== Loop ============================================

//TODO Cleanup gameloop and update.
/**
 * Runs every frame.
 */
function update() {
  //TODO Das preservation broken.
  if (lastKeys !== keysDown && !watchingReplay) {
    replayKeys[frame] = keysDown;
  } else if (frame in replayKeys) {
    keysDown = replayKeys[frame];
  }

  if (!(lastKeys & flags.holdPiece) && flags.holdPiece & keysDown) {
    piece.hold();
  }

  if (flags.rotLeft & keysDown && !(lastKeys & flags.rotLeft)) {
    piece.rotate(-1);
    piece.finesse++;
  } else if (flags.rotRight & keysDown && !(lastKeys & flags.rotRight)) {
    piece.rotate(1);
    piece.finesse++;
  } else if (flags.rot180 & keysDown && !(lastKeys & flags.rot180)) {
    piece.rotate(1);
    piece.rotate(1);
    piece.finesse++;
  }

  piece.checkShift();

  if (flags.moveDown & keysDown) {
    piece.shiftDown();
    //piece.finesse++;
  }
  if (!(lastKeys & flags.hardDrop) && flags.hardDrop & keysDown) {
    piece.hardDrop();
  }

  piece.update();

  // Win
  // TODO
  if (gametype !== 3) {
    if (lines >= lineLimit) {
      gameState = 1;
      msg.innerHTML = 'GREAT!';
      menu(3);
    }
  } else {
    if (digLines.length === 0) {
      gameState = 1;
      msg.innerHTML = 'GREAT!';
      menu(3);
    }
  }

  statistics();

  if (lastKeys !== keysDown) {
    lastKeys = keysDown;
  }
}

function gameLoop() {
  requestAnimFrame(gameLoop);

  //TODO check to see how pause works in replays.
  frame++;

  if (gameState === 0) {
    // Playing
    
    if (!paused) {
      update();
    }

    // TODO improve this with 'dirty' flags.
    if (piece.x !== lastX ||
    Math.floor(piece.y) !== lastY ||
    piece.pos !== lastPos ||
    piece.dirty) {
      clear(activeCtx);
      piece.drawGhost();
      piece.draw();
    }
    lastX = piece.x;
    lastY = Math.floor(piece.y);
    lastPos = piece.pos;
    piece.dirty = false;
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
      piece.new(preview.next());
    }
    // DAS Preload
    if (lastKeys !== keysDown && !watchingReplay) {
      replayKeys[frame] = keysDown;
    } else if (frame in replayKeys) {
      keysDown = replayKeys[frame];
    }
    if (keysDown & flags.moveLeft) {
      lastKeys = keysDown;
      piece.shiftDelay = settings.DAS;
      piece.shiftReleased = false;
      piece.shiftDir = -1;
    } else if (keysDown & flags.moveRight) {
      lastKeys = keysDown;
      piece.shiftDelay = settings.DAS;
      piece.shiftReleased = false;
      piece.shiftDir = 1;
    }
  } else if (toGreyRow >= 2){
    /**
     * Fade to grey animation played when player loses.
     */
    if (toGreyRow === 21)
      clear(activeCtx);
    if (frame % 2) {
      for (var x = 0; x < 10; x++) {
        if (stack.grid[x][toGreyRow]) {
          stack.grid[x][toGreyRow] = gameState - 1;
        }
      }
      stack.draw();
      toGreyRow--;
    }
  }
}
