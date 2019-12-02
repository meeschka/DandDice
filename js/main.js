
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
    Roll: null,
    playerRoll: null,
    gameOn: false,
    diceToRoll: '3d6+1d4'
}

//Element Selectors
const $flowBtn = $('#flow-btn');
const $crowbarBtn = $('#crowbar-btn');
const $rollBtn = $('#roll-btn');
const $endBtn = $('#end-btn');
const $nextRndBtn = $('#next-rnd');

const $wagerInput = $('.wager');
const $wager = $('#current-wager');
const $vaultPic = $('.vault-pic img');

$(function(){
    //Event listeners
    $flowBtn.on('click', function(){
        gameState.gameOn ? initGame() : startGame();
    });
    $rollBtn.on('click', playerRolls);
    $nextRndBtn.on('click', nextRound);
    $endBtn.on('click', endGame);


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
            gameOn: false,
            rolledDoubles: false
        }
        $rollBtn.css('display', 'none');
        $crowbarBtn.css('display', 'none');
        $flowBtn.html('Start Game');
        $wagerInput.css('display', '');
        $wager.html('');
        $nextRndBtn.css('display', 'none');
        $endBtn.css('display', 'none');
    }

    function startGame(){
        gameState.wager = parseInt($wagerInput.val()) || 0;
        gameState.gameOn = true;
        $flowBtn.html('Reset');
        $wagerInput.css('display', 'none');
        $wager.html(`Your current wager is ${gameState.wager} gold`);
        startRound();
    }
    function startRound(){
        //
        roundStartRender();
        //rolls house dice
        gameState.houseRoll = rollDice(rules.vaults[gameState.level-1]['vault-die']);
        //if house rolls a 1, player loses automatically
        if (gameState.houseRoll === 1) {
            gameState.Winner= 'The House';
            return;
        }
        console.log(gameState.houseRoll);
        //update message showing the house roll
        playerSetup();

    }
    function playerSetup(){
        //display 'roll' button for player
        $rollBtn.css('display', '');
        if (gameState.level === 4) {
            //add button for crowbar option, which calls crowBarOption() when clicked
            $crowbarBtn.css('display', '');
        }
    }
    function rollDice(diceArr){
        let rollArr = diceArr.map(rollSingleDie);
        if (rollArr.length > 1 && rollArr[0] === rollArr[1]){
            gameState.rolledDoubles = true;
        }
        return rollArr.reduce((val, acc)=>val+acc, 0);
    }
    function rollSingleDie(diceSides){
        return Math.floor(Math.random()*diceSides)+1;
    }
    function playerRolls(){
        gameState.playerRoll = rollDice(rules.vaults[gameState.level-1]['player-die']);
        console.log('player rolled a '+gameState.playerRoll);
        endRound();
    }
    function endRound(){
        //check if player rolled doubles

        //generic win condition
        if (gameState.playerRoll >= gameState.houseRoll && gameState.playerRoll < rules.vaults[gameState.level-1].trap){
            console.log('player won the round!');
            $vaultPic.attr('src', 'resources/vault-open.png');
            gameState.wager=gameState.wager+gameState.wager*rules.vaults[gameState.level-1].odds;
            console.log(`Gold on the table is now ${gameState.wager}`);
            if (gameState.level <=3) {
                console.log('would you like to move on to the next vault?')
                $nextRndBtn.css('display', '');
                $endBtn.css('display', '');
            } else {
                gameWinner = 'Player';
                console.log('you won!');
                //end game logic
            }

        } else {
            console.log(`The house wins!`);
        }

    }
    function endGame(){
        console.log('Game Ended!');
        initGame();
    }
    function nextRound(){
        gameState.level+=1;
        startRound();
    }

    function crowbarOption(){
        //if player choses to go with crowbar, update level from level 4 to level 5

    }
    function newRound(){
        //reset roundwinner
        //update wager based on previous winnings
        //if finished vault 4, declare final winner
    }
    function render(){
        //at the end of each roll, render results
    }
    function gameStartRender(){
        
    }
    function roundStartRender(){
        $vaultPic.attr('src', 'resources/vault-closed.png');
        $wager.html(`Your current wager is ${gameState.wager} gold`);
        $nextRndBtn.css('display', 'none');
        $endBtn.css('display', 'none');
    }
    function roundEndRender(){
        
    }


/*****   THIS CODE IS MODIFIED FROM NATAROV, http://www.teall.info/2014/01/online-3d-dice-roller.html   **** */

    const canvas = $t.id('canvas');
    let label = $t.id('label'); //shows the result of the roll
    let set = $t.id('set'); //text input for dice numbers
    let selector_div = $t.id('selector_div'); //contains set, clear, throw, and help
    let info_div = $t.id('info_div'); //div that displays during/after dice roll

    $t.dice.use_true_random = false;
    var params = {};

    //make new canvas element, assign dice and dice box classes
    var box = new $t.dice.dice_box(canvas, { w: 500, h: 600 });
    box.animate_selector = false;

    function before_roll(vectors, notation, callback) {
        // change styles to reflect that rolling is happening


        // do here rpc call or whatever to get your own result of throw.
        // then callback with array of your result, example:
        // callback([2, 2, 2, 2]); // for 4d6 where all dice values are 2.
        callback();
    }

    function notation_getter() {
        return $t.dice.parse_notation(gameState.diceToRoll);
    }

    function after_roll(notation, result) {
        console.log(notation);
        if (params.chromakey || params.noresult) return;
        var res = result.join(' ');
        if (notation.constant) {
            if (notation.constant > 0) res += ' +' + notation.constant;
            else res += ' -' + Math.abs(notation.constant);
        }
        if (result.length > 1) res += ' = ' + 
                (result.reduce(function(s, a) { return s + a; }) + notation.constant);
        label.innerHTML = res;
        info_div.style.display = 'inline-block';

        //use dice result here
    }
    box.bind_throw($t.id('throw'), notation_getter, before_roll, after_roll);

    if (params.notation) {
        set.value = params.notation;
    }
    if (params.roll) {
        $t.raise_event($t.id('throw'), 'mouseup');
    }
    else {
        show_selector();
    }



    initGame();
})