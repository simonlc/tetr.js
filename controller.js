// ========================== Controller ======================================
addEventListener('keydown', function (e) {
    // TODO send to menu or game depending on context.
    if ([32, 37, 38, 39, 40].indexOf(e.keyCode) !== -1)
        e.preventDefault();
    //TODO if active, prevent default for binded keys
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
            //piece.finesse++
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
addEventListener('keyup', function (e) {
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