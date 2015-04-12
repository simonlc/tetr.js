var MAX_PLAYERS = 6;
var MIN_PLAYERS = 2;
var BOARD_HEIGHT = 21;
var BOARD_WIDTH = 10;

var LOSER = "LOSER!";
var WINNER = "WINNER!";

var numPlayersSpan = document.getElementById('numPlayers');
var numPlayers = parseInt(numPlayersSpan.innerHTML, 10);
var stacks = {};
var divs = [];

var roomID;

var TEMP_LOSE = {};

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
    numPlayers = parseInt(numPlayersSpan.innerHTML, 10) - 1;
    roomID = 'UXSF3SJ';
}

function createStacks() {
    for (var i = 0; i < numPlayers; i++) {
        var div = document.createElement("div");
        div.setAttribute("class", "b");
        div.setAttribute("data-spritecanvas", "spriteTwo");

        var stackCanvas = document.createElement('canvas');
        stackCanvas.id = "canvas";
        div.appendChild(stackCanvas);

        var msg = document.createElement("p");
        msg.id = "otherMsg";
        msg.setAttribute("class", "otherMsg");
        div.appendChild(msg);

        document.getElementById("content").appendChild(div);
        divs.push(div);

        var stack = new Stack(stackCanvas.getContext("2d"));
        stack.new(10, 22);
        stacks[i] = stack;
    }

    divs.push(document.getElementById("b"));
    stacks[numPlayers] = getCurrentPlayerStack();
    clearStackCtxs();
}

function clearStackCtxs() {
    for (var i = 0; i < numPlayers; i++) {
        var stackCtx = divs[i].getElementsByTagName("canvas")[0].getContext("2d");
        clear(stackCtx);
    }
}

function drawStacks() {
    for (var i = 0; i < numPlayers; i++) {
        stacks[i].draw(getSpriteCanvas(i));
    }
}

function resizeStackCanvases(originalCellSize, a, b) {
    var cellSize = originalCellSize - (numPlayers * 5);
    for (var i = 0; i < numPlayers; i++) {
        var canvas = divs[i].getElementsByTagName("canvas")[0];
        var msg = divs[i].getElementsByTagName("p")[0];

        canvas.cellSize = cellSize;

        canvas.width = cellSize * 10;
        canvas.height = cellSize * 20;
        divs[i].style.width = canvas.width + "px";
        divs[i].style.height = canvas.height + "px";

        makeSprite(canvas.cellSize, a, b);

        msg.style.fontSize = ~~(canvas.width / 6) + 'px';
    }
}

//sends players lines to the server
function sendLines(tetro) {
    for (var i = 0; i < numPlayers; i++) {
        if (TEMP_LOSE[i]) {
            break;
        }
        stacks[i].addPiece(tetro, false, getSpriteCanvas(i));
    }
}

//adds lines to players stacks
function addLines(lines, gaps) {
    for (var y = 0; y <= BOARD_HEIGHT - lines; y++) {
        for (var x = 0; x < BOARD_WIDTH; x++) {
            if (stack.grid[x][y + lines] !== undefined) {
                stack.grid[x][y] = stack.grid[x][y + lines];
            }
        }
    }

    for (var y = BOARD_HEIGHT; y > BOARD_HEIGHT - lines; y--) {
        for (var x = 0; x < BOARD_WIDTH; x++) {
            if (x != gaps[BOARD_HEIGHT - y]) {
                stack.grid[x][y] = 8;
            } else {
                stack.grid[x][y] = undefined;
            }
        }
    }
    stack.draw(spriteCanvas);
}

function removeCanvases() {
    for (var i = 0; i < divs.length - 1; i++) {
        divs[i].parentNode.removeChild(divs[i]);
    }

    stacks = {};
    divs = [];
}

function endPlayer(id, status) {
    id += "";
    var msg = divs[id].getElementsByTagName("p")[0];

    greyOutStack(stacks[id], getSpriteCanvas(i));
    msg.innerHTML = status;

    TEMP_LOSE[id + ""] = true;

    if (id == numPlayers) {
        gameState = 9;
    }
}

function end() {
    for (var i = 0; i < numPlayers; i++) {
        console.log(i, "end");
        endPlayer(i, LOSER);
    }
    endPlayer(numPlayers, WINNER);
}

function getSpriteCanvas(i) {
    console.log(i);
    var spriteSource = divs[i].dataset.spritecanvas;
    return document.getElementById(spriteSource);
}