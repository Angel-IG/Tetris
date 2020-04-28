let canvas = document.getElementById('myCanvas');
let ctx = canvas.getContext('2d');

const W = 10; // Tiles for each column
const H = 20; // Tiles for each row
const T = canvas.width / W; // Tile length. It's the same as 'canvas.height / H'

let level = parseInt((new URLSearchParams(window.location.search)).get("level"));

let stackedTiles = (function() {
  result = [];
  row = [];
  for (let i = 0; i < H; i++) {
    for (let j = 0; j < W; j++) {
      row.push(0);
    }
    result.push([row][0]); // JS is so rare... It now works.
    row = [];
  }
  return result;
})(); // It's actually a 2d-array with 0s if there's no tile or the Tile object
// if there is some in that location. There're all 0s at the beginning.

function validCoord(tileArr) {
  return !(tileArr[0] < 0 || tileArr[0] > W || tileArr[1] < 0 || tileArr[1] > H);
}

class Tile {
  constructor(x, y, color, strokeColor = "#555") {
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
  constructor(X, Y, color, strokeColor = "#555") {
    this.tiles = [];
    for (let i = 0; i < X.length; i++) {
      this.tiles.push(new Tile(X[i], Y[i], color, strokeColor));
    }
    this.color = color;
    this.strokeColor = strokeColor;
    this.isBlocked = false;
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
      if (!validCoord(tile[0], tile[1])) {
        this.isBlocked = true;
        // Add the tiles to stackedTiles
        return false;
      } else if (stackedTiles[tile[0]][tile[1]]) { // If that index is not 0 or undefined
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

class IShaped extends Piece {
  constructor() {
    super([W / 2 - 2, W / 2 - 1, W / 2, W / 2 + 1], [0, 0, 0, 0], "#00F0F0");
    this.rotationState = 0;
  }
}

class LShaped extends Piece {
  constructor() {
    super([W / 2 - 2, W / 2 - 1, W / 2, W / 2 - 2], [0, 0, 0, 1], "#0000F0");
    this.rotationState = 0;
  }
}

class JShaped extends Piece {
  constructor() {
    super([W / 2 - 2, W / 2 - 1, W / 2, W / 2], [0, 0, 0, 1], "#F0A000");
    this.rotationState = 0;
  }
}

class OShaped extends Piece {
  constructor() {
    super([W / 2 - 1, W / 2, W / 2 - 1, W / 2], [0, 0, 1, 1], "#F0F000");
    this.rotationState = 0;
  }
}

class ZShaped extends Piece {
  constructor() {
    super([W / 2 - 2, W / 2 - 1, W / 2 - 1, W / 2], [0, 0, 1, 1], "#F00000");
    this.rotationState = 0;
  }
}

class SShaped extends Piece {
  constructor() {
    super([W / 2 - 2, W / 2 - 1, W / 2 - 1, W / 2], [1, 0, 1, 0], "#00F000");
    this.rotationState = 0;
  }
}

class TShaped extends Piece {
  constructor() {
    super([W / 2 - 2, W / 2 - 1, W / 2 - 1, W / 2], [0, 0, 1, 0], "#A000F0");
    this.rotationState = 0;
  }
}

// All the following is for testing
piece = new TShaped();

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Refresh canvas
  piece.draw();
  piece.stroke();
  piece.applyGravity();
  console.log(piece.isBlocked);
}

setInterval(draw, 300);
