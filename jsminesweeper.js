// constants
var c = 30;
var xo = 0;
var yo = 0;
var size = {};
var numberofmines = 0;
var timer = 0;
var gametimer = null;
var end = false;
var win = false;

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

// Init
function init() {
    canvas = document.getElementById("jsminesweeper");
    canvas.addEventListener("contextmenu", function(evt) {
        if (evt.button == 2) evt.preventDefault();
    });
    canvas.addEventListener("mousedown", function (evt) {
        var mousePos = getMousePos(canvas, evt);
        var i = Math.floor((mousePos.x - xo)/c);
        var j = Math.floor((mousePos.y - yo)/c);
        console.log(mousePos);
        console.log(i+ " " + j);

        if (i >= 0 && j >= 0) {
            if (gametimer === null && !end) {
                gametimer = setInterval(function () {
                    timer++;
                    win = checkGame();
                    if (win) {
                        end = true;
                    }
                    updateHeader();
                }, 1000);
            }
            var mine = mines[i][j];
            if (evt.button == 2) {
                if (!mine.isDown) {
                    if (numberofmines != 0 || mine.isFlagged)
                      mine.isFlagged = !mine.isFlagged;
                }
            } else {
                click(i, j);
            }

            update();
        } else {
            clearInterval(gametimer);
            numberofmines = 0;
            gametimer = null;
            timer = 0;
            end = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            jsminesweeper(size.w, size.h, size.m);
            console.log(evt);
        }
    }, false);
    ctx = canvas.getContext("2d");
}

function click(x, y) {
    mine = mines[x][y];
    if (!mine.isFlagged) {
        mine.isDown = true;
        if (mine.isMine) {
            end = true;
            updateHeader();
        }
        if (mine.weight == 0) {
            var neighbors = [];
            if (x != 0) neighbors.push(mines[x-1][y]); // top
            if (y != 0) neighbors.push(mines[x][y-1]); // left
            if (x != size.w-1) neighbors.push(mines[x+1][y]); // bottom
            if (y != size.h-1) neighbors.push(mines[x][y+1]); // right
            if (x != 0 && y != size.h-1) neighbors.push(mines[x-1][y+1]); // top right
            if (x != 0 && y != 0) neighbors.push(mines[x-1][y-1]); // top left
            if (x != size.w-1 && y != size.h-1) neighbors.push(mines[x+1][y+1]); // bottom right
            if (x != size.w-1 && y != 0) neighbors.push(mines[x+1][y-1]); // bottom left
            for(m in neighbors) {
                var n = neighbors[m];
                if (!n.isDown && !n.isMine && !n.isFlagged) {
                    click(n.x, n.y);
                    n.isDown = true;
                }
            }
        }
    }
}

// Game
function jsminesweeper(width, height, num) {

    numberofmines = num;

    size.w = width;
    size.h = height;
    size.m = num;

    // draw game
    drawGame(size.w, size.h);
    // mines
    mines = new Array(size.w);
    for (var i = 0; i < size.w; i++) {
        mines[i] = new Array(size.h);
        for (var j = 0; j < size.h; j++) {
            mines[i][j] = new Mine(i, j);
            drawMine(i, j);
        }
    }
    
    // set random mines
    for (var i = 0; i < size.m; i++) {
        var x = Math.floor(Math.random() * size.w);
        var y = Math.floor(Math.random() * size.h);
        if (mines[x][y].isMine) {
            i--;
            continue;
        } else {
            mines[x][y].isMine = true;
            if (x != 0) mines[x-1][y].weight++; // top
            if (y != 0) mines[x][y-1].weight++; // left
            if (x != size.w-1) mines[x+1][y].weight++; // bottom
            if (y != size.h-1) mines[x][y+1].weight++; // right
            if (x != 0 && y != size.h-1) mines[x-1][y+1].weight++; // top right
            if (x != 0 && y != 0) mines[x-1][y-1].weight++; // top left
            if (x != size.w-1 && y != size.h-1) mines[x+1][y+1].weight++; // bottom right
            if (x != size.w-1 && y != 0) mines[x+1][y-1].weight++; // bottom left
        }
    }
}

function update() {
    ctx.clearRect(xo, yo, size.w*c, size.h*c);
    // mines
    for (var i = 0; i < size.w; i++) {
        for (var j = 0; j < size.h; j++) {
            if (end) mines[i][j].isDown = true;
            drawMine(i, j);
        }
    }
}

function updateHeader() {
    if (end) {
        clearInterval(gametimer);
        gametimer = null;
        update();
        if (win) alert("You won!");
        else alert("You lost!");
    }
    ctx.clearRect(xo, yo-(2*c), c*size.w, 2*c);
    header(c*size.w, 2*c);
}

function checkGame() {
    for(var i = 0; i < size.w; i++) {
        for(var j = 0; j < size.h; j++) {
            if (!mines[i][j].isDown && !mines[i][j].isMine) {
                return false;
            }
        }
    }
    return true;
}

function drawGame(width, height) {
    var w = c * width + 20;
    var h = c * height + 2*c + 20;
    ctx.beginPath();
    ctx.fillStyle = "#C0CfC5";
    ctx.rect(0, 0, w, h);
    ctx.fill();
    ctx.closePath();
    xo = 10;
    yo = 2*c+10;
    header(c*width, 2*c);
}

function drawMine(i, j) {
    var mine = mines[i][j];
    var x = c * i + xo;
    var y = c * j + yo;
    ctx.beginPath();
    ctx.fillStyle = "#808080";
    ctx.rect(x, y, c, c);
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    if (mine.isDown) {
        if (mine.isMine)
            ctx.fillStyle = "red";
        else
            ctx.fillStyle = "white";
    } else {
        ctx.fillStyle = "#C0C0C0"
    }
    ctx.rect(x+2, y+2, c-3, c-3);
    ctx.fill();
    ctx.closePath();
    if (mine.isFlagged && !mine.isDown) {
        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.font = "27px monospace";
        ctx.textAlign = "center";
        ctx.fillText("!", x+(c/2), y+c);
        ctx.closePath();
    }
    if (mine.isDown && !mine.isMine) {
        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.font = "27px monospace";
        ctx.textAlign = "center";
        ctx.fillText((mine.weight == 0) ? "": mine.weight, x+(c/2), y+c-5);
        ctx.closePath();
    }
}

function header(width, height) {
    // header
    ctx.beginPath();
    ctx.rect(xo, yo-height, width, height);
    ctx.fillStyle = "#C0CfC5";
    ctx.fill();
    ctx.closePath();

    // mine counter
    ctx.beginPath();
    ctx.rect(xo+10, yo-c-(c/2), 2*c, c);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.font = "27px monospace";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText(numberofmines, xo+c+10, yo-(height/2)+10)
    ctx.closePath();

    // start button
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.rect(xo+(width/2)-(c/2), yo-(height/2)-(c/2), c, c);
    ctx.fill();
    ctx.fillStyle = "red";
    ctx.font = "27px sans";
    ctx.textAlign = "center";
    ctx.fillText((end && !win) ? String.fromCharCode("9785"): String.fromCharCode("9786"), xo+(width/2), yo-(height/2)+10);
    ctx.closePath();

    // timer
    ctx.beginPath();
    ctx.rect(xo-10+width-(c*2), yo-c-(c/2), 2*c, c);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.font = "27px monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "red";
    ctx.fillText(timer,xo+width-(2*c)+20, yo-(c/2)-5)
    ctx.closePath();
}

// mine object
class Mine {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.isDown = false;
        this.isMine = false;
        this.isDown = false;
        //this.isFlagged = false;
        this.weight = 0;
    }
    get x() { return this._x; }
    set x(value) { this._x = value; }
    get y() { return this._y; }
    set y(value) { this._y = value; }
    get weight() { return this._weight; }
    set weight(value) { this._weight = value; }
    get isDown() { return this._isDown; }
    set isDown(value) {
        this._isDown = value;
        if (this.isMine) {
            end = true;
        }
    }
    get isMine() { return this._isMine; }
    set isMine(value) { this._isMine = value; }
    get isFlagged() { return this._isFlagged; }
    set isFlagged(value) {
        this._isFlagged = value;
        if (value)
            numberofmines = (numberofmines <= 0) ? 0: numberofmines - 1;
        else
            numberofmines++;
        updateHeader();
    }
}