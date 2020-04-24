import { Game } from './gameEngine';
let gameBrain: Game;
let game = document.querySelector('#game')!;
let gameButtons: NodeListOf<HTMLAnchorElement> = game.querySelectorAll('.js-cell');
let startButton = game.querySelector(".intro .settings button")
const gameScreen = (document.querySelector(".game-content")! as HTMLElement)
const introScreen = document.querySelector(".intro")!;
let newGameButton = (game.querySelector(".new-game button") as HTMLElement);

newGameButton.onclick = seeIntroPage;
(startButton as HTMLElement).onclick = newGame;

function seeIntroPage(){
    gameScreen.classList.remove('fadeIn');
    introScreen.classList.add('fadeIn');
}

function newGame() {
    let playerOneName, playerTwoName, gameMode: string, startingPlayer;
    let text: string;

    let radioButtons1 = document.getElementsByName('gameMode');

    // Get player names
    playerOneName = (document.getElementById("player1-name") as HTMLInputElement).value;
    playerTwoName = (document.getElementById("player2-name") as HTMLInputElement).value;

    //Check if both names excist
    var playerNamesExcist = false;
    if (playerOneName === "" || playerTwoName === "") {
        text = "Players name is missing"
    } else {
        playerNamesExcist = true;
    }

    //Get game mode
    for(let i = 0; i < radioButtons1.length; i++) {
        let radioButton = radioButtons1[i] as HTMLInputElement;
        if(radioButton.checked){
            gameMode = radioButton.value;
            break;
        }  
    }

    //Get player who starts first
    let radioButtons2 = document.getElementsByName('startingPlayer');

    for(let i = 0; i < radioButtons2.length; i++) {
        let radioButton = (radioButtons2[i] as HTMLInputElement);
        if(radioButton.checked){
            startingPlayer = radioButton.value;
            break;
        }  
    }

    //Check if all settings are there
    if(playerNamesExcist){

        let playerOneMoves = false;
        if (startingPlayer === "playerOne"){
            playerOneMoves = true;
        }

        //start the game
        gameBrain = new Game(playerOneMoves, playerOneName, playerTwoName, gameMode!);
        gameBrain.initializeNewGame();

        //reset the gameBoard colors
        for (const button of gameButtons) {
            button.style.backgroundColor = "";
        }

        //fade into the game board screen
        introScreen.classList.remove("fadeIn");
        introScreen.classList.add("fadeOut");
        gameScreen.classList.add("fadeIn");

        updateScores();
        updateInstructions();

        if (gameMode! === "humanVsComputer" && !playerOneMoves){
            setTimeout(displayComputerDrop, 500);
        }
        if (gameMode! === "computerVsComputer"){
            playCompVsComp();
        }
    } else {
        document.getElementById("validation")!.innerHTML = text!;
    }
}


for (const button of gameButtons) {
    button.onclick = buttonPressed;
}


var chosenToken: HTMLAnchorElement;
var waiting = false;

function updateScores(){
    const playerOneName = document.querySelector("#player1-score div")!;
    const playerTwoName = document.querySelector("#player2-score div")!;

    playerOneName.innerHTML = gameBrain.playerOneName + " tokens";
    playerTwoName.innerHTML = gameBrain.playerTwoName + " tokens";

    const playerOneScore = document.querySelector("#player1-score p")!;
    const playerTwoScore = document.querySelector("#player2-score p")!;

    playerOneScore.innerHTML = (gameBrain.playerOneTokens).toString();
    playerTwoScore.innerHTML = (gameBrain.playerTwoTokens).toString();
}

function updateInstructions(){
    const playerTurn = document.querySelector(".players-turn")!;
    const instruction = document.querySelector(".explanation")!;

    if (gameBrain.playerOneMoves) {
        playerTurn.innerHTML = gameBrain.playerOneName;
    } else {
        playerTurn.innerHTML = gameBrain.playerTwoName;
    }

    let text;
    if (gameBrain.gamePhase === "drop"){
        text = "place your token on the board";
    } else if (gameBrain.gamePhase === "move"){
        text = "select your token and a empty cell to move";
    } else {
        text = "remove one of your opponents tokens";
    }
    instruction.innerHTML = text;
}

function setButtonColor(button: HTMLAnchorElement){
    let y: number = Number(button.dataset.y);
    let x: number = Number(button.dataset.x);
    if (gameBrain.gameBoard[y][x] == "1"){
        button.style.backgroundColor = "orange";
    } else if (gameBrain.gameBoard[y][x] == "2"){
        button.style.backgroundColor = "red";
    }
}

function playCompVsComp(){
    //drop phase
    gameScreen.style.pointerEvents = 'none';
    let timeOut = 1000;
    if (gameBrain.gamePhase === "drop"){
        for (let i = 0; i < 24; i++){
            setTimeout(displayComputerDrop, timeOut)
            timeOut += 1000;
    }
    setTimeout(function(){
        compVsCompMove();
    }, 22000)
}
}

function compVsCompMove(){
    //move phase
    setTimeout(function(){
        if (gameBrain.isWinning()){
            displayWinning();
        } else {
            displayComputerMove();
            compVsCompMove();
        }
    }, 2900)
}

