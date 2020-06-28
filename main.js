let canvas = document.getElementById('myCanvas');
let ctx = canvas.getContext('2d');

const W = 10; // Tiles for each column
const H = 20; // Tiles for each row
const T = canvas.width / W; // Tile length. It's the same as 'canvas.height / H'

const FPS = 60;

const DOWN = 1;
const RIGHT = 2;
const LEFT = 3;

const IForm = {
  x: [W / 2 - 2, W / 2 - 1, W / 2, W / 2 + 1],
  y: [0, 0, 0, 0],
};

const LForm = {
  x: [W / 2 - 2, W / 2 - 1, W / 2, W / 2 - 2],
  y: [0, 0, 0, 1],
};

const JForm = {
  x: [W / 2 - 2, W / 2 - 1, W / 2, W / 2],
  y: [0, 0, 0, 1],
};

const OForm = {
  x: [W / 2 - 1, W / 2, W / 2 - 1, W / 2],
  y: [0, 0, 1, 1],
};

const ZForm = {
  x: [W / 2 - 2, W / 2 - 1, W / 2 - 1, W / 2],
  y: [0, 0, 1, 1],
};

const SForm = {
  x: [W / 2 - 2, W / 2 - 1, W / 2 - 1, W / 2],
  y: [1, 0, 1, 0],
};

const TForm = {
  x: [W / 2 - 2, W / 2 - 1, W / 2 - 1, W / 2],
  y: [0, 0, 1, 0],
};

const urlParser = new URLSearchParams(window.location.search); // To parse arguments
const initLevel = parseInt(urlParser.get("level"));
let currentLevel = initLevel;
let lines = 0;

const floatingBlocks = urlParser.get("floatingblocks") !== null;
/*
This is part of a secret mode: the Floating Blocks Mode.
Once you make a line in this variant, the line clears but
the blocks above it remain where they are.

Turns out that this is kind of interesting to play, so I've
made a secret mode to play this way. To play it you have to
add "&floatingblocks" (without the qoutes) to the end of the
URL of the game page.

Now I'll explain how the line before this comment block works.
urlParser.get("floatingblocks") will return null if there's not
URL query parameter named "floatingblocks", so by using !==, I
make 'floatingBlocks' true if there's "floatingblocks" in the URL
and false if there's not.
*/

let currentPiece;
let gameOver = false;

let frameCounter = 1; // For appling gravity. Go to the 'draw' function

let stackedTiles = (function() {
  result = [];
  row = [];
  for (let i = 0; i < W; i++) {
    for (let j = 0; j < H; j++) {
      row.push(0);
    }
    result.push([row][0]); // JS is so rare... It now works.
    row = [];
  }
  return result;
})(); // It's actually a 2d-array with 0s if there's no tile or the Tile object
// if there is some in that location. There're all 0s at the beginning.

function isLineCompleted(rowIndx) {
  let row = [];
  for (let i = 0; i < stackedTiles.length; i++) {
    row.push(stackedTiles[i][rowIndx]);
  }

  for (let element of row) {
    if (element === 0) {
      return false;
    }
  }

  return true;
}

function validCoord(tileArr) {
  return !(tileArr[0] < 0 || tileArr[0] >= W || tileArr[1] >= H);
}

document.addEventListener("keydown", keyDownHandler, false);

