MESSAGE_TYPES = {
    createRoom : 'createRoom',
    joinRoom : 'joinRoom',
    start : 'requestGameStart',
    dropPiece : 'dropPiece',
    toppedOut : 'toppedOut'
};

//WHY DO I NEED THIS
function GameClient() {
    // this.socket = new WebSocket(this.url, this.protocols);
    // this.socket.onmessage = this.onmessage.bind(this);
}

GameClient.prototype.new = function(url, protocols) {
    this.socket = new WebSocket(this.url, this.protocols);
    this.socket.onmessage = this.onmessage.bind(this);
    this.playerMapping = {}
}

GameClient.prototype.close = function() {
    this.socket.close();
};

GameClient.prototype.send = function(message) {
    this.socket.send(message);
};

GameClient.prototype.onmessage = function(event) {
    var data = event.data;

    switch(data.type) {
        case "gameStart":
            seed = data.seed;
            // init(2)
            break;
        case "roomCreated":
            handleRoomCreated(data.room)
            break;
        case "addLines":
            addLines(data.lines)
            break;
        case "updatePlayer":
            playerID = this.playerMapping[data.player]
            board = data.board
            break;
        case "gameOver":
            winnerID = data.winner
            break;
        case "playerJoin":
            this.addPlayerToMapping(data.player)
            handlePlayerJoin();
            break;
        case "playerLeave":
            var player = data.player;
            // remove players stack this.playerMapping[player]
            this.removePlayerFromMapping(player)
            break;
    }
};

GameClient.prototype.createRoom = function() {
    data = {
        type: MESSAGE_TYPES.createRoom,
    };
    this.send(JSON.stringify(data));
};

GameClient.prototype.joinRoom = function(roomID) {
    data = {
        type: MESSAGE_TYPES.joinRoom,
        room: roomID
    };
    this.send(JSON.stringify(data));
};

GameClient.prototype.requestGameStart = function() {
    data = {
        type: MESSAGE_TYPES.start
    };
    this.send(JSON.stringify(data));
};

GameClient.prototype.dropPiece = function(rotation, position) {
    data = {
        type: MESSAGE_TYPES.dropPiece,
        rotation: rotation,
        position: position
    };
    this.send(JSON.stringify(data));
};

GameClient.prototype.toppedOut = function() {
    data = {
        type: MESSAGE_TYPES.toppedOut
    };
    this.send(JSON.stringify(data));
}

GameClient.prototype.addPlayerToMapping = function(playerID, stackID) {
    this.playerMapping[playerID] = stackID;
}

GameClient.prototype.removePlayerToMapping = function(playerID) {
    delete this.playerMapping[playerID];
}


    //need to send over player tokens at he beginnging of a game os i can map it to a board id
//convert pieces for internal representation of board
//make rotation and indexes map up
    //add room id to URL --> best way of handling this? use a eventlistener and then connect or what 
    // https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history
    // push pop state as leave room
//different way of dropping pieces, if you give me a board theyre all grey, think it'll be cooler to go for straight real time 
// and ill figure out a way to represent it internally 
//only host can start game
// add removeCanvases to clear up at the end of a game
