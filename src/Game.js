var Deck = require('./Deck');
var cardConsts = require('./Deck/consts');
var fs = require('fs');
var shuffle = require('knuth-shuffle').knuthShuffle;
var _ = require('lodash');

function Game() {
    this.players = []; // stores all the current players of the game
    this.registerPlayers();
    this.players = shuffle(this.players);

    this.deck = new Deck(this.players.length);
    this.deal();

    this.turn = 0; // the player who's turn it is
    this.direction = 1; // 1 = Clockwise, -1 = Counter Clockwise
    this.leaderboard = []; // List of winners from first to last
    this.play();
    return this.leaderboard;
}

Game.prototype.registerPlayers = function() {
    var _register = function(file) {
        this.players.push({
            onMove: require(__dirname + '../players/' + file),
            identity: file,
            hand: []
        });
    }.bind(this);

    fs.readdirSync(__dirname + '../players/').map(_register);
};

/**
 * Deals each player 7 cards
 * @param {object} card - A card object that was used in gamepaly
 */
Game.prototype.deal = function() {
    // Draw 1 card per player going clockwise until 7 cards have been drawn
    for(var c = 0; c < 7; ++c) {
        this.players.forEach(function(player) {
            player.hand.push(this.deck.draw());
        });
    }
};

/**
 * Plays one game of uno, returns until only 1 player left
 */
Game.prototype.play = function() {
    // loop until we have 1 player left
    while(!this.isOver()) {
        this.playTurn();
        this.turn = this.nextTurnValue();
    }
};

/**
 * Returns the index of the player who's turn is next
 * @return {number}
 */
Game.prototype.nextTurnValue = function() {
    // increment/decrement the turn
    var output = this.turn + this.direction;

    /**
     * Our game is circular...lets force this
     * aka take: this.players = [0, 1, 2], this.turn = 0;
     *     player 2 is sitting to the left of player 0
     *     player 1 is sitting to the right of player 0
     */
    if(this.direction === 1 && this.turn >= this.players.length) {
        output = 0;
    }
    else if(this.direction === -1 && this.turn < 0) {
        output = this.players.length - 1;
    }

    return output;
};

/**
 * Tells you if the card is in the hand, and if it can be played
 * @param {object} card A Card object
 * @param {array} hand An array of Card objects
 */
Game.prototype.isValidMove = function(card, hand) {
    var isCardInHand = (this.indexOfCardInHand(card, hand) !== -1);
    return (this.canPlaceCard(card) && isCardInHand);
};

/**
 * Tells you if a card can be placed as a valid uno move
 * @param {object} card A Card Object
 * @return {boolean}
 */
Game.prototype.canPlaceCard = function(card) {
    var isValidCardColor = cardConsts.colors.indexOf(card.color) !== -1;
    var isValidCardType = cardConsts.cardTypes.indexOf(card.type) !== -1;
    var isValid = false;

    if(isValidCardColor && isValidCardType) {
        // wild cards can be placed on top of any card, it also must specify the new deck color
        if (card.type === 'wild') {
                isValid = true;
        }
        // same color card...then A-ok
        else if (card.color === this.deck.topCard.color) {
            isValid = true;
        }
        // if card type and value, but different color then its a-ok
        else if (card.type === this.deck.topCard.type &&
                 card.value === this.deck.topCard.value) {

            isValid = true;
        }
    }

    return isValid;
};

/**
 * Returns the index of where a equivalent Card object appears in the hand
 * @param {object} card A Card object
 * @param {object} hand A Uno card hand
 * @return {number} Index of hand [0, hand.length - 1], or -1 if not found
 */
Game.prototype.indexOfCardInHand = function(card, hand) {
    for(var c = 0; c < hand.length; ++c) {
        if (hand[c].type === card.type ||
            hand[c].value === card.value ||
            hand[c].color === card.color) {
                return c;
            }
    }
    return -1;
};

/**
 * Draws a card into current player's hand (aka no move)
 * @return {object} the card which was drawn
 */
Game.prototype.onNoMove = function() {
    var drawnCard = this.deck.draw();
    this.players[this.turn].hand.push(this.deck.draw());
    return _.cloneDeep(drawnCard);
};

Game.prototype.banCurrentPlayer = function() {
    console.log(this.players[this.turn].identity, "Has cheated.  He's been banned");
    this.removeCurrentPlayer();
};

/**
 * Adds player to leaderboard, and cleans player up as he/she has won
 * @param {object} player A Player
 */
Game.prototype.playerWon = function(player) {
    console.log(player.identity, "Has just finished playing uno");
    this.leaderboard.push(player);
    this.removeCurrentPlayer();
};

/**
 * Places the card ontop of the deck, and runs any necessary actions
 * E.g: having next player draw 4...etc
 * @param {object} card A Card Object to be placed on top of deck
 */
Game.prototype.executeMove = function(card) {
    var player = this.players[this.turn];

    // add card to top of deck
    this.deck.play(card);

    // remove card from player's hand
    player.hand.splice(this.indexOfCardInHand(card, player.hand), 1);

    // check if player has won
    if(player.hand.length === 0) {
        this.playerWon(player);
    }

    // handle special actions of card
    if(card.type === 'action') {
        switch(card.value) {
            case 'skip':
                this.turn = this.nextTurnValue();
                break;
            case 'draw two':
                var p = this.nextTurnValue();
                this.players[p].hand.push(this.deck.draw());
                this.players[p].hand.push(this.deck.draw());
                break;
            case 'reverse':
                this.direction = (this.direction === 1) ? -1 : 1;
                break;
        }
    }
    else if (card.type === 'wild' && card.value === 'wild draw 4') {
        var p = this.nextTurnValue();
        for(var i = 0; i < 4; ++i) {
            this.players[p].hand.push(this.deck.draw());
        }
    }
};

/**
 * Has the current AI who's turn it is,
 * play their move...handling all logistics
 */
Game.prototype.playTurn = function() {
    var player = this.players[this.turn];
    var hand = _.cloneDeep(player.hand);
    var topCard = _.cloneDeep(this.deck.topCard);

    var card = player.onMove(topCard, hand, this.onNoMove.bind(this));
    var validMove = this.isValidMove(card, hand);

    if(!validMove) {
        this.banCurrentPlayer();
        return;
    }

    this.executeMove(card);
};

/**
 * Removes the current player from the game.
 */
Game.prototype.removeCurrentPlayer = function() {
    this.players[this.turn].splice(this.turn, 1);

    /**
     * code below fixes this.turn to point to the past player
     *
     * If going Clockwise, now pointing at next player
     * if going counter clockwise, now pointing to last player, or + out of bounds
     * This code make this.turn point to the last player
     */

    // clockwise, go back one player
    if(this.direction === 1) {
        --this.turn;
        if(this.turn < 0) {
            this.turn = this.players.length - 1;
        }
    }
    // counter clockwise, fix +out of bounds delema
    else if(this.direction === -1) {
        // if past player was the last player in arr, we need to point at the start of array
        if(this.turn >= this.players.length) {
            this.turn = 0;
        }
    }
};

/**
 * returns true if game is over
 */
Game.prototype.isOver = function () {
    return (this.players.length <= 1);
};
