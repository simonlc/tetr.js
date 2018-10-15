function Hold() {
  this.piece;
}
Hold.prototype.draw = function() {
  clear(holdCtx);
  if (this.piece === 0 || this.piece === 3) {
    draw(
      pieces[this.piece].tetro,
      pieces[this.piece].x - 3,
      2 + pieces[this.piece].y,
      holdCtx,
    );
  } else {
    draw(
      pieces[this.piece].tetro,
      pieces[this.piece].x - 2.5,
      2 + pieces[this.piece].y,
      holdCtx,
    );
  }
};
var hold = new Hold();
