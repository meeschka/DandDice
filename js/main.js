
//store the rules for each level in an object, as array values, in the following format for each vault:
// {level: int, 'vault-die': str, 'player-die': str, odds: val, trap: int, terms: {difficulty: str, lower-bound: str, overshoot: str, split: bool}}
let rules = {
    vaults:
        [   
            {difficultyNum: 'Vault Number', lowerBound: 'was a Mimic', overshoot: 'activated the trap', enemy: 'Vault', push: 'trapdoor', lastRound: 4, title: 'Vaults'},
            {level: 1, 'vault-die': '1d8', 'player-die': '2d6', odds: 1, trap: 9, split: false},
            {level: 2, 'vault-die': '1d10', 'player-die': '2d6', odds: 2, trap: 11, split: false},
            {level: 3, 'vault-die': '1d12', 'player-die': '2d6', odds: 3, trap: 21, split: false},
            {level: 4, 'vault-die': '1d20', 'player-die': '2d6', odds: 5, trap: 21, split: false},
            {level: 5, 'vault-die': '1d20', 'player-die': '2d6+1d4', odds: 4, trap: 21, split: false},
            
        ],
    giantsAndHalflings: [
        {difficultyNum: 'knee', lowerBound: 'Kicked You', overshoot: 'entered the maw', enemy: 'Giant', push: 'hit the knee', doubleOnes: `There's a snake in the grass! The giant runs away.`, lastRound: 1, title: 'Giants and Halflings'},
        {level: 1, 'vault-die': '1d10', 'player-die': '2d6', odds: 2, trap: 11, split: true }
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
    /*****************************************/
    // Game Logic
    /*****************************************/
    function initGame(game){
        gameState = {
            game: game,
            winner: 'null',
            roundWinner:'null',
            turn: -1,
            level: 1,
            wager: 0,
            houseRoll: null,
            playerRoll: null,
            gameOn: false,
            rolledDoubleOnes: false,
            diceToRoll: '1d8',
            demoMode: true,
            demoNum: -1
        }
        initRender();
    }

    function startGame(){
        gameState.gameOn = true;
        gameStartRender();
        gameState.wager = parseInt($wagerInput.val())?parseInt($wagerInput.val()) : 0;
        startRound();
    }
    function startRound(){
        roundStartRender();
        gameState.houseRoll = null;
        gameState.playerRoll = null;
        gameState.rolledDoubleOnes = false;
        gameState.diceToRoll = rules[gameState.game][gameState.level]['vault-die'];
    }
    function playerSetup(){
        afterHouseRender();
        gameState.diceToRoll = rules[gameState.game][gameState.level]['player-die'];
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
            if (gameState.rolledDoubleOnes||(gameState.houseRoll === gameState.playerRoll)) {
                push();
            } else if (gameState.playerRoll > gameState.houseRoll && gameState.playerRoll < rules[gameState.game][gameState.level].trap){
                playerWinsRound();
            } else houseWins();
        } else playerSetup();
    }

    function  houseWins(){
        if (gameState.houseRoll === 1) {
            $messageEl.html(`The ${rules[gameState.game][0].enemy} ${rules[gameState.game][0].lowerBound}! You lose.`);
        } else if (gameState.houseRoll > gameState.playerRoll) {
            $messageEl.html(`You only rolled a ${gameState.playerRoll}, the ${rules[gameState.game][0].difficultyNum} was ${gameState.houseRoll}. You lose.`);
        } else $messageEl.html(`You rolled above the ${rules[gameState.game][0].difficultyNum} of ${gameState.houseRoll} and ${rules[gameState.game][0].overshoot}. You lose.`);
        playSound('gameLoss');
        gameEndRender();
    }
    function playerWinsRound(){
        $throwBtn.css('display', 'none');
        $flowBtn.css('display', 'none');
        $vaultPic.attr('src', 'resources/vault-open.png');
        gameState.wager=gameState.wager+gameState.wager*rules[gameState.game][gameState.level].odds;
        optionToContinue();
    }
    function push(){
        if (rules[gameState.game][0].rolledDoubleOnes){
            $messageEl.html(`${rules[gameState.game][0].push} You do not win anything this round, but you automatically proceed to the next ${rules.vaults[0].enemy}`);
        } else $messageEl.html(`You found the ${rules[gameState.game][0].push}! You do not win anything this round, but you automatically proceed to the next ${rules.vaults[0].enemy}`);
        if (gameState.level >3) {gameState.level = 3};
        $nextRndBtn.css('display', '');
    }
    function optionToContinue(){
        if (gameState.level < rules[gameState.game][0].lastRound) {
            playSound('roundWin');
            $messageEl.html(`You won the round with a ${gameState.playerRoll}, which is higher than the ${rules[gameState.game][0].difficultyNum} of ${gameState.houseRoll}! Would you like to move on to the next vault?`);
            $wager.html(`Your current wager is ${gameState.wager} gold! The odds for the next round are ${rules[gameState.game][gameState.level+1].odds}:1`);
            $nextRndBtn.css('display', '');
            $flowBtn.css('display', '');
        } else {
            playSound('gameWin');
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
    function playSound(name) {
        player.src = sounds[name];
        player.play();
      }
    /*****************************************/
    /********* RENDER FUNCTIONS **********/
    /*****************************************/
    function initRender(){
        $throwBtn.css('display', 'none');
        $crowbarBtn.css('display', 'none');
        $flowBtn.html('Start New Game');
        $wagerInput.css('display', '');
        $wagerInput.html('');
        $wager.css('display', 'none');
        $nextRndBtn.css('display', 'none');
        $messageEl.html('Enter a wager and start the game!')
        $('h1').html(`D&Dice: ${rules[gameState.game][0].title}`)
    }
    function gameStartRender(){
        $flowBtn.html('Reset');
        $wager.css('display', 'none')
        $wagerInput.css('display', 'none');
    }
    function roundStartRender(){
        if (gameState.rolledDoubleOnes) {
            playSound('push');
            $messageEl.html(`You found the ${rules[gameState.game][0].push}! You do not win anything this round, but you automatically proceed to the next ${rules[gameState.game][0].enemy}`);
        } if (gameState.level === 5) { //there is technically no round 5, only round 4 with a crowbar, so need to manually program this message
            $messageEl.html('Round 4, with a crowbar!')
            $wager.html(`Your current wager is ${gameState.wager} gold! The odds for Round 4 with a crowbar are ${rules[gameState.game][gameState.level].odds}:1`);
        } else {
            $messageEl.html(`Round ${gameState.level}!`);
            $wager.html(`Your current wager is ${gameState.wager} gold! The odds for Round ${gameState.level} are ${rules[gameState.game][gameState.level].odds}:1`);
        }
        if (gameState.level === 4) {
            //add button for crowbar option, which calls crowBarOption() when clicked
            $crowbarBtn.css('display', '');
            $wager.html(`Your current wager is ${gameState.wager} gold! For the final round, you can roll an extra 1d4 and choose to reduce the odds from ${rules[gameState.game][gameState.level].odds}:1 to ${rules[gameState.game][gameState.level+1].odds}:1`);
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
        const trapMessage = gameState.level <= 2 ? ` but beware the trap at ${rules[gameState.game][gameState.level].trap} and above!` : `.`;
        $messageEl.html(`The house rolled a ${gameState.houseRoll}. You will need to roll a ${gameState.houseRoll} or higher${trapMessage}`);   
        $throwBtn.css('display', '');
        $throwBtn.html(`<i class="las la-dice"></i>Roll!`);
        $flowBtn.css('display', '');
    }
    function gameEndRender(){
        $flowBtn.css('display','');
        $wager.css('display', 'none');
        $throwBtn.css('display', 'none');
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

/************************************************************************************************/
/*****   THIS CODE IS MODIFIED FROM NATAROV, http://www.teall.info/2014/01/online-3d-dice-roller.html . It controls the dice and canvas  *****/
/************************************************************************************************/
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
        demoArr = [[4], [2, 3], [8], [1,1], [11], [6,5], [13], [5, 6]];
        if (gameState.demoMode){
            gameState.demoNum++;
            callback(demoArr[gameState.demoNum]);
        } else callback();
        //callback();
    }

    function notation_getter() {
        return $t.dice.parse_notation(gameState.diceToRoll);
    }

    function after_roll(notation, result) {
        if (gameState.turn === 1) {
            gameState.rolledDoubleOnes =  (result[0] === result[1]) && (result[0] === 1) ? true : false;
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