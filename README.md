# DandDice
### Bringing Faerun's Most Beloved Dice Games to Your Browser
Dungeons and dragons dice game for GA Project #1. The game currently only allows for Vaults, but Pickpocket and Giants & Halflings are next on the list.

### Getting Started
You can find Vaults [here](). 

### Rules of Play - Vaults
After the player makes their wager, the house roles the first die, an eight-sided die (d8). This is the difficulty of the vault. If the house rolls a 1, the vault is a mimic and the player loses immediately.

The player rolls two six-sided dice (2d6), trying to roll over the vault number. If the player rolls doubles, they activate the trapdoor, passing immediately to the second vault without winning anything from the second. If the player rolls a 9 or higher, they activate the trap and lose.

Players who win a round of vaults move on to the next vault. Successive rounds are harder as the vault die is larger (progressing to 1d10, 1d12, and finally 1d20), but the payout is also larger. The table below shows the payout on the original bet, and the trap numbers (if any).

On the final vault, the player has the option of taking a crowbar. This means they can add an additional four-sided die (1d4) to their roll, but the payout amount is reduced.

Vault Level | Vault Die | Player Die | Payout | Trap #
------------|-----------|------------|--------|--------
Vault 1   |    1d8    |    2d6     |   1:1  |   9+
Vault 2   |    1d10   |    2d6     |   2:1  |   11+
Vault 3   |    1d12   |    2d6     |   3:1  |   no trap 
Vault 4   |    1d20   |    2d6     |   5:1  |   no trap 
Vault 4 + lockpick  |    1d20   | 2d6 + 1d4  |   4:1  |   no trap

  A player can choose to walk away after completing any vault. All winnings from the game are automatically wagered at the next vault if the player decides to continue.

### Screenshots

### Technologies Used

### Credits
Vaults and it's associated variants were created by Jerry Holkins of Penny Arcade. Additional variants and specific ruleset were based on [this subreddit discussion](https://www.reddit.com/r/TheCTeam/comments/7ia630/giants_and_halflings_pickpocket_and_vaults/).
The 3D Dice Roller was created using Anton Natarov's [free dice roller](http://www.teall.info/2014/01/online-3d-dice-roller.html).
Vault graphics are from the [open source illustration kit by Vijay Verma](https://illlustrations.co/).


### TO DO
make canvas responsive
refactor to better adhere to GA requirements
redo README to get all required sections
add option to switch between vaults and pickpocket
