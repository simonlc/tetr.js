var MAX_PLAYERS = 6;
var MIN_PLAYERS = 2;
var numPlayersSpan = document.getElementById('numPlayers');
var numOtherPlayers = parseInt(numPlayersSpan.innerHTML, 10);
var stacks = {};
var stackCtxs = [];
var stackCanvases = [];
var roomID;

function increasePlayers() {
    if (numOtherPlayers < MAX_PLAYERS) {
        numOtherPlayers++;
        numPlayersSpan.innerText = numOtherPlayers;
    }
}

function decreasePlayers() {
    if (numOtherPlayers > MIN_PLAYERS) {
        numOtherPlayers--;
        numPlayersSpan.innerText = numOtherPlayers;
    }
}

// ask server for room for x people
// get room id from the server
function createRoom() {
    roomID = 'UXSF3SJ';
}

function createStacks() {
    for (var i = 0; i < numOtherPlayers - 1; i++) {
        var canvas = document.createElement('canvas');
        canvas.id = i;
        stackCanvases.push(stackCanvas);

        document.getElementById('content').appendChild(canvas);
        
        var canvasCtx = canvas.getContext('2d');
        stackCtxs.push(canvasCtx);

        var stack = new Stack(canvasCtx);
        stacks[i] = stack;
        stack.new(10, 22);
    }
    clearStackCtxs();
}

function clearStackCtxs() {
    for (var i = 0; i < numOtherPlayers - 1; i++) {
        clear(stackCtxs[i]);
    }
}

function drawStacks(spriteCanvas) {
    for (var i = 0; i < numOtherPlayers - 1; i++) {
        stacks[i].draw(spriteCanvas);
    }
}

function resizeStackCanvases(originalCellsize, spriteCanvas, spriteCtx) {
    var cellSize = originalCellsize - 8;
    for (var i = 0; i < numOtherPlayers - 1; i++) {
        var stackCanvas = stackCanvases[i];
    
        stackCanvas.cellSize = cellSize;
        stackCanvas.width = cellSize * 10;
        stackCanvas.height = cellSize * 10;
        makeSprite(stackCanvas.cellSize, spriteCanvas, spriteCtx);
    }
}

function sendLines(tetro, spriteCanvas) {
for (var i = 0; i < numOtherPlayers - 1; i++) {
        stacks[i].addPiece(tetro, false, spriteCanvas);
    }
}
