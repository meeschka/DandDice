//store the rules for each level in an object, as array values, in the following format for each vault:
// {level: int, 'vault-die': str, 'player-die': str, odds: val, trap: int, terms: {difficulty: str, lower-bound: str, overshoot: str, split: bool}}
let rules = {
    vaults:
        [   
            {difficultyNum: 'Vault Number', lowerBound: 'was a Mimic', overshoot: 'activated the trap', overshootNoun: 'trap', enemy: 'Vault', push: 'found the trapdoor', lastRound: 4, title: 'Vaults'},
            {level: 1, 'vault-die': '1d8', 'player-die': '2d6', odds: 1, trap: 9},
            {level: 2, 'vault-die': '1d10', 'player-die': '2d6', odds: 2, trap: 11},
            {level: 3, 'vault-die': '1d12', 'player-die': '2d6', odds: 3, trap: 21},
            {level: 4, 'vault-die': '1d20', 'player-die': '2d6', odds: 5, trap: 21},
            {level: 5, 'vault-die': '1d20', 'player-die': '2d6+1d4', odds: 4, trap: 21},
            
        ],
    giantsAndHalflings: [
        {difficultyNum: 'knee', lowerBound: 'Kicked You', overshoot: 'entered the maw', overshootNoun: 'maw', enemy: 'Giant', push: 'hit the knee', doubleOnes: `There's a snake in the grass! The giant runs away.`, lastRound: 1, title: 'Giants and Halflings', split: true},
        {level: 1, 'vault-die': '1d10', 'player-die': '2d6', odds: 2, trap: 11 },
        {level: 2, 'vault-die': '1d10', 'player-die': '1d6', odds: 2, trap: 11 }
    ]
}
/*****************************************/
///GLOBAL VARIABLES
/*****************************************/
let gameState = {}
//for resizing canvas
const debounceTime = 50; 
let debounceTimeoutHandle;
const sounds = {
    gameWin: 'resources/gameWin.mp3',
    roundWin: 'resources/roundWin.mp3',
    gameLoss: 'resources/lose.wav',
    push: 'resources/neutral1.flac'
};
const player = new Audio();

$(function(){
    /*****************************************/
    //Element Selectors
    /*****************************************/
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
    const $canvasBoxEl = $('#canvas');
    const $vaultsBtn = $('#vaults-btn');
    const $gAndHBtn = $('#gAndH-btn');
    
    /*****************************************/
    //Event listeners
    /*****************************************/
    $flowBtn.on('click', function(){
        gameState.gameOn ? initGame(gameState.game || 'vaults') : startGame();
    });
    $nextRndBtn.on('click', nextRound);
    $crowbarBtn.on('click', crowbarOption);
    $rulesBtn.on('click', gameRules);
    $closeModal.on('click', closeRules);
    addEventListener('resize', debouncedResize);
    $vaultsBtn.on('click', playVaults);
    $gAndHBtn.on('click', playGAndH);
    /*****************************************/
    // Game Logic
    /*****************************************/
    function initGame(game){
        gameState = {
            game: game,
            turn: -1,
            level: 1,
            wager: 0,
            houseRoll: null,
            playerRoll: null,
            gameOn: false,
            rolledDoubleOnes: false,
            diceToRoll: '1d8',
            demoMode: false,
            demoNum: -1,
            splitNums: [],
            splitWager: 0
        }
        initRender();
    }
    function startGame(){
        //sets up game board, enters player's wager into gamestate
        gameState.gameOn = true;
        gameStartRender();
        gameState.wager = parseInt($wagerInput.val())?parseInt($wagerInput.val()) : 0;
        startRound();
    }
    function startRound(){
        //called at the start of each round to update gamestate and call appropriate render
        roundStartRender();
        gameState.houseRoll = null;
        gameState.playerRoll = null;
        gameState.rolledDoubleOnes = false;
        gameState.diceToRoll = rules[gameState.game][gameState.level]['vault-die'];
    }
    function playerSetup(){
        //sets up board for players to roll when it is their turn
        afterHouseRender();
        gameState.diceToRoll = rules[gameState.game][gameState.level]['player-die'];
    }
    function nextRound(){
        //starts next round
        gameState.level+=1;
        startRound();
    }
    function endTurn(){
        //ends the current turn
        gameState.turn*=-1;
        checkWinner();
    }
    function checkWinner(){
        //check the different win conditions
        if (gameState.houseRoll === 1){
            houseWins();
        } else if (gameState.playerRoll) {
            if (gameState.splitNums.length>0){
                splitRound();
            }else if (gameState.rolledDoubleOnes||(gameState.houseRoll === gameState.playerRoll)) {
                push();
            } else if (gameState.playerRoll > gameState.houseRoll && gameState.playerRoll < rules[gameState.game][gameState.level].trap){
                playerWinsRound();
            } else houseWins();
        } else playerSetup();
    }
    function  houseWins(){
        //if the house wins any round, they win the game
        //the message displayed to the player states how they lost the game for clarity
        if (gameState.houseRoll === 1) {
            $messageEl.html(`The ${rules[gameState.game][0].enemy} ${rules[gameState.game][0].lowerBound}! You lose.`);
        } else if (gameState.houseRoll > gameState.playerRoll) {
            $messageEl.html(`You only rolled a ${gameState.playerRoll}, the ${rules[gameState.game][0].difficultyNum} was ${gameState.houseRoll}. You lose.`);
        } else $messageEl.html(`You rolled above the ${rules[gameState.game][0].difficultyNum} of ${gameState.houseRoll} and ${rules[gameState.game][0].overshoot}. You lose.`);
        if (gameState.splitWager){
            $wager.html(`You receive ${gameState.splitWager} from your first split round, and lose your wager on the second split round.`);
        }
        playSound('gameLoss');
        gameEndRender();
    }
    function playerWinsRound(){
        //handles rendering and game logic when player wins the round
        wonRoundRender();
        gameState.wager=gameState.wager+gameState.wager*rules[gameState.game][gameState.level].odds+gameState.splitWager;
        optionToContinue();
    }
    function push(){
        //if you roll double 1s, or the vault number in vaults, you 'push' to the next round without increasing your winnings
        //if you were on the last level, you need to redo it.
        //unlike when you win a level, you don't have the option to walk away
        playSound('push');
        if (gameState.rolledDoubleOnes && rules[gameState.game][0].doubleOnes){
            $messageEl.html(`${rules[gameState.game][0].doubleOnes}`);
        } else {
            $messageEl.html(`You ${rules[gameState.game][0].push}! You do not win anything this round, but you automatically proceed to the next ${rules[gameState.game][0].enemy}`);
        }
        if (gameState.level >= rules[gameState.game][0].lastRound) {
            gameState.level = rules[gameState.game][0].lastRound-1;
        }
        $nextRndBtn.css('display', '');
    }
    function optionToContinue(){
        //after each round either you have the option to continue or you've won the game
        if (gameState.level < rules[gameState.game][0].lastRound) {
            playSound('roundWin');
            $messageEl.html(`You won the round with a ${gameState.playerRoll}, which is higher than the ${rules[gameState.game][0].difficultyNum} of ${gameState.houseRoll}! Would you like to move on to the next vault?`);
            $wager.html(`Your current wager is ${gameState.wager} gold! The odds for the next round are ${rules[gameState.game][gameState.level+1].odds}:1.`);
            $nextRndBtn.css('display', '');
            $flowBtn.css('display', '');
        } else if (gameState.splitNums.length === 0){
            playSound('gameWin');
            $messageEl.html(`You won the game! Your initial wager has become ${gameState.wager}`);
            gameEndRender();
        }
    }
    function splitRound(){
        //like a regular round, but you use one of the numbers in the splitNum array and only roll one die. Repeat until no more numbers in splitNum
        playSound('push');
        if(gameState.splitNums.length>1) {
            $messageEl.html(`You have split, and have the option of completing another round with each of the dice you have just rolled. Next up is the ${gameState.splitNums[0]}.`);
            $flowBtn.css('display', '');
        } else if (gameState.playerRoll >= gameState.houseRoll){
            gameState.splitWager = gameState.wager+gameState.wager*rules[gameState.game][gameState.level].odds;
            $messageEl.html(`Your new roll combined with your previous split number is ${gameState.playerRoll}, so you won the round! You still have a split round to go with the dice you rolled last round, a ${gameState.splitNums[0]}.`);
            $wager.html(`Your wager became ${gameState.splitWager} this round, and the wager for the next split round is ${gameState.wager} gold!`);
        }  else {
            $messageEl.html(`Your new roll combined with your previous split number is ${gameState.playerRoll}, so you lost the round! You still have a split round to go with the dice you rolled last round, a ${gameState.splitNums[0]}.`);
            $wager.html(`Your lost your wager on this round, but there's still the other split round to go...`)
        }
        gameState.level = 2;
        startRound();
    }
    function crowbarOption(){
        //if player choses to go with crowbar, update level from level 4 to level 5
        gameState.level++;
        startRound();
        $crowbarBtn.css('display', 'none')
    }
    function playSound(name) {
        player.src = sounds[name];
        var playerPromise = player.play();
        if (playerPromise !== undefined) {
            playerPromise.then()
            .catch(err => console.log(err));
        }
    }
    /*****************************************/
    /********* RENDER FUNCTIONS **********/
    /*****************************************/
    function initRender(){
        //called on page load or game reset
        $throwBtn.css('display', 'none');
        $crowbarBtn.css('display', 'none');
        $flowBtn.html('Start New Game');
        $wagerInput.css('display', '');
        $wagerInput.val('');
        $wager.css('display', 'none');
        $nextRndBtn.css('display', 'none');
        $messageEl.html('Enter a wager and start the game!')
        $('h1').html(`D&Dice: ${rules[gameState.game][0].title}`)
        if (gameState.game === 'vaults') {
            $vaultsBtn.css('display', 'none');
            $gAndHBtn.css('display', '');
        } else {
            $gAndHBtn.css('display', 'none');
            $vaultsBtn.css('display', '');
        }
    }
    function gameStartRender(){
        $flowBtn.html('Reset');
        $wagerInput.css('display', 'none');
        $vaultsBtn.css('display', 'none');
        $gAndHBtn.css('display', 'none');
        $messageEl.html('The house rolls first to determine the number to beat.');
    }
    function roundStartRender(){
        if (gameState.level === 5) { //there is technically no round 5, only round 4 with a crowbar, so need to manually program this message
            $messageEl.html('Round 4, with a crowbar!')
            $wager.html(`Your current wager is ${gameState.wager} gold. The odds for Round 4 with a crowbar are ${rules[gameState.game][gameState.level].odds}:1.`);
        } else if (gameState.splitNums.length>0){
            //use message generated in splitNums
        } else {
            $messageEl.html(`Round ${gameState.level}`);
            $wager.html(`Your current wager is ${gameState.wager} gold. The odds for Round ${gameState.level} are ${rules[gameState.game][gameState.level].odds}:1.`);
        }
        if (gameState.level === 4) {
            //add button for crowbar option, which calls crowBarOption() when clicked
            $crowbarBtn.css('display', '');
            $wager.html(`Your current wager is ${gameState.wager} gold. For the final round, you can roll an extra 1d4 and choose to reduce the odds from ${rules[gameState.game][gameState.level].odds}:1 to ${rules[gameState.game][gameState.level+1].odds}:1.`);
        }
        $vaultPic.attr('src', 'resources/vault-closed.png');
        $wager.css('display', '');
        $throwBtn.css('display', '');
        $throwBtn.html('Roll for the House');
        $nextRndBtn.css('display', 'none');
    }
    function beforeRollRender(){
        $throwBtn.css('display', 'none');
        $crowbarBtn.css('display', 'none');
        $flowBtn.css('display', 'none');
    }
    function afterHouseRender(){
        const trapMessage = gameState.level <= 2 ? ` but beware the ${rules[gameState.game][0].overshootNoun} at ${rules[gameState.game][gameState.level].trap} and above!` : `.`;
        $messageEl.html(`The house rolled a ${gameState.houseRoll}. You will need to roll a ${gameState.houseRoll} or higher${trapMessage}`);   
        $throwBtn.css('display', '');
        $throwBtn.html(`<i class="las la-dice"></i>Roll!`);
    }
    function wonRoundRender(){
        $throwBtn.css('display', 'none');
        $flowBtn.css('display', 'none');
        $vaultPic.attr('src', 'resources/vault-open.png');
    }
    function gameEndRender(){
        $flowBtn.css('display','');
        $wager.css('display', 'none');
        $throwBtn.css('display', 'none');
    }
/****************************************************/
/*****   Functions related to switching games   *****/
/****************************************************/   
    function playVaults(){
        initGame('vaults');
    }
    function playGAndH(){
        initGame('giantsAndHalflings');
    }
/****************************************************/
/*****   Functions related to the rules modal   *****/
/****************************************************/
    function gameRules(){
        $rulesModal.css('display', 'block');
    }
    function closeRules(){
        $rulesModal.css('display', 'none');
    }
/************************************************************************************************************************************/
/*****   THIS CODE IS MODIFIED FROM NATAROV, http://www.teall.info/2014/01/online-3d-dice-roller.html . It controls the dice and canvas. It has been kept separate for clarity  *****/
/************************************************************************************************************************************/
    //these variables were kept separate to avoid breaking up the dice functionality
    const canvas = $t.id('canvas');
    $t.dice.use_true_random = false;
    var params = {};
    //make new canvas element, assign dice and dice box classes
    var box = new $t.dice.dice_box(canvas);
    box.animate_selector = false;

    //dice functions
    function before_roll(vectors, notation, callback) {
        //function called before the dice are rolled but after the throw button is clicked
        // change styles to reflect that rolling is happening
        beforeRollRender();
        // to set dice results, callback with array of your desired result, example:
        // callback([2, 2, 2, 2]); // for 4d6 where all dice values are 2.
        demoArr = [[4], [3, 1], [6], [2,6], [9], [6,4], [13], [5, 6]];
        if (gameState.demoMode){
            gameState.demoNum++;
            callback(demoArr[gameState.demoNum]);
        } else callback();
    }
    function notation_getter() {
        //parses string dice notation (i.e., 2d6) into appropriate input for geometry generator
        return $t.dice.parse_notation(gameState.diceToRoll);
    }
    function after_roll(notation, result) {
        //called once roll is complete
        if (gameState.turn === 1) {
            //check if player rolled double 1s
            gameState.rolledDoubleOnes = (result[0] === result[1]) && (result[0] === 1) ? true : false;
            //record playerRoll total
            if(gameState.splitNums.length>=1){
                gameState.playerRoll = result[0] + gameState.splitNums.shift();
            } else {
                gameState.playerRoll = result.reduce(function(s, a) { return s + a; });
            }
            //check to see if roll splits
            if ((gameState.playerRoll === gameState.houseRoll)&&rules[gameState.game][0].split){
                result.forEach((num)=>gameState.splitNums.push(num));
            }
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
        //what should be rendered during canvas setup, if anything
    }
    //making canvas responsive
    function debouncedResize(){
        clearTimeout(debounceTimeoutHandle); //clears pending debounce events
        debounceTimeoutHandle = setTimeout(resizeCanvas, debounceTime);

    }
    function resizeCanvas(){
        box.reinit(canvas, {w: $canvasBoxEl.innerWidth(), h: $canvasBoxEl.innerHeight()});        
    }
    //initializing the code
    initGame('vaults');
    box.bind_throw($t.id('throw'), notation_getter, before_roll, after_roll);
})
