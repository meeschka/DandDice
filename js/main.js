
//store the rules for each level in an object, as array values, in the following format for each vault:
// {level: int, 'vault-die': str, 'player-die': str, odds: val, trap: int, terms: {difficulty: str, lower-bound: str, overshoot: str, split: bool}}
let rules = {
    vaults:
        [
            {level: 1, 'vault-die': [8], 'player-die': [6, 6], odds: 1, trap: 9, split: false},
            {level: 2, 'vault-die': [10], 'player-die': [6, 6], odds: 2, trap: 11, split: false},
            {level: 3, 'vault-die': [12], 'player-die': [6, 6], odds: 3, trap: 21, split: false},
            {level: 4, 'vault-die': [20], 'player-die': [6, 6], odds: 5, trap: 21, split: false},
            {level: 5, 'vault-die': [20], 'player-die': [6, 6, 4], odds: 4, trap: 21, split: false},
            {difficulty: 'Vault Number', 'lower-bound': 'Mimic', overshoot: 'Trap', enemy: 'Vault'}
        ],
    pickpocket: [
        {level: 1, 'vault-die': '1d10', 'player-die': '2d6', odds: 2, trap: 11, split: true },
        {difficulty: 'Pocket', 'lower-bound': 'Kick', overshoot: 'Sword', enemy: 'Mark'}
    ]

    //put strings in different array
}
///GLOBAL VARIABLES
let gameState = {
    game: 'vaults',
    winner: 'null',
    turn: -1,
    level: 1,
    wager: 0,
    houseRoll: null,
    playerRoll: null,
    gameOn: false
}

//Element Selectors
const $flowBtn = $('#flow-btn');
const $wagerInput = $('.wager');
const $wager = $('#current-wager');

$(function(){
    //Event listeners
    $flowBtn.on('click', function(){
        gameState.gameOn ? initGame() : startGame();
    });

    function initGame(){
        gameState = {
            game: 'vaults',
            winner: 'null',
            roundWinner:'null',
            turn: -1,
            level: 1,
            wager: 0,
            houseRoll: null,
            playerRoll: null,
            gameOn: false
        }
        $flowBtn.html('Start Game');
        $wagerInput.css('display', '');
        $wager.html('');
    }

    function startGame(){
        gameState.wager = $wagerInput.val() || '0';
        gameState.gameOn = true;
        $flowBtn.html('Reset');
        $wagerInput.css('display', 'none');
        $wager.html(`Your current wager is ${gameState.wager} gold`);
        startRound();
    }
    function startRound(){
        //rolls house dice
        gameState.houseRoll = rollDice(rules.vaults[gameState.level-1]['vault-die']);
        if (gameState.houseRoll === 1) {
            gameState.Winner= 'The House';
            return;
        }

        
        //wager is updated with value in the wager box
        //house rolls dice based on the value given in rules.vaults[gameState.level-1].['vault-die'];
        //updates message based on roll
            //if 1, mimic, player loses immediately
    }
    function playerSetup(){
        //sets up dice to be rolled based on rules.vaults[gameState.level-1].['player-die'];
        //adds button to screen for player to roll dice
    }
    function rollDice(diceArr){
        let rollArr = diceArr.map(rollSingleDie);
        return rollArr.reduce((val, acc)=>val+acc, 0);
    }
    function rollSingleDie(diceSides){
        return Math.floor(Math.random()*diceSides)+1;
    }
    function playerRolls(){
        //calls dice js to roll die
        //call round results
    }
    function newRound(){
        //reset roundwinner
        //update wager based on previous winnings
        //if finished vault 4, declare final winner
    }
    function render(){
        //at the end of each roll, render results
    }



//These plugin to the dice.js file, and are based on the main.js file from Narbakov
    initGame();
    console.log(rollDice([6]));
    console.log(rollDice([8]));
    console.log(rollDice([12]));
})