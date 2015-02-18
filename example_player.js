/**
 * Place finished ai into a file at: uno-api-battle/players/:github-user-name
 *
 * For example if your github username is georgepburdell,
 * the file would be saved at:
 *   ./players/georgepburdell.js
 */

/**
 * Card Object schema
 * {
 *     type: ..., // either ['number', 'action', 'wild'],
 *     value: ...,
 *     color: ..., // either ['red', 'green', 'blue', 'yellow'],
 * }
 *  card.type is either ['number', 'action', 'wild']
 *
 *  card.value for number cards is: 0-9
 *  card.value for action cards is: ['skip', 'draw two', 'reverse']
 *  card.value for wild cards is: [ 'wild', 'wild draw 4' ]
 *
 *  card.color is ['red', 'green', 'blue', 'yellow']
 */

/**
 * Your exported function is the AI.  It must be 100% synchronous.
 * If any async code it will not run
 * once you've determined a card to play, simply return the card object
 */
module.exports = function(topCard, hand, onNoMove) {
    while(true) {
        var cards;
        // play a card of same color first
        cards = cardsWithColor(topCard.color, hand);
        if(cards.length) {
            return cards[0];
        }

        // if no cards of same color, find one w/same number
        cards = cardsWithSameValue(topCard, hand);
        if(cards.length) {
            return cards[0];
        }

        // else play a wild card if available
        var card = firstWildCard(hand);
        if(card) {
            card.color = 'blue'; // cause it be my fav colour
            return card;
        }

        // no move, lets draw a card and repeat
        var card = onNoMove();
        hand.push(card);
    }
};


function cardsWithColor(color, hand) {
    var output = [];
    hand.forEach(function(card) {
        if(card.color === color) {
            output.push(card);
        }
    });
    return output;
}

function cardsWithSameValue(topCard, hand) {
    var output = [];
    hand.forEach(function(card) {
        if (card.type !== 'wild' &&
            card.type === topCard.type &&
            card.value === topCard.value) {

            output.push(card);
        }
    });
    return output;
}

function firstWildCard(hand) {
    for(var c = 0; c < hand.length; ++c) {
        if(hand[c].type === 'wild') {
            return hand[c];
        }
    }
}
