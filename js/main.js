
//store the rules for each level in an object, as array values, in the following format for each vault:
// {level: int, 'vault-die': str, 'player-die': str, odds: val, trap: int, terms: {difficulty: str, lower-bound: str, overshoot: str, split: bool}}
let rules = {
    vaults:
        [   
            {difficultyNum: 'Vault Number', lowerBound: 'was a Mimic', overshoot: 'activated the trap', enemy: 'Vault', doubles: 'trapdoor'},
            {level: 1, 'vault-die': '1d8', 'player-die': '2d6', odds: 1, trap: 9, split: false},
            {level: 2, 'vault-die': '1d10', 'player-die': '2d6', odds: 2, trap: 11, split: false},
            {level: 3, 'vault-die': '1d12', 'player-die': '2d6', odds: 3, trap: 21, split: false},
            {level: 4, 'vault-die': '1d20', 'player-die': '2d6', odds: 5, trap: 21, split: false},
            {level: 5, 'vault-die': '1d20', 'player-die': '2d6+1d4', odds: 4, trap: 21, split: false},
            
        ],
    pickpocket: [
        {level: 1, 'vault-die': '1d10', 'player-die': '2d6', odds: 2, trap: 11, split: true },
        {difficultyNum: 'Pocket', lowerBound: 'Kicked You', overshoot: 'were cut by the sword', enemy: 'Mark'}
    ]

    //put strings in different array
}
///GLOBAL VARIABLES
let gameState = {}

//Element Selectors
const $flowBtn = $('#flow-btn');
const $crowbarBtn = $('#crowbar-btn');
const $nextRndBtn = $('#next-rnd');
const $throwBtn = $('#throw');
const $wagerInput = $('.wager');
const $wager = $('#wager-message');
const $vaultPic = $('.vault-pic img');
const $messageEl = $('.message');
const $rulesBtn = $('#rules-btn');
const $rulesModal = $('#rules-modal');
const $closeModal = $('.close');

