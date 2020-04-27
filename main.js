let canvas = document.getElementById('myCanvas');
let ctx = canvas.getContext('2d');

const W = 10; // Tiles for each column
const H = 20; // Tiles for each row
const T = canvas.width / W; // Tile length. It's the same as 'canvas.height / H'

level = 1;

function validCoord(tile) {
  return !(tile.x < 0 || tile.x > W || tile.y < 0 || tile.y > H);
}

class Tile {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color
  }

  draw() {
    ctx.beginPath();
    ctx.rect(T * this.x, T * this.y, T, T);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }

  stroke() {
    ctx.beginPath();
    ctx.rect(T * this.x, T * this.y, T, T);
    ctx.strokeStyle = this.color;
    ctx.stroke();
    ctx.closePath();
  }
}
