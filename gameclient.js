MESSAGE_TYPES = {
    createRoom : 'CREATE_ROOM',
    joinRoom : 'JOIN_ROOM',
    start : 'START',
    dropPiece : 'DROP_PIECE',
    toppedOut : 'TOPPED_OUT'
};

function GameClient(url, protocols) {
    this.socket = new WebSocket(this.url, this.protocols);
    this.socket.onmessage = this.onmessage.bind(this);
}

GameClient.prototype.close = function() {
    this.socket.close();
};

GameClient.prototype.send = function(message) {
    this.socket.send(message);
};

GameClient.prototype.onmessage = function(event) {
    var message = event.data;
    
    switch(message.type) {
        case "game-start":
            // TODO: Start game.
            break;
        case "add-line":
            // TODO: Add line.
            break;
        case "update-player":
            break;
        case "game-over":
            break;
        case "room-created":
            // Give room ID back 
    }
};

GameClient.prototype.createRoom = function(numPlayers) {
    data = {
        type: MESSAGE_TYPES.createRoom,
        numPlayers: numPlayers
    };
    this.send(JSON.stringify(data));
};

GameClient.prototype.joinRoom = function(room) {
    data = {
        type: MESSAGE_TYPES.joinRoom,
        room: room
    };
    this.send(JSON.stringify(data));
};

GameClient.prototype.start = function() {
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