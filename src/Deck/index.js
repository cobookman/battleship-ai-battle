var deckConsts = require('./deckConsts');
var cardGenerators = require('./cardGenerators');
var shuffle = require('knuth-shuffle').knuthShuffle;

var cardsInAUnoDeck = cardGenerators.populateDeck();

/**
 * Represents a Uno Card Deck.
 * @constructor
 * @param {number} numberOfPlayers - The number of players in the game
 */
function Deck(numberOfPlayers) {
    this.numOfDecks = Math.ceil((numberOfPlayers || 0) / 5);


    this.cards = [];
    for(var i = 0; i < this.numOfDecks; ++i) {
        this.cards.concat(cardsInAUnoDeck);
    }
    this.topCard = null;
    this.cards = shuffle(this.cards);
}

/**
 * Checkin a card placed during gameplay
 * @param {object} card - A card object that was used in gamepaly
 */
Deck.prototype.play = function(card) {
    this.topCard = card;
    this.cards.unshift(card);
};

/**
 * Draw a card from the deck
 * @returns {object} card - A card object
 */
Deck.prototype.draw = function() {
    return this.cards.pop();
};

module.exports = Deck;
