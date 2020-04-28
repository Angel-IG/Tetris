let canvas = document.getElementById('myCanvas');
let ctx = canvas.getContext('2d');

const W = 10; // Tiles for each column
const H = 20; // Tiles for each row
const T = canvas.width / W; // Tile length. It's the same as 'canvas.height / H'

let level = parseInt((new URLSearchParams(window.location.search)).get("level"));

let stackedTiles = (function() {
  result = [];
  for (let i = 0; i < H; i++) {
    for (let j = 0; j < W; j++) {
      result.push(0);
    }
  }
  return result;
})(); // It's actually an array with 0s if there's no tile or the Tile object
// if there is some in that location. There're all 0s at the beginning.

function validCoord(tile) {
  return !(tile.x < 0 || tile.x > W || tile.y < 0 || tile.y > H);
}

class Tile {
  constructor(x, y, color, strokeColor = "ccc") {
    this.x = x;
    this.y = y;
    this.color = color;
    this.strokeColor = strokeColor;
  }

  toArray() {
    return [this.x, this.y];
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
    ctx.strokeStyle = this.strokeColor;
    ctx.stroke();
    ctx.closePath();
  }
}

class Piece {
  constructor(X, Y, color, strokeColor = "#ccc") {
    this.tiles = [];
    for (let i = 0; i < X.length; i++) {
      this.tiles.push(new Tile(X[i], Y[i], color, strokeColor));
    }
    this.color = color;
    this.strokeColor = strokeColor;
  }

  draw() {
    for (let tile of this.tiles) {
      ctx.beginPath();
      ctx.rect(T * tile.x, T * tile.y, T, T);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.closePath();
    }
  }

  stroke() {
    for (let tile of this.tiles) {
      ctx.beginPath();
      ctx.rect(T * tile.x, T * tile.y, T, T);
      ctx.strokeStyle = this.strokeColor;
      ctx.stroke();
      ctx.closePath();
    }
  }

  applyGravity() {
    // Moves the piece down if possible. If it is not possible,
    // it returns false, otherwise, it returns true.

    let prevTilesArr = [];
    let newTilesArr = [];
    for (let tile of this.tiles) {
      prevTilesArr.push(tile.toArray());
    }

    for (let tile of prevTilesArr) {
      newTilesArr.push([tile[0], tile[1] + 1])
    }

    let Xs = []; // Used later
    let Ys = []; // Used later

    for (let tile of newTilesArr) {
      Xs.push(tile[0]);
      Ys.push(tile[1]);
      if (!validCoord(tile[0], tile[1]) || stackedTiles[tile[0]][tile[1]] != 0) {
        return false;
      }
    }

    this.tiles = [];
    for (let i = 0; i < Xs.length; i++) {
      this.tiles.push(new Tile(Xs[i], Ys[i], this.color));
    }
    return true;
  }
}

// The following is for testing
piece = new Piece([0, 1, 2, 1], [0, 0, 0, 1], "#FFF");

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Refresh canvas
  piece.draw();
  piece.applyGravity();
}

setInterval(draw, 300);