function keyDownHandler(e) {
  if (currentPiece) {
    // Maybe the following will be better with 'switch'.
    if (e.keyCode === 32) { // SPACE
      currentPiece.rotate();
    } else if (e.keyCode === 40) { // Down
      currentPiece.move(DOWN);
    } else if (e.keyCode === 39) { // Right
      currentPiece.move(RIGHT);
    } else if (e.keyCode === 37) { // Left
      currentPiece.move(LEFT);
    }
  }
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
  }

  draw() {
    for (let tile of this.tiles) {
      tile.draw();
    }
  }

  stroke() {
    for (let tile of this.tiles) {
      tile.stroke();
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
      try {
        if (!validCoord(tile) || stackedTiles[tile[0]][tile[1]]) {
          this.block();
          return false;
        }
      } catch (e) {
        return false;
      }
    }

    this.tiles = [];
    for (let i = 0; i < Xs.length; i++) {
      this.tiles.push(new Tile(Xs[i], Ys[i], this.color));
    }
    return true;
  }

  move(direction) {
    // The return values are the same as with 'applyGravity'.
    let prevTilesArr = [];
    let newTilesArr = [];
    for (let tile of this.tiles) {
      prevTilesArr.push(tile.toArray());
    }

    for (let tile of prevTilesArr) {
      switch (direction) {
        case DOWN:
          newTilesArr.push([tile[0], tile[1] + 1]);
          break;
        case RIGHT:
          newTilesArr.push([tile[0] + 1, tile[1]]);
          break;
        case LEFT:
          newTilesArr.push([tile[0] - 1, tile[1]]);
          break;
      }
    }

    let Xs = []; // Used later
    let Ys = []; // Used later

    for (let tile of newTilesArr) {
      Xs.push(tile[0]);
      Ys.push(tile[1]);
      try {
        if (!validCoord(tile) || stackedTiles[tile[0]][tile[1]]) {
          if (direction === DOWN) {
            this.block();
          }
          return false;
        }
      } catch (e) {
        return false;
      }
    }

    this.tiles = [];
    for (let i = 0; i < Xs.length; i++) {
      this.tiles.push(new Tile(Xs[i], Ys[i], this.color));
    }
    return true;
  }

  block() {
    for (let tile of this.tiles) {
      if (stackedTiles[tile.x][tile.y] === 0) {
        stackedTiles[tile.x][tile.y] = tile.color;
      }
    }

    // Clear lines if completed
    for (let i = stackedTiles[0].length - 1; i >= 0; i--) {
      if (isLineCompleted(i)) {
        if (floatingBlocks) {
          // Secret mode. Add "&floatingblocks" (without the qoutes)
          // to the end of the game URL to play it.
          for (let j = 0; j < stackedTiles.length; j++) {
            stackedTiles[j][i] = 0;
          }
        } else {
          // Gravity
          for (let z = i; z >= 0; z--) {
            for (let j = 0; j < stackedTiles.length; j++) {
              if (z === 0) {
                stackedTiles[j][z] = 0; // The first row should be empty after line-clearing
              } else {
                stackedTiles[j][z] = stackedTiles[j][z - 1]; // The previous line goes down to this one
              }
            }
          }

          if (!floatingBlocks) {
            i++; // We check this line again because it's changed (the previous line went down to this one)
          }
        }

        lines++;
        if (lines % 10 === 0 && lines !== 0) {
          currentLevel++;
        }
      }
    }

    // Generating a new piece
    currentPiece = randPiece();
  }

  rotate() {
    // The same return values as applyGravity()
    if (this.rotationState === undefined || this.MAXROTINDX === undefined || this.ROTATIONS === undefined) { // If rotation is not defined for currentPiece
      console.error("ERROR: you must define rotation for " + currentPiece.constructor.name);
      return false;
    } else {
      let NEXTROTSTATE; // const requires initialization
      if (this.MAXROTINDX !== 0) {
        NEXTROTSTATE = (this.rotationState + 1) % this.MAXROTINDX;
      } else {
        // If there's only one rotation state, we do nothing:
        return true;
      }

      let prevTilesArr = [];
      let newTilesArr = [];
      for (let tile of this.tiles) {
        prevTilesArr.push(tile.toArray());
      }

      for (let i = 0; i < prevTilesArr.length; i++) {
        newTilesArr.push([prevTilesArr[i][0] + this.ROTATIONS[NEXTROTSTATE][0][i],
          prevTilesArr[i][1] + this.ROTATIONS[NEXTROTSTATE][1][i]
        ]);
      }

      let Xs = []; // Used later
      let Ys = []; // Used later

      for (let tile of newTilesArr) {
        Xs.push(tile[0]);
        Ys.push(tile[1]);
        try {
          if (!validCoord(tile) || stackedTiles[tile[0]][tile[1]]) {
            return false;
          }
        } catch (e) {
          return false;
        }
      }

      this.tiles = [];
      for (let i = 0; i < Xs.length; i++) {
        this.tiles.push(new Tile(Xs[i], Ys[i], this.color));
      }

      this.rotationState = NEXTROTSTATE;
      return true;
    }
  }
}

class IShaped extends Piece {
  constructor() {
    super(IForm.x, IForm.y, "#00F0F0");

    this.rotationState = 0;
    this.MAXROTINDX = 2;
    this.ROTATIONS = [
      [
        [-2, -1, 0, 1],
        [-2, -1, 0, 1]
      ],
      [
        [2, 1, 0, -1],
        [2, 1, 0, -1]
      ]
    ];

    for (let x of IForm.x) {
      for (let y of IForm.y) {
        if (stackedTiles[x][y] !== 0) {
          this.draw();
          this.stroke();
          handleGameOver();
        }
      }
    }
  }
}

class LShaped extends Piece {
  constructor() {
    super(LForm.x, LForm.y, "#F0A000");

    this.rotationState = 0;
    this.MAXROTINDX = 4;
    this.ROTATIONS = [
      [
        [-1, 0, 1, 0],
        [1, 0, -1, 2]
      ],
      [
        [1, 0, -1, 2],
        [1, 0, -1, 0]
      ],
      [
        [1, 0, -1, 0],
        [-1, 0, 1, -2]
      ],
      [
        [-1, 0, 1, -2],
        [-1, 0, 1, 0]
      ]
    ];

    for (let x of LForm.x) {
      for (let y of LForm.y) {
        if (stackedTiles[x][y] !== 0) {
          this.draw();
          this.stroke();
          handleGameOver();
        }
      }
    }
  }
}

class JShaped extends Piece {
  constructor() {
    super(JForm.x, JForm.y, "#0000F0");

    this.rotationState = 0;
    this.MAXROTINDX = 4;
    this.ROTATIONS = [
      [
        [-1, 0, 1, 2],
        [1, 0, -1, 0]
      ],
      [
        [1, 0, -1, 0],
        [1, 0, -1, -2]
      ],
      [
        [1, 0, -1, -2],
        [-1, 0, 1, 0]
      ],
      [
        [-1, 0, 1, 0],
        [-1, 0, 1, 2]
      ]
    ];

    for (let x of JForm.x) {
      for (let y of JForm.y) {
        if (stackedTiles[x][y] !== 0) {
          this.draw();
          this.stroke();
          handleGameOver();
        }
      }
    }
  }
}

class OShaped extends Piece {
  constructor() {
    super(OForm.x, OForm.y, "#F0F000");

    this.rotationState = 0;
    this.MAXROTINDX = 1;
    this.ROTATIONS = [
      [
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ]
    ];

    for (let x of OForm.x) {
      for (let y of OForm.y) {
        if (stackedTiles[x][y] !== 0) {
          this.draw();
          this.stroke();
          handleGameOver();
        }
      }
    }
  }
}

class ZShaped extends Piece {
  constructor() {
    super(ZForm.x, ZForm.y, "#F00000");

    this.rotationState = 0;
    this.MAXROTINDX = 2;
    this.ROTATIONS = [
      [
        [-2, -1, 0, 1],
        [1, 0, 1, 0]
      ],
      [
        [2, 1, 0, -1],
        [-1, 0, -1, 0]
      ]
    ];

    for (let x of ZForm.x) {
      for (let y of ZForm.y) {
        if (stackedTiles[x][y] !== 0) {
          this.draw();
          this.stroke();
          handleGameOver();
        }
      }
    }
  }
}

class SShaped extends Piece {
  constructor() {
    super(SForm.x, SForm.y, "#00F000");

    this.rotationState = 0;
    this.MAXROTINDX = 2;
    this.ROTATIONS = [
      [
        [-2, 0, -1, 1],
        [0, 0, 1, 1]
      ],
      [
        [2, 0, 1, -1],
        [0, 0, -1, -1]
      ]
    ];

    for (let x of SForm.x) {
      for (let y of SForm.y) {
        if (stackedTiles[x][y] !== 0) {
          this.draw();
          this.stroke();
          handleGameOver();
        }
      }
    }
  }
}

class TShaped extends Piece {
  constructor() {
    super(TForm.x, TForm.y, "#A000F0");

    this.rotationState = 0;
    this.MAXROTINDX = 4;
    this.ROTATIONS = [
      [
        [-1, 0, 1, 1],
        [1, 0, 1, -1]
      ],
      [
        [1, 0, 1, -1],
        [1, 0, -1, -1]
      ],
      [
        [1, 0, -1, -1],
        [-1, 0, -1, 1]
      ],
      [
        [-1, 0, -1, 1],
        [-1, 0, 1, 1]
      ]
    ];

    for (let x of TForm.x) {
      for (let y of TForm.y) {
        if (stackedTiles[x][y] !== 0) {
          this.draw();
          this.stroke();
          handleGameOver();
        }
      }
    }
  }
}

const randPiece = function() { // Without anonymous function it doesn't work due to hoisting and stuff
  let randInt = Math.floor((Math.random() * 7) + 1);
  switch (randInt) {
    case 1:
      return new IShaped();
      break; // It's not necessary in this case...
    case 2:
      return new LShaped();
      break; // It's not necessary in this case...
    case 3:
      return new JShaped();
      break; // It's not necessary in this case...
    case 4:
      return new OShaped();
      break; // It's not necessary in this case...
    case 5:
      return new ZShaped();
      break; // It's not necessary in this case...
    case 6:
      return new SShaped();
      break; // It's not necessary in this case...
    case 7:
      return new TShaped();
      break; // It's not necessary in this case...
  }
}

currentPiece = randPiece();

function draw() {
  if (!gameOver) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Refresh canvas
    currentPiece.draw();
    currentPiece.stroke();
    if (frameCounter % Math.floor(FPS / Math.sqrt(currentLevel)) === 0) {
      currentPiece.applyGravity();
    }

    for (let i = 0; i < stackedTiles.length; i++) {
      for (let j = 0; j < stackedTiles[i].length; j++) {
        if (stackedTiles[i][j] !== 0) {
          let tile = new Tile(i, j, stackedTiles[i][j]);
          tile.draw();
          tile.stroke();
        }
      }
    }

    if (frameCounter === H * FPS) {
      frameCounter = 1;
    } else {
      frameCounter++;
    }
  }
}

function handleGameOver() {
  // Game Over stuff. For testing:
  if (!gameOver) {
    alert(`Game Over! Lines: ${lines}. Initial level: ${initLevel}. Final level: ${currentLevel}. `);
    location.reload();
    gameOver = true;
  }
}

setInterval(draw, 1000 / FPS);
