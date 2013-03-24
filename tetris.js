/*
Author: Simon Laroche
Site: http://simon.lc/

Note: Before looking at this code, it would be wise to do a bit of reading about
the game so you know why some things are done a certain way.
*/

/**
 * Define playfield size.
 */
var cellSize = 30;
var borderSize = 2;
var stack;

/**
 * Get html elements. 
 */
var msg = document.getElementById('msg');
var stats = document.getElementById('stats');

// Get canvases and contexts
for (x = 0; x < document.getElementsByTagName('canvas').length; x++) {
    ID = document.getElementsByTagName("canvas")[x].id;
    eval('var ' + ID +
    'Canvas = document.getElementsByTagName("canvas")[x],' +
    ID + 'Ctx = ' + ID + 'Canvas.getContext("2d");');
}
/**
 * Piece data
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
var colors = [grey, cyan, blue, orange, yellow, green, purple, red, dark];

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
    hold: 16,
    rotRight: 67,
    rotLeft: 90,
    rot180: 88,
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

stackCanvas.width = 322;
stackCanvas.height = 642;
activeCanvas.width = stackCanvas.width;
activeCanvas.height = stackCanvas.height;
holdCanvas.width = 130;
holdCanvas.height = 98;
previewCanvas.width = 130;
previewCanvas.height = 578;
progressCanvas.height = stackCanvas.height;
progressCanvas.width = 6;
//for marathon
//previewCanvas.height = borderSize + (cellSize + borderSize) * 9;

/**
 * ========================== Model ==========================================
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
    var lineRange = [];
    var valid = false;
    for (var x = 0; x < tetro.length; x++) {
        for (var y = 0; y < tetro[x].length; y++) {
            if (tetro[x][y]) {
                stack[x + fallingPiece.x][y + fallingPiece.y] = tetro[x][y];
                if (lineRange.indexOf(y + fallingPiece.y) == -1) {

                    lineRange.push(y + fallingPiece.y);

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
    lineRange = lineRange.sort();
    for (var row = lineRange[0], len = row + lineRange.length; row < len; row++) {
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
    lpm = (lines / minutes).toPrecision().slice(0, 8);
    ppm = (piecesSet / minutes).toPrecision().slice(0, 8);
    if (isNaN(lpm))
        lpm = 0;
    if (isNaN(ppm))
        ppm = 0;

    // Seconds and minutes for displaying clock.
    // TODO Clean this up.
    seconds = Math.round((time / 1000) % 60 * 100) / 100;
    minutes = ~~((time / (1000 * 60)) % 60);

    if (seconds >= 10) {
        // TODO use 5 digits in final stats atleast
        time = ('0' + minutes).slice(-2) + ':' + (seconds % 60);
    } else {
        time = ('0' + minutes).slice(-2) + ':' + '0' + (seconds % 60);
    }
    stats.innerHTML = '<h2>' + gametypes[gametype] + '</h2><table>' +
                 //'<tr><th>Level:<td>' + level + // If level != 0
                 //'<tr><th>Score:<td>' + score +
                 '<tr><th>Line:<td>' + (lineLimit - lines) + 
                 '<tr><th>Piece:<td>' + piecesSet +
                 '<tr><th>Line/Min:<td>' + lpm +
                 '<tr><th>Piece/Min:<td>' + ppm +
                 '<tr><th>Time:<td>' + time +
                 '</table>';
}

/**
 * Fade to grey animation played when player loses.
 */
