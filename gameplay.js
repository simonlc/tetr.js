/**
 * Gameplay specific vars.
 */
var gravityUnit = 0.00390625;
var gravity;
var gravityArr = (function () {
    var array = [];
    array.push(0);
    for (var i = 1; i < 64; i++) {
        array.push(i / 64);
    }
    for (var j = 1; j <= 20; j++) {
        array.push(j);
    }
    return array;
})();

var settings = {
    DAS: 10,
    ARR: 1,
    Gravity: 0,
    'Soft Drop': 31,
    'Lock Delay': 30,
    Size: 0,
    Sound: 0,
    Volume: 100,
    Block: 0,
    Ghost: 0,
    Grid: 0,
    Outline: 0
};

var setting = {
    DAS: range(0, 31),
    ARR: range(0, 11),
    Gravity: (function () {
        var array = [];
        array.push('Auto');
        array.push('0G');
        for (var i = 1; i < 64; i++) {
            array.push(i + '/64G');
        }
        for (var j = 1; j <= 20; j++) {
            array.push(j + 'G');
        }
        return array;
    })(),
    'Soft Drop': (function () {
        var array = [];
        for (var i = 1; i < 64; i++) {
            array.push(i + '/64G');
        }
        for (var j = 1; j <= 20; j++) {
            array.push(j + 'G');
        }
        return array;
    })(),
    'Lock Delay': range(0, 101),
    Size: ['Auto', 'Small', 'Medium', 'Large'],
    Sound: ['Off', 'On'],
    Volume: range(0, 101),
    Block: ['Shaded', 'Solid', 'Glossy', 'Arika', 'World'],
    Ghost: ['Normal', 'Colored', 'Off'],
    Grid: ['Off', 'On'],
    Outline: ['Off', 'On']
};

function range(start, end, inc) {
    inc = inc || 1;
    var array = [];
    for (var i = start; i < end; i += inc) {
        array.push(i);
    }
    return array;
}

/**
 * Park Miller "Minimal Standard" PRNG.
 */
//TODO put random seed method in here.
var rng = new (function () {
    this.seed = 1;
    this.next = function () {
        // Returns a float between 0.0, and 1.0
        return (this.gen() / 2147483647);
    };
    this.gen = function () {
        return this.seed = (this.seed * 16807) % 2147483647;
    };
})();