"use strict";
exports.__esModule = true;
var Game = /** @class */ (function () {
    function Game(playerOneMoves, playerOneName, playerTwoName, gameMode) {
        this.gamePhase = "drop";
        this.playerOneTokens = 0;
        this.playerTwoTokens = 0;
        this.playerOneMoves = playerOneMoves;
        this.playerOneName = playerOneName;
        this.playerTwoName = playerTwoName;
        this.gameMode = gameMode;
        this.gameBoard = [];
    }
    Game.prototype.initializeNewGame = function () {
        for (var i = 0; i < 6; i++) {
            var row = [];
            for (var j = 0; j < 7; j++) {
                row.push("");
            }
            this.gameBoard.push(row);
        }
    };
    Game.prototype.findCurrentToken = function () {
        var currentToken;
        if (this.playerOneMoves) {
            currentToken = "1";
        }
        else {
            currentToken = "2";
        }
        return currentToken;
    };
    Game.prototype.drop = function (y, x) {
        if (this.gameBoard[y][x] != "") {
            return;
        }
        var currentToken = this.findCurrentToken();
        this.gameBoard[y][x] = currentToken;
        if (this.threeOrFourInARow(y, x) >= 3) {
            this.gameBoard[y][x] = "";
            return;
        }
        this.addPoints();
        this.playerOneMoves = !this.playerOneMoves;
        this.isMovePhase();
        return;
    };
    Game.prototype.move = function (tokenY, tokenX, cellY, cellX) {
        var playersToken = this.gameBoard[tokenY][tokenX];
        this.gameBoard[tokenY][tokenX] = "";
        this.gameBoard[cellY][cellX] = playersToken;
        var tokensInARow = this.threeOrFourInARow(cellY, cellX);
        if (tokensInARow > 3) {
            this.gameBoard[tokenY][tokenX] = playersToken;
            this.gameBoard[cellY][cellX] = "";
            return false;
        }
        else if (tokensInARow == 3) {
            this.gamePhase = "remove";
        }
        else {
            this.playerOneMoves = !this.playerOneMoves;
        }
        return true;
    };
    Game.prototype.threeOrFourInARow = function (y, x) {
        var token = this.findCurrentToken();
        var verticalCount = 0;
        //checking vertically
        for (var i = y - 3; i < y + 4; i++) {
            if (i > -1 && i < 5) {
                if (this.gameBoard[i][x] == token) {
                    verticalCount += 1;
                }
                else {
                    if (verticalCount >= 3) {
                        break;
                    }
                    verticalCount = 0;
                }
            }
        }
        var horizontalCount = 0;
        //checking horiontally
        for (var j = x - 3; j < x + 4; j++) {
            if (j > -1 && j < 6) {
                if (this.gameBoard[y][j] === token) {
                    horizontalCount += 1;
                }
                else {
                    if (horizontalCount >= 3) {
                        break;
                    }
                    horizontalCount = 0;
                }
            }
        }
        return Math.max(verticalCount, horizontalCount);
    };
    Game.prototype.removeEnemyToken = function (y, x) {
        this.gameBoard[y][x] = "";
        this.reduceOpponentsPoints();
        this.playerOneMoves = !this.playerOneMoves;
        this.gamePhase = "move";
    };
    Game.prototype.isWinning = function () {
        if (this.playerOneTokens == 2 || this.playerTwoTokens == 2) {
            return true;
        }
        return false;
    };
    Game.prototype.isLegalMove = function (oldY, oldX, newY, newX) {
        if ((newY == oldY + 1 && newX == oldX
            || newY == oldY - 1 && newX == oldX
            || newY == oldY && newX == oldX + 1
            || newY == oldY && newX == oldX - 1)
            && this.gameBoard[newY][newX] === "") {
            return true;
        }
        return false;
    };
    Game.prototype.reduceOpponentsPoints = function () {
        if (this.playerOneMoves) {
            this.playerTwoTokens -= 1;
        }
        else {
            this.playerOneTokens -= 1;
        }
    };
    Game.prototype.addPoints = function () {
        if (this.playerOneMoves) {
            this.playerOneTokens += 1;
        }
        else {
            this.playerTwoTokens += 1;
        }
    };
    Game.prototype.computerDrop = function () {
        var x;
        var y;
        var token = this.findCurrentToken();
        var done = false;
        while (done === false) {
            y = Math.floor(Math.random() * 5);
            x = Math.floor(Math.random() * 6);
            if (this.gameBoard[y][x] === "") {
                this.gameBoard[y][x] = token;
                if (this.threeOrFourInARow(y, x) < 3) {
                    done = true;
                }
                else {
                    this.gameBoard[y][x] = "";
                }
            }
        }
        this.addPoints();
        this.playerOneMoves = !this.playerOneMoves;
        this.isMovePhase();
        return [y, x];
    };
    Game.prototype.isMovePhase = function () {
        if (this.playerOneTokens == 12 && this.playerTwoTokens == 12) {
            this.gamePhase = "move";
        }
    };
    Game.prototype.computerMove = function () {
        var possibleCellArr = [];
        var token = this.findCurrentToken();
        var options;
        for (var i = 0; i < 5; i++) {
            for (var j = 0; j < 6; j++) {
                if (this.gameBoard[i][j] === token) {
                    if (j != 0 && this.gameBoard[i][j - 1] === "") {
                        options = this.checkNaberCell(i, j, i, j - 1);
                        if (typeof options[1] != 'undefined') {
                            this.gamePhase = "remove";
                            return [[i, j], options[1]];
                        }
                        if (typeof options[0] != 'undefined') {
                            possibleCellArr.push([[i, j], options[0]]);
                        }
                    }
                    if (i != 4 && this.gameBoard[i + 1][j] === "") {
                        options = this.checkNaberCell(i, j, i + 1, j);
                        if (typeof options[1] != 'undefined') {
                            this.gamePhase = "remove";
                            return [[i, j], options[1]];
                        }
                        if (typeof options[0] != 'undefined') {
                            possibleCellArr.push([[i, j], options[0]]);
                        }
                    }
                    if (j != 5 && this.gameBoard[i][j + 1] === "") {
                        options = this.checkNaberCell(i, j, i, j + 1);
                        if (typeof options[1] != 'undefined') {
                            this.gamePhase = "remove";
                            return [[i, j], options[1]];
                        }
                        if (typeof options[0] != 'undefined') {
                            possibleCellArr.push([[i, j], options[0]]);
                        }
                    }
                    if (i != 0 && this.gameBoard[i - 1][j] === "") {
                        options = this.checkNaberCell(i, j, i - 1, j);
                        if (typeof options[1] != 'undefined') {
                            this.gamePhase = "remove";
                            return [[i, j], options[1]];
                        }
                        if (typeof options[0] != 'undefined') {
                            possibleCellArr.push([[i, j], options[0]]);
                        }
                    }
                }
            }
        }
        var randomNumber = Math.floor(Math.random() * possibleCellArr.length);
        var tokenCoord = possibleCellArr[randomNumber][0];
        var cellCoord = possibleCellArr[randomNumber][1];
        this.gameBoard[tokenCoord[0]][tokenCoord[1]] = "";
        this.gameBoard[cellCoord[0]][cellCoord[1]] = token;
        this.playerOneMoves = !this.playerOneMoves;
        return [tokenCoord, cellCoord];
    };
    Game.prototype.checkNaberCell = function (oldY, oldX, newY, newX) {
        var possibleCellCoord;
        var cellCoord;
        var token = this.findCurrentToken();
        this.gameBoard[oldY][oldX] = "";
        this.gameBoard[newY][newX] = token;
        var tokensInRow = this.threeOrFourInARow(newY, newX);
        if (tokensInRow == 3) {
            cellCoord = [newY, newX];
        }
        else {
            if (tokensInRow < 3) {
                possibleCellCoord = [newY, newX];
            }
            this.gameBoard[newY][newX] = "";
            this.gameBoard[oldY][oldX] = token;
        }
        return [possibleCellCoord, cellCoord];
    };
    Game.prototype.computerRemove = function () {
        var enemyToken;
        if (this.playerOneMoves) {
            enemyToken = "2";
        }
        else {
            enemyToken = "1";
        }
        var enemyTokenVer = [];
        var verticalCount = 0;
        //checking vertically for two or three enemy tokens in a row
        for (var i = 0; i < 6; i++) {
            for (var j = 0; j < 5; j++) {
                if (this.gameBoard[j][i] == enemyToken) {
                    verticalCount += 1;
                    enemyTokenVer = [j, i];
                }
                else {
                    if (verticalCount >= 2) {
                        break;
                    }
                    verticalCount = 0;
                }
            }
            if (verticalCount >= 2) {
                break;
            }
        }
        var horizontalCount = 0;
        var enemyTokenHor = [];
        if (verticalCount != 3) {
            //checking horizontally for two or three enemy tokens in a row
            for (var i = 0; i < 5; i++) {
                for (var j = 0; j < 6; j++) {
                    if (this.gameBoard[i][j] == enemyToken) {
                        horizontalCount += 1;
                        enemyTokenHor = [i, j];
                    }
                    else {
                        if (horizontalCount >= 2) {
                            break;
                        }
                        horizontalCount = 0;
                    }
                }
                if (horizontalCount >= 2) {
                    break;
                }
            }
        }
        this.gamePhase = "move";
        this.reduceOpponentsPoints();
        this.playerOneMoves = !this.playerOneMoves;
        if (verticalCount > horizontalCount) {
            this.gameBoard[enemyTokenVer[0]][enemyTokenVer[1]] = "";
            return enemyTokenVer;
        }
        else {
            this.gameBoard[enemyTokenHor[0]][enemyTokenHor[1]] = "";
            return enemyTokenHor;
        }
    };
    return Game;
}());
exports.Game = Game;