function displayComputerMove(){
    let tokenCellCoords = gameBrain.computerMove();
    let tokenY = tokenCellCoords[0][0];
    let tokenX = tokenCellCoords[0][1];
    let cellY = tokenCellCoords[1][0];
    let cellX = tokenCellCoords[1][1];

    let chosenTokenBtn: HTMLAnchorElement;
    for (const button of gameButtons) {
        if (Number(button.dataset.y) === tokenY
         && Number(button.dataset.x) === tokenX){
            chosenTokenBtn = button;
            button.style.border = "3px dashed white";
            break;
        }
    }
    setTimeout(function(){
        for (const button of gameButtons) {
            if (Number(button.dataset.y) === cellY 
            && Number(button.dataset.x) === cellX){
                setButtonColor(button);
                chosenTokenBtn.style.backgroundColor = "";
                chosenTokenBtn.style.border = "";
                updateInstructions();
                break;
            }  
        }
        if (gameBrain.gamePhase === "remove"){
            setTimeout(displayComputerRemove, 1000);
        } else if (gameBrain.gameMode !== "computerVsComputer"){
            gameScreen.style.pointerEvents = 'all';
        }
    }, 700)
}

function displayComputerRemove(){
    gameScreen.style.pointerEvents = 'none';
    let enemyToken = gameBrain.computerRemove();
    for (const button of gameButtons) {
        if (Number(button.dataset.y) == enemyToken[0] 
        && Number(button.dataset.x) == enemyToken[1]){
            button.style.backgroundColor = "";
            break;
        }}
    updateScores();
    if (gameBrain.isWinning() == true){
        displayWinning();
    } else {
        updateInstructions();
        if (gameBrain.gameMode !== "computerVsComputer"){
            gameScreen.style.pointerEvents = 'all';
        }
    }  
}

function displayComputerDrop(){
    let tokenCoord = gameBrain.computerDrop();
    for (const button of gameButtons) {
        if (Number(button.dataset.y) === tokenCoord[0] 
        && Number(button.dataset.x) === tokenCoord[1]){
            setButtonColor(button);
            break;
        }
    }
    updateScores();
    updateInstructions();
    if (gameBrain.gameMode !== "computerVsComputer"){
        gameScreen.style.pointerEvents = 'all';
    }
}

function displayWinning() {
    gameScreen.style.pointerEvents = 'none';
    newGameButton.style.pointerEvents = 'all';
    const playerTurn = document.querySelector(".players-turn")!;
    const instruction = document.querySelector(".explanation")!;
    playerTurn.innerHTML = " ";

    if (gameBrain.playerOneMoves) {
        playerTurn.innerHTML = gameBrain.playerTwoName;
    } else {
        playerTurn.innerHTML = gameBrain.playerOneName;
    }

    instruction.innerHTML = "has won!";
}

function buttonPressed(this: GlobalEventHandlers){
    if (this instanceof HTMLAnchorElement){
        //drop phase
        if (gameBrain.gamePhase === "drop") {
            let buttonY = Number(this.dataset.y)!;
            let buttonX = Number(this.dataset.x)!;
            
            gameBrain.drop(buttonY, buttonX);
            setButtonColor(this);
            
            if(gameBrain.gameMode === "humanVsComputer" 
            && !gameBrain.playerOneMoves 
            && gameBrain.gamePhase === "drop"){
                gameScreen.style.pointerEvents = 'none';
                setTimeout(displayComputerDrop, 700);
            }

            //move phase
        } else if (gameBrain.gamePhase === "move"){
            if (waiting) {
                const chosenCell = this!;
                let cellY = Number(chosenCell.dataset.y)!;
                let cellX = Number(chosenCell.dataset.x)!;
                let tokenY = Number(chosenToken.dataset.y)!;
                let tokenX = Number(chosenToken.dataset.x)!;
            
            
                if (gameBrain.isLegalMove(tokenY, tokenX, cellY, cellX)){
                    if (gameBrain.move(tokenY, tokenX, cellY, cellX)) {
                        setButtonColor(this);
                        chosenToken.style.backgroundColor = "";
                        chosenToken.style.border = "";
                    } else {
                        chosenToken.style.border = "";
                    }
                } else {
                    chosenToken.style.border = "";
                }
                waiting = false;
            } else {
                chosenToken = this;
                let y: number = Number(chosenToken.dataset.y)!;
                let x: number = Number(chosenToken.dataset.x);
                if (gameBrain.gameBoard[y][x] === gameBrain.findCurrentToken()) {
                    this.style.border = "3px dashed white";
                    waiting = true;
                }
            }
            // remove phase
        } else if (gameBrain.gamePhase === "remove") {
            let tokenX = Number(this.dataset.x);
            let tokenY = Number(this.dataset.y);
            
            if (!(gameBrain.gameBoard[tokenY][tokenX] == "" ||
            gameBrain.gameBoard[tokenY][tokenX] == gameBrain.findCurrentToken())){
                gameBrain.removeEnemyToken(tokenY, tokenX);
                
                this.style.backgroundColor = "";
            }
            
            if (gameBrain.isWinning()) {
                updateScores();
                displayWinning();
                return;
            }
        }
        updateScores();
        updateInstructions();  
        if(gameBrain.gameMode === "humanVsComputer" && !gameBrain.playerOneMoves
        && gameBrain.gamePhase === "move"){
            gameScreen.style.pointerEvents = 'none';
            setTimeout(displayComputerMove, 1500);
        } 
    }
} 

