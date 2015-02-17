var deck = {
    cardTypes: ['number', 'action', 'wild'],
    colors: ['red', 'green', 'blue', 'yellow'],
    actions: ['skip', 'draw two', 'reverse'],
    wilds: [ 'wild', 'wild draw 4' ]
};


for(var key in deck) {
    if(deck.hasOwnProperty(key)) {
        Object.defineProperty(deck, key, {
            configurable: false,
            enumerable: true,
            writable: false
        });
    }
}

module.exports = deck;
