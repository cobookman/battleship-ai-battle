var deckConsts = require('./consts');

/**
 * Generates a single fresh deck
 * @returns {array} A decks action cards
 */
exports.populateDeck = function() {
    var cards = [];
    cards.concat(exports.numbers());
    cards.concat(exports.actions());
    cards.concat(exports.wilds());
    return cards;
};

/**
 * Generates a fresh deck's action cards
 * @returns {array} A decks action cards
 */
exports.actions = function() {
    var output = [];
    deckConsts.colors.forEach(function(color) {
        deckConsts.actions.forEach(function(action) {
            for(var i = 0; i < 2; ++i) {
                output.push({
                    type: 'action',
                    value: action,
                    color: color
                });
            }
        });
    });
    return output;
};

/**
 * Generates a fresh deck's wild cards
 * @returns {array} A deck's wild cards
 */
exports.wilds = function() {
    var output = [];
    deckConsts.wilds.forEach(function(wild) {
        for(var i = 0; i < 4; ++i) {
            output.push({
                type: 'wild',
                value: wild,
                color: null // player sets this to w/e color he wants
            });
        }
    });
    return output;
};

/**
 * Generates a fresh deck's number cards (0-9)
 * @returns {array} A deck's number cards
 */
exports.numbers = function() {
    var output = [];
    deckConsts.colors.forEach(function(color) {
        for(var i = 0; i <= 9; ++i) {
            var numberCard = {
                type: 'number',
                value: 0,
                color: color
            };

            output.push(numberCard);

            // 0 only has 1 card per color, all other numbers have 2 cards per color
            if(i !== 0) {
                output.push(numberCard);
            }
        }
    });
    return output;
};
