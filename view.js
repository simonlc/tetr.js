// ========================== View ============================================

/**
 * Draws grid in background.
 */
function bg(ctx) {
    var cellSize = ctx.canvas.cellSize;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = '#1c1c1c';
    for (var x = -1; x < ctx.canvas.width + 1; x += cellSize) {
        ctx.fillRect(x, 0, 2, ctx.canvas.height);
    }
    for (var y = -1; y < ctx.canvas.height + 1; y += cellSize) {
        ctx.fillRect(0, y, ctx.canvas.width, 2);
    }
}

/**
 * Draws a pre-rendered mino.
 */
function drawCell(x, y, color, ctx, spriteCanvas) {
    var cellSize = ctx.canvas.cellSize;

    x = x * cellSize;
    x = ~~x;
    y = ~~y * cellSize - 2 * cellSize;

    ctx.drawImage(spriteCanvas, color * cellSize, 0, cellSize, cellSize, x, y, cellSize, cellSize);
}

/**
 * Pre-renders all mino types in all colors.
 */
function makeSprite(cellSize, spriteCanvas, spriteCtx) {
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
        //25         37         52         -21        -45
        ['#ffffff', '#ffffff', '#ffffff', '#888888', '#4d4d4d'],
        ['#7bffdf', '#9fffff', '#ccffff', '#008165', '#00442e'],
        ['#6cdcff', '#93feff', '#c2ffff', '#00629f', '#002c60'],
        ['#ffc166', '#ffe386', '#ffffb0', '#aa4800', '#650500'],
        ['#ffff6a', '#ffff8c', '#ffffb8', '#b68a00', '#714f00'],
        ['#efff81', '#ffffa2', '#ffffcd', '#6b9200', '#2c5600'],
        ['#dc9dfe', '#ffbeff', '#ffe9ff', '#5d287e', '#210043'],
        ['#ff9277', '#ffb497', '#ffe0bf', '#a7000a', '#600000'],
        ['#cbcbcb', '#ededed', '#ffffff', '#545454', '#1f1f1f']
    ];
    var tgm = [
        ['#7b7b7b', '#303030', '#6b6b6b', '#363636'],
        ['#f08000', '#a00000', '#e86008', '#b00000'],
        ['#00a8f8', '#0000b0', '#0090e8', '#0020c0'],
        ['#f8a800', '#b84000', '#e89800', '#c85800'],
        ['#e8e000', '#886800', '#d8c800', '#907800'],
        ['#f828f8', '#780078', '#e020e0', '#880088'],
        ['#00e8f0', '#0070a0', '#00d0e0', '#0080a8'],
        ['#78f800', '#007800', '#58e000', '#008800'],
        ['#7b7b7b', '#303030', '#6b6b6b', '#363636'],
    ];
    var world = [];
    world[0] = tgm[0];
    world[1] = tgm[6];
    world[2] = tgm[2];
    world[3] = tgm[3];
    world[4] = tgm[4];
    world[5] = tgm[7];
    world[6] = tgm[5];
    world[7] = tgm[1];
    world[8] = tgm[8];

    spriteCanvas.width = cellSize * 9;
    spriteCanvas.height = cellSize;
    for (var i = 0; i < 9; i++) {
        var x = i * cellSize;
        var grad, k;
        if (settings.Block === 0) {
            // Shaded
            spriteCtx.fillStyle = shaded[i][1];
            spriteCtx.fillRect(x, 0, cellSize, cellSize);

            spriteCtx.fillStyle = shaded[i][3];
            spriteCtx.fillRect(x, cellSize / 2, cellSize, cellSize / 2);

            spriteCtx.fillStyle = shaded[i][0];
            spriteCtx.beginPath();
            spriteCtx.moveTo(x, 0);
            spriteCtx.lineTo(x + cellSize / 2, cellSize / 2);
            spriteCtx.lineTo(x, cellSize);
            spriteCtx.fill();

            spriteCtx.fillStyle = shaded[i][2];
            spriteCtx.beginPath();
            spriteCtx.moveTo(x + cellSize, 0);
            spriteCtx.lineTo(x + cellSize / 2, cellSize / 2);
            spriteCtx.lineTo(x + cellSize, cellSize);
            spriteCtx.fill();
        } else if (settings.Block === 1) {
            // Flat
            spriteCtx.fillStyle = shaded[i][0];
            spriteCtx.fillRect(x, 0, cellSize, cellSize);
        } else if (settings.Block === 2) {
            // Glossy
            k = Math.max(~~(cellSize * 0.083), 1);

            grad = spriteCtx.createLinearGradient(x, 0, x + cellSize, cellSize);
            grad.addColorStop(0.5, glossy[i][3]);
            grad.addColorStop(1, glossy[i][4]);
            spriteCtx.fillStyle = grad;
            spriteCtx.fillRect(x, 0, cellSize, cellSize);

            grad = spriteCtx.createLinearGradient(x, 0, x + cellSize, cellSize);
            grad.addColorStop(0, glossy[i][2]);
            grad.addColorStop(0.5, glossy[i][1]);
            spriteCtx.fillStyle = grad;
            spriteCtx.fillRect(x, 0, cellSize - k, cellSize - k);

            grad = spriteCtx.createLinearGradient(x + k, k, x + cellSize - k, cellSize - k);
            grad.addColorStop(0, shaded[i][0]);
            grad.addColorStop(0.5, glossy[i][0]);
            grad.addColorStop(0.5, shaded[i][0]);
            grad.addColorStop(1, glossy[i][0]);
            spriteCtx.fillStyle = grad;
            spriteCtx.fillRect(x + k, k, cellSize - k * 2, cellSize - k * 2);
        } else if (settings.Block === 3 || settings.Block === 4) {
            // Arika
            if (settings.Block === 4) tgm = world;
            k = Math.max(~~(cellSize * 0.125), 1);

            spriteCtx.fillStyle = tgm[i][1];
            spriteCtx.fillRect(x, 0, cellSize, cellSize);
            spriteCtx.fillStyle = tgm[i][0];
            spriteCtx.fillRect(x, 0, cellSize, ~~(cellSize / 2));

            grad = spriteCtx.createLinearGradient(x, k, x, cellSize - k);
            grad.addColorStop(0, tgm[i][2]);
            grad.addColorStop(1, tgm[i][3]);
            spriteCtx.fillStyle = grad;
            spriteCtx.fillRect(x + k, k, cellSize - k * 2, cellSize - k * 2);

            grad = spriteCtx.createLinearGradient(x, k, x, cellSize);
            grad.addColorStop(0, tgm[i][0]);
            grad.addColorStop(1, tgm[i][3]);
            spriteCtx.fillStyle = grad;
            spriteCtx.fillRect(x, k, k, cellSize - k);

            grad = spriteCtx.createLinearGradient(x, 0, x, cellSize - k);
            grad.addColorStop(0, tgm[i][2]);
            grad.addColorStop(1, tgm[i][1]);
            spriteCtx.fillStyle = grad;
            spriteCtx.fillRect(x + cellSize - k, 0, k, cellSize - k);
        }
    }
}

/**
 * Clear canvas.
 */
function clear(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

/**
 * Draws a 2d array of minos.
 */
function draw(tetro, cx, cy, ctx, color, spriteCanvas) {
    for (var x = 0, len = tetro.length; x < len; x++) {
        for (var y = 0, wid = tetro[x].length; y < wid; y++) {
            if (tetro[x][y]) drawCell(x + cx, y + cy, color !== void 0 ? color : tetro[x][y], ctx, spriteCanvas);
        }
    }
}