function gameOverAnimation() {
    // FIXME Stopped working.
    if (toGreyRow >= 2) {
        for (var x = 0; x < stack.length; x++) {
            if (stack[x][toGreyRow]) {
                stack[x][toGreyRow] = gameState - 1;
            }
        }
        toGreyRow--;
    }
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
    if (shiftReleased || fallingPiece.shiftDelay == 14) {
        if (binds.moveLeft in keysDown) {
            fallingPiece.shift('left');
            shiftReleased = false;
        }
        if (binds.moveRight in keysDown) {
            fallingPiece.shift('right');
            shiftReleased = false;
        }
    } else {
        fallingPiece.shiftDelay++;
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
    this.active = false;
    this.held = false;

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
        for (var x = 0; x < this.kickData[0].length; x++) {
            if (moveValid(
            this.kickData[this.pos.mod(4)][x][0] -
            this.kickData[(this.pos + direction).mod(4)][x][0],
            this.kickData[this.pos.mod(4)][x][1] -
            this.kickData[(this.pos + direction).mod(4)][x][1], rotated
            )) {
                this.x += this.kickData[this.pos.mod(4)][x][0] -
                    this.kickData[(this.pos + direction).mod(4)][x][0];
                this.y += this.kickData[this.pos.mod(4)][x][1] -
                    this.kickData[(this.pos + direction).mod(4)][x][1];
                this.tetro = rotated;
                this.pos = (this.pos + direction).mod(4);
                break;
            }
        }
    }
    this.shift = function(key) {
        switch(key) {
        case 'left':
            if (moveValid(-1, 0, this.tetro))
                this.x -= 1;
            break;
        case 'right':
            if (moveValid(1, 0, this.tetro))
                this.x += 1;
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
    this.reset = function() {
        this.pos = 0;
        this.tetro = [];
        this.active = false;
        this.held = false;
    }
    this.hold = function() {
        if (!this.held) {
            if (holdPiece !== undefined) {
                var temp = holdPiece;
                this.x = pieces[holdPiece].x;
                this.y = pieces[holdPiece].y;
                this.pos = 0;
                this.tetro = pieces[holdPiece].tetro;
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

// ========================== View ===========================================

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
                if (typeof color === "undefined") {
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

document.onkeydown = function(e) {
    keysDown[e.keyCode] = true;
    if ([32,37,38,39,40].indexOf(e.keyCode) != -1) {
        e.preventDefault();
    }
    //if (bindsArr.indexOf(e.keyCode) != -1) {
    //    e.preventDefault();
    //}
    if (e.keyCode == binds.pause) {
        //toggleMenu(pauseMenu);
    }
    if (e.keyCode == binds.retry) {
        init(gametype);
    }
};
addEventListener('keyup', function(e) {
    if (e.keyCode == binds.rot180 || e.keyCode == binds.rotLeft || e.keyCode == binds.rotRight) {
        rotateReleased = true;
    }
    if (e.keyCode == binds.moveLeft || e.keyCode == binds.moveRight) {
        fallingPiece.shiftDelay = 0;
        shiftReleased = true;
    }
    if (e.keyCode == binds.hardDrop) {
        hardDropReleased = true;
    }
    if (e.keyCode == binds.hold) {
        holdReleased = true;
    }
    delete keysDown[e.keyCode];
}, false);


// ========================== Loop ===========================================


function gameLoop() {
    // TODO upgrade to request animation frame.
    if (!gameState) {
        update();
    } else {
        gameOverAnimation();
    }

    clear(activeCtx);
    draw(fallingPiece.tetro, fallingPiece.x,
         fallingPiece.y + fallingPiece.getDrop(), activeCtx, 0);
    draw(fallingPiece.tetro, fallingPiece.x, fallingPiece.y, activeCtx);

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

function init(gt) {
    toGreyRow = 22; // this just =='s 22 I think.
    clearTimeout(gLoop);
    fallingPiece.reset();
    inc = 0;
    stack = newGrid(10, 22);
    clear(stackCtx);
    clear(activeCtx);
    clear(holdCtx);
    holdPiece = undefined;
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
 * Menu Buttons
 */
function toggleMenu(menuName) {
    if (menuName.style.display == 'none' && menu.style.display == 'none') {
        //open the menu
        menu.style.display = 'table';
        menuName.style.display = 'block';
//    } else if (menuName.style.display == 'none' && menu.style.display != 'none') {
//        //switch menus
//        for (i = 0; i < menus.length; i++) {
//            menus[i].style.display = 'none';
//        }
//        menuName.style.display = 'inline-block';
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
for (var i = 0, len = controlCells.length; i < len; i++) {
    controlCells[i].onclick = function() {
        currCell = this;
    }
}

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
}
loadLocalData();
