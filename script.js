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
Card - flip, show, hide, render
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
    /*
    createDeck, shuffle, start, restart, movecard, updatescore, checkwin, drawcard, resetstock, pickcard, dropcard
    */
    constructor() {
        this.Tableaus = [];
        this.Foundations = [];
        this.stock = null;
        this.waste = null;

        this.deck= [];
        this.moves = 0;
        this.score = 0;

        for(let i = 0; i<7; i++){
            const e = document.getElementById(`col${i}`);
            this.Tableaus.push(new Tableau(e));
        }
        this.Foundations.push(new Foundation(document.getElementById('f1')));
        this.Foundations.push(new Foundation(document.getElementById('f2')));
        this.Foundations.push(new Foundation(document.getElementById('f3')));
        this.Foundations.push(new Foundation(document.getElementById('f4')));
        this.stock = new Pile(document.getElementById('deck'));
        this.waste = new Pile(document.getElementById('Waste'));
    }
    createDeck() {
        const suits = ["hearts", "diamonds", "clubs", "spades"];
        const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
        this.deck = [];
        for (let suit of suits) {
            for (let rank of ranks) {
                this.deck.push(new Card(suit, rank));
            }
        }
    }
    shuffle() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    start(){
        this.createDeck();
        this.shuffle();

        for(let i=0; i<7 ; i++){
            const pile = this.Tableaus[i];
            for (let j=0; j<=i; j++){
                const card = this.deck.pop();
                pile.addCard(card);
                if (j===i) card.showCard();
            }
        }
        this.stock.cards = this.deck;
        this.stock.render();
        this.deck = []; 

        this.Foundations.forEach(p => {
            p.cards = [];
            p.render();
        })

        this.waste.cards = [];
        this.waste.render();
    }
    
    restart(){
        this.start();
    }

    moveCard(card, fromPile, toPile) {
        if (!toPile.canAdd(card)) return false;

        const index = fromPile.cards.indexOf(card);
        const movingCards = fromPile.cards.splice(index); 

        movingCards.forEach(c => toPile.addCard(c));

        this.moves++;
        this.updateScore(fromPile, toPile);

        fromPile.render();
        toPile.render();

        return true;
    }

    updateScore(fromPile, toPile) {
        if (toPile instanceof Foundation) this.score += 10;
        else if (fromPile instanceof Foundation) this.score -= 15;
    }

    checkWin() {
        return this.Foundations.every(f => f.cards.length === 13);
    }

    drawCard() {
        if (this.stock.cards.length === 0) {
            this.resetStock();
            return;
        }
        const card = this.stock.removeCard();
        card.showCard();
        this.waste.addCard(card);
    }

    resetStock() {
        while (this.waste.cards.length) {
            const card = this.waste.removeCard();
            card.hideCard();
            this.stock.addCard(card);
        }
        this.stock.render();
    }

    pickCard(card, pile) {
        this.selectedCard = card;
        this.selectedCardPile = pile;
    }

    dropCard(targetPile) {
        if (!this.selectedCard) return false;

        const fromPile = this.selectedCardPile; 
        const success = this.moveCard(this.selectedCard, fromPile, targetPile);
        if (success) this.selectedCard = null;
        return success;
    }
}

class Card{
    /*
    isRed, rankValue, flipCard, showCard, hideCard, render
    */
    constructor(suit,rank){
        this.suit = suit;
        this.rank = rank;
        this.faceUp=false;
        this.element = null;
        this.parentPile = null;
        this.render();
        this.element.addEventListener("click", ()=>
        {
            if(this.faceUp){
                game.pickCard(this, this.parentPile);
            }
        })
    }
    isRed() { return this.suit === "hearts" || this.suit === "diamonds"; }
    rankValue() {
        const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
        return ranks.indexOf(this.rank) + 1;
    }
    flipCard(){
        this.faceUp = !this.faceUp; 
        this.render();
    }
    showCard(){
        this.faceUp = true; 
        this.render();  
    }
    hideCard(){
        this.faceUp = false;
        this.render();
    }
    render(){
        if (!this.element){
            this.element = document.createElement("div");
            this.element.classList.add("card");
        }
        if (this.faceUp) {
            this.element.classList.remove('face-down');
            this.element.textContent = `${this.rank} ${this.suit}`;
        } else {
            this.element.classList.add('face-down');
            this.element.textContent = '';
        }
        if (this.suit === "hearts" || this.suit === "diamonds"){
            this.element.style.color = "red";
        }
        else{
            this.element.style.color= "black";
        }
    }
}

class Pile{
    /*

    */
    constructor(element){
        this.cards=[];
        this.element= element;
        this.element.addEventListener("click", ()=>
        {
            if(game.selectedCard){
                game.dropCard(this);
            }
        })

    }

    addCard(card){
        card.parentPile = this;
        this.cards.push(card);
        this.render();
    }
    removeCard(){
        const removed=this.cards.pop();
        this.render();
        return removed;
    }
    topCard(){
        return this.cards[this.cards.length-1];
    }
    canAdd(){
        return true;
    }
    render() {
        this.element.innerHTML = "";
        this.cards.forEach(c => {
            c.render();
            this.element.appendChild(c.element);
        })
    }
}

class Tableau extends Pile{
    canAdd(card){
        const top = this.topCard();
        if (!top){
            return card.rank === "K";
        }
        return top.isRed() !== card.isRed() && top.rankValue() === card.rankValue() + 1;
    }
}

class Foundation extends Pile{
    canAdd(card){
    const top = this.topCard();
    if (!top){
        return card.rank === "A";
    }
    return top.suit === card.suit && top.rankValue() === card.rankValue() +1;
    }
}

const game = new Game();
game.start();
document.getElementById('restart').addEventListener('click', () => game.restart());
