let canvas = document.getElementById('myCanvas');
let ctx = canvas.getContext('2d');

const W = 10; // Tiles for each column
const H = 20; // Tiles for each row
const T = canvas.width / W; // Tile length. It's the same as 'canvas.height / H'

function validCoord(coord) {
  return !(coord[0] < 0 || coord[0] > W || coord[1] < 0 || coord[1] > H);
}

function drawTile(x, y, color) {
  ctx.beginPath();
  ctx.rect(T * x, T * y, T, T);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

function strokeTile(x, y, color) {
  ctx.beginPath();
  ctx.rect(T * x, T * y, T, T);
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
}
