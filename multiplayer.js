var MAX_PLAYERS = 6;
var MIN_PLAYERS = 2;
var BOARD_HEIGHT = 21;
var BOARD_WIDTH = 10;

var numPlayersSpan = document.getElementById('numPlayers');
var numPlayers = parseInt(numPlayersSpan.innerHTML, 10);
var stacks = {};
var stackCtxs = [];
var stackCanvases = [];
var roomID;

function increasePlayers() {
    if (numPlayers < MAX_PLAYERS) {
        numPlayers++;
        numPlayersSpan.innerText = numPlayers;
    }
}

function decreasePlayers() {
    if (numPlayers > MIN_PLAYERS) {
        numPlayers--;
        numPlayersSpan.innerText = numPlayers;
    }
}

// ask server for room for x people
// get room id from the server
function createRoom() {
    //Remove yourself from players
    numPlayers--;

    roomID = 'UXSF3SJ';
}

function createStacks() {
    for (var i = 0; i < numPlayers; i++) {
        var stackCanvas = document.createElement('canvas');
        stackCanvas.id = i;
        stackCanvas.setAttribute('class', 'canvas');
        stackCanvases.push(stackCanvas);

        document.getElementById('content').appendChild(stackCanvas);
        
        var stackCtx = stackCanvas.getContext('2d');
        stackCtxs.push(stackCtx);

        var stack = new Stack(stackCtx);
        stack.new(10, 22);
        stacks[i] = stack;
    }

    clearStackCtxs();
}

function clearStackCtxs() {
    for (var i = 0; i < numPlayers; i++) {
        clear(stackCtxs[i]);
    }
}

function drawStacks(spriteCanvas) {
    for (var i = 0; i < numPlayers; i++) {
        stacks[i].draw(spriteCanvas);
    }
}

function resizeStackCanvases(originalCellSize, a, b) {
    var cellSize = originalCellSize - (numPlayers * 5);
    for (var i = 0; i < numPlayers ; i++) {
        var stackCanvas = stackCanvases[i];
           
        stackCanvas.cellSize = cellSize;
        stackCanvas.width = cellSize * 10;
        stackCanvas.height = cellSize * 20;
        makeSprite(stackCanvas.cellSize, a, b);
    }
}

//sends players lines to the server
function sendLines(tetro, spriteCanvas) {
    for (var i = 0; i < numPlayers; i++) {
        stacks[i].addPiece(tetro, false, spriteCanvas);
    }
}

//adds lines to players stacks
function addLines(lines, gaps) {
    // for (var i = 0; i < BOARD_WIDTH; i++) {
    //     for (var j = 0; j < BOARD_HEIGHT; j++) {
    //         stack.grid[i][lines + j] = stack.grid[j];
    //     }
    // }

    for (var y = BOARD_HEIGHT; y > BOARD_HEIGHT - lines; y--) {
      for (var x = 0; x < BOARD_WIDTH; x++) {
        if (x != gaps[BOARD_HEIGHT - y]) {
            stack.grid[x][y] = 8;
        }
      }
    }
    stack.draw(spriteCanvas);
    console.log(stack.grid);
}

function removeCanvases() {
    for (var i = 0; i < stackCanvases.length; i++) {
        var canvas = stackCanvases[i]
        canvas.parentNode.removeChild(canvas);
    }

    stacks = {};
    stackCtxs = [];
    stackCanvases = [];
}
