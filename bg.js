var img = new Image();
img.src = 'bg.jpg';

function bgResize() {
  var ar = window.innerWidth / window.innerHeight;

  bgCanvas.width = 570 * ar;
  bgCanvas.height = 570;

  if (ar > 1) {
    bgCtx.drawImage(img, 0, -285 * ar + 285, bgCanvas.width, 570 * ar);
  } else {
    bgCtx.drawImage(img, -285 + bgCanvas.width / 2, 0, 570, 570);
  }
}
addEventListener('resize', bgResize, false);
img.onload = function () {
  bgCanvas.style.opacity = 1;
  bgResize();
}
