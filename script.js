// What things in game?


/* We have a Card
A pile - stack of cards (tableau, stock, waste, foundation)
Tableau - a pile with special rules (descending order, alternating color)
foundation - pile for completed suits (ascending order)
stock/waste - pile for draw and discard
-scores, moves, rules
*/


// What are the nouns?


/*
Card, Pile, tableau, Foundation, Stock, Waste, Move, Score, Rule
*/


//What actions?


/*
Card - flip, show, hide
Pile - add card, remove card, showTopCard, can add (is it possible?)
tableau - move card , showTopCard, canAdd
Foundation - addCard, canAdd
Stock - drawCard, reset
Waste - showTopCard, addCard
Game - start, restart, moveCard, checkWin, updateScore
*/

/* then we have to define properties- 
for each class what is the data that we need to store. 
So we basically create constructors.


*/


class Game{
    start(){}
    restart(){}
    moveCard(){}
    checkWin(){}
    updateScore(){}
}

class Card{
    constructor(suit,rank){
        this.suit = suit;
        this.rank = rank;
        this.faceUp=false;
        this.element = null;
    }
    flipCard(){}
    showCard(){}
    hideCard(){}
}

class Pile{
    addCard(){}
    removeCard(){}
    topCard(){}
    canAdd(){}
    render() {}
}

class Tableau extends Pile{
    moveCard(){}
    topCard(){}
    canAdd(){}
    render() {}
}

class Foundation extends Pile{
    addCard(){}
    canAdd(){}
    render(){}
}

class Stock extends Pile{
    drawCard(){}
    reset(){}
}
class Waste extends Pile{
    topCard(){}
    addCard(){}
}
