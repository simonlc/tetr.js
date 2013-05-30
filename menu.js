/**
 * Show and hide menus.
 */
var menus = document.getElementsByClassName('menu');
function menu(menuIndex) {
  for (var i = 0, len = menus.length; i < len; i++) {
    menus[i].classList.remove('on');
  }
  if (menuIndex !== void 0)
    menus[menuIndex].classList.add('on');
}

/**
 * Controls Menu
 */
var newKey,
  currCell,
  tempKey,
  controls = document.getElementById('controls'),
  controlCells = controls.getElementsByTagName('td');
// Give controls an event listener.
for (var i = 0, len = controlCells.length; i < len; i++) {
  controlCells[i].onclick = function() {
    // First check if we're already waiting for an input.
    if (currCell) {
      // TODO DRY
      // Make this into a function and call it when we press Esc.
      binds[currCell.id] = tempKey;
      currCell.innerHTML = key[tempKey];
    }
    tempKey = binds[this.id];
    this.innerHTML = 'Press key';
    currCell = this;
  }
}
// Listen for key input if a control has been clicked on.
addEventListener('keyup', function(e) {
  // if click outside of cell or press esc clear currCell
  // reset binds button.
  if (currCell) {
    // Checks if key already in use, and unbinds it.
    for (var i in binds) {
      if (e.keyCode === binds[i]) {
        binds[i] = void 0;
        document.getElementById(i).innerHTML = binds[i];
      }
    }
    // Binds the key and saves the data.
    binds[currCell.id] = e.keyCode;
    currCell.innerHTML = key[e.keyCode];
    localStorage.setItem('binds', JSON.stringify(binds));
    currCell = 0;
  }
}, false);

/**
 * Settings Menu
 */
function settingsLoop() {
  if (arrowReleased || arrowDelay >= 6) {
    if (settingsArrow)
      settings[s] = (settings[s] === 0) ? setting[s].length - 1 : settings[s] - 1;
    else
      settings[s] = (settings[s] === setting[s].length - 1) ? 0 : settings[s] + 1;
    saveSetting(s);
    arrowReleased = false;
  } else {
    arrowDelay++;
  }
  setLoop = setTimeout(settingsLoop, 50);
}
var s;
var settingsArrow;
// TODO DRY this.
function arrowRelease() {
    arrowReleased = true;
    arrowDelay = 0;
    clearTimeout(setLoop)
}
function left() {
  settingsArrow = 1;
  s = this.parentNode.id;
  this.onmouseup = arrowRelease;
  this.onmouseout = arrowRelease;
  settingsLoop();
}
function right() {
  settingsArrow = 0;
  s = this.parentNode.id;
  this.onmouseup = arrowRelease;
  this.onmouseout = arrowRelease;
  settingsLoop();
}

/**
 * LocalStorage functions
 */
function saveSetting(s) {
  localStorage['version'] = version;

  document.getElementById(s)
  .getElementsByTagName('span')[0]
  .innerHTML = setting[s][settings[s]];

  localStorage['settings'] = JSON.stringify(settings);
}
function loadLocalData() {
  if (localStorage['binds']) {
    binds = JSON.parse(localStorage.getItem('binds'));
    for (var i = 0, len = controlCells.length; i < len; i++) {
      controlCells[i].innerHTML = key[binds[controlCells[i].id]];
    }
  }
  if (localStorage['version'] !== version)
    localStorage.removeItem('settings');
  if (localStorage['settings']) {
    settings = JSON.parse(localStorage.getItem('settings'));
  }
}

loadLocalData();
for (var s in settings) {
  var div = document.createElement('div');
  var b = document.createElement('b');
  var iLeft = document.createElement('i');
  var span = document.createElement('span');
  var iRight = document.createElement('i');

  div.id = s;
  b.innerHTML = s + ':';
  span.innerHTML = setting[s][settings[s]];
  iLeft.className = 'left';
  iRight.className = 'right';
  iLeft.onmousedown = left;
  iRight.onmousedown = right;

  set.appendChild(div);
  div.appendChild(b);
  div.appendChild(iLeft);
  div.appendChild(span);
  div.appendChild(iRight);
}
resize();
