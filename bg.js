var bgCanvas = document.getElementById('bg');
var vidAr = bgCanvas.offsetWidth / bgCanvas.offsetHeight;
function bgResize() {
    var ar = window.innerWidth / window.innerHeight;
    if (ar > vidAr) {
        bgCanvas.style.height = 'auto';
        bgCanvas.style.width = window.innerWidth + 'px';
        var height = bgCanvas.offsetHeight;
        var shift = (height - window.innerHeight) / 2;
        if (shift < 0) shift = 0;
        bgCanvas.style.top = -shift + 'px';
        bgCanvas.style.left = 0;
    } else {
        bgCanvas.style.width = 'auto';
        bgCanvas.style.height = window.innerHeight + 'px';
        var width = bgCanvas.offsetWidth;
        var shift = (width - window.innerWidth) / 2;
        if (shift < 0) shift = 0;
        bgCanvas.style.left = -shift + 'px';
        bgCanvas.style.top = 0;
    }
}
addEventListener('resize', bgResize, false);
bgResize();