$(function(){
    //Event listeners
    $flowBtn.on('click', function(){
        gameState.gameOn ? initGame() : startGame();
    });
    $nextRndBtn.on('click', nextRound);
    $crowbarBtn.on('click', crowbarOption);
    $rulesBtn.on('click', gameRules);
    $closeModal.on('click', closeRules);

    //game
    function initGame(){
        console.log('init game called');
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
            rolledDoubles: false,
            diceToRoll: '1d8',
            demoMode: true,
            demoNum: -1
        }
        $throwBtn.css('display', 'none');
        $crowbarBtn.css('display', 'none');
        $flowBtn.html('Start New Game');
        $wagerInput.css('display', '');
        $wagerInput.html('');
        $wager.css('display', 'none');
        $nextRndBtn.css('display', 'none');
        $messageEl.html('Enter a wager and start the game!')
    }

    function startGame(){
        gameState.gameOn = true;
        $flowBtn.html('Reset');
        $wager.css('display', 'none')
        $wagerInput.css('display', 'none');
        gameState.wager = parseInt($wagerInput.val())?parseInt($wagerInput.val()) : 0;
        startRound();
    }
    function startRound(){
        roundStartRender();
        gameState.houseRoll = null;
        gameState.playerRoll = null;
        gameState.rolledDoubles = false;
        gameState.diceToRoll = rules.vaults[gameState.level]['vault-die'];
    }
    function playerSetup(){
        afterHouseRender();
        //display 'roll' button for player
        gameState.diceToRoll = rules.vaults[gameState.level]['player-die'];
        $throwBtn.css('display', '');
        $throwBtn.html(`<i class="las la-dice"></i>Roll!`);
    }
    
    function nextRound(){
        gameState.level+=1;
        startRound();
    }
    function endTurn(){
        gameState.turn*=-1;
        checkWinner();
    }
    function checkWinner(){
        if (gameState.houseRoll === 1){
            houseWins();
        } else if (gameState.playerRoll) {
            if (gameState.rolledDoubles) {
                rolledDoubles();
            } else if (gameState.playerRoll >= gameState.houseRoll && gameState.playerRoll < rules.vaults[gameState.level].trap){
                playerWinsRound();
            } else houseWins();
        } else playerSetup();
    }

    function  houseWins(){
        if (gameState.houseRoll === 1) {
            $messageEl.html(`The ${rules.vaults[0].enemy} ${rules.vaults[0].lowerBound}! You lose.`);
        } else if (gameState.houseRoll > gameState.playerRoll) {
            $messageEl.html(`You only rolled a ${gameState.playerRoll}, the ${rules.vaults[0].difficultyNum} was ${gameState.houseRoll}. You lose.`);
        } else $messageEl.html(`You rolled above the ${rules.vaults[0].difficultyNum} of ${gameState.houseRoll} and ${rules.vaults[0].overshoot}. You lose.`);
        gameEndRender();
    }
    function playerWinsRound(){
        $throwBtn.css('display', 'none');
        $flowBtn.css('display', 'none');
        $vaultPic.attr('src', 'resources/vault-open.png');
        gameState.wager=gameState.wager+gameState.wager*rules.vaults[gameState.level].odds;
        optionToContinue();
    }
    function rolledDoubles(){
        $messageEl.html(`You found the ${rules.vaults[0].doubles} by rolling doubles! You do not win anything this round, but you automatically proceed to the next ${rules.vaults[0].enemy}`);
        if (gameState.level >3) {gameState.level = 3};
        $nextRndBtn.css('display', '');
    }
    function optionToContinue(){
        if (gameState.level <=3) {
            $messageEl.html(`You won the round with a ${gameState.playerRoll}, which is higher than the ${rules.vaults[0].difficultyNum} of ${gameState.houseRoll}! Would you like to move on to the next vault?`);
            $wager.html(`Your current wager is ${gameState.wager} gold! The odds for the next round are ${rules.vaults[gameState.level+1].odds}:1`);
            $nextRndBtn.css('display', '');
        } else {
            $messageEl.html(`You won the game! Your initial wager has become ${gameState.wager}`);
            gameEndRender();
        }
    }
    function crowbarOption(){
        //if player choses to go with crowbar, update level from level 4 to level 5
        gameState.level++;
        startRound();
        $crowbarBtn.css('display', 'none')
    }
    function render(){
        //at the end of each roll, render results
    }
    function gameStartRender(){
        
    }
    
    function roundStartRender(){
        if (gameState.rolledDoubles) {
            $messageEl.html(`You found the ${rules.vaults[0].doubles}! You do not win anything this round, but you automatically proceed to the next ${rules.vaults[0].enemy}`);
        } if (gameState.level === 5) {
            $messageEl.html('Round 4, with a crowbar!')
            $wager.html(`Your current wager is ${gameState.wager} gold! The odds for Round 4 with a crowbar are ${rules.vaults[gameState.level].odds}:1`);
        } else {
            $messageEl.html(`Round ${gameState.level}!`);
            $wager.html(`Your current wager is ${gameState.wager} gold! The odds for Round ${gameState.level} are ${rules.vaults[gameState.level].odds}:1`);
        }
        $vaultPic.attr('src', 'resources/vault-closed.png');
        $wager.css('display', '');
        $throwBtn.css('display', '');
        $throwBtn.html('Roll for the House');
        
        $nextRndBtn.css('display', 'none');
        if (gameState.level === 4) {
            //add button for crowbar option, which calls crowBarOption() when clicked
            $crowbarBtn.css('display', '');
            $wager.html(`Your current wager is ${gameState.wager} gold! For the final round, you can roll an extra 1d4 and choose to reduce the odds from ${rules.vaults[gameState.level].odds}:1 to ${rules.vaults[gameState.level+1].odds}:1`);
        }
    }
    function beforeRollRender(){
        $throwBtn.css('display', 'none');
        $crowbarBtn.css('display', 'none');
        $flowBtn.css('display', 'none');
    }
    function afterHouseRender(){
        const trapMessage = gameState.level <= 2 ? ` but beware the trap at ${rules.vaults[gameState.level].trap} and above!` : `.`;
        $messageEl.html(`The house rolled a ${gameState.houseRoll}. You will need to roll a ${gameState.houseRoll} or higher${trapMessage}`);   
    }
    function gameEndRender(){
        $flowBtn.css('display','');
        $wager.css('display', 'none');
        $throwBtn.css('display', 'none');
    }
/*****   Functions related to the rules modal   *****/
    function gameRules(){
        $rulesModal.css('display', 'block');
    }
    function closeRules(){
        $rulesModal.css('display', 'none');
    }


/*****   THIS CODE IS MODIFIED FROM NATAROV, http://www.teall.info/2014/01/online-3d-dice-roller.html   *****/

    const canvas = $t.id('canvas');

    $t.dice.use_true_random = false;
    var params = {};

    //make new canvas element, assign dice and dice box classes
    var box = new $t.dice.dice_box(canvas);
    box.animate_selector = false;

    function before_roll(vectors, notation, callback) {
        // change styles to reflect that rolling is happening
        beforeRollRender();
        // do here rpc call or whatever to get your own result of throw.
        // then callback with array of your result, example:
        // callback([2, 2, 2, 2]); // for 4d6 where all dice values are 2.
        demoArr = [[4], [2, 3], [8], [3, 6], [12], [6,6], [10], [5, 6]];
        if (gameState.demoMode){
            gameState.demoNum++;
            callback(demoArr[gameState.demoNum]);
        } else callback();
        //callback();
    }

    function notation_getter() {
        console.log(gameState.diceToRoll);
        return $t.dice.parse_notation(gameState.diceToRoll);
    }

    function after_roll(notation, result) {
        if (gameState.turn === 1) {
            gameState.rolledDoubles =  result[0] === result[1] ? true : false;
            gameState.playerRoll = result.reduce(function(s, a) { return s + a; });
        } else gameState.houseRoll = result.reduce(function(s, a) { return s + a; });
        endTurn();
    }
    
    if (params.notation) {
        set.value = params.notation;
    }
    if (params.roll) {
        $t.raise_event($t.id('throw'), 'mouseup');
    }
    else {
        //what should be rendered during setup
    }


    initGame();
    box.bind_throw($t.id('throw'), notation_getter, before_roll, after_roll);
})