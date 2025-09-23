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
Card, Pile, tableau, Foundation, Stock, waste, Move, Score, Rule
*/


//What actions?


/*
Card - flip, show, hide, render
Pile - add card, remove card, showTopCard, can add (is it possible?)
tableau - move card , showTopCard, canAdd
Foundation - addCard, canAdd
Stock - drawCard, reset
waste - showTopCard, addCard
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
        //this.score = 0;

        for(let i = 0; i<7; i++){
            const e = document.getElementById(`col${i}`);
            this.Tableaus.push(new Tableau(e));
        }
        this.Foundations.push(new Foundation(document.getElementById('f1')));
        this.Foundations.push(new Foundation(document.getElementById('f2')));
        this.Foundations.push(new Foundation(document.getElementById('f3')));
        this.Foundations.push(new Foundation(document.getElementById('f4')));
        this.waste = new Waste(document.getElementById('waste'));
        this.stock = new Stock(document.getElementById('deck'),this.waste);
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
        this.moves=0;
        this.start();
    }

    moveCard(card, fromPile, toPile) {
        if (!toPile.canAdd(card)) return false;

        const index = fromPile.cards.indexOf(card);
        if (index === -1 || !fromPile.cards[index].faceUp) return false;

        const movingCards = fromPile.cards.splice(index); 

        movingCards.forEach(c => toPile.addCard(c));

        const last = fromPile.topCard();
        if (fromPile instanceof Tableau && last && !last.faceUp) {
            last.showCard();
        }

        this.moves++;
        //this.updateScore(fromPile, toPile);

        fromPile.render();
        toPile.render();

        this.checkWin();
        return true;
    }
/*
    updateScore(fromPile, toPile) {
        if (toPile instanceof Foundation) this.score += 10;
        else if (fromPile instanceof Foundation) this.score -= 15;
    }
*/
    checkWin() {
        if (this.Foundations.every(f => f.cards.length === 13)){
            alert("You win!");
            return true;
        }
        return false;
    }

    pickCard(card, pile) {
        if (!card.faceUp) return false;
        const index = pile.cards.indexOf(card);
        this.selectedCards = pile.cards.slice(index);
        this.selectedCardPile = pile;
        this.selectedCards.forEach(c=> c.element.classList.add("selected"));
    }

    dropCard(targetPile) {
        if (!this.selectedCards) return false;
        const fromPile = this.selectedCardPile; 
        const success = this.moveCard(this.selectedCards[0], fromPile, targetPile);
        if (success) this.selectedCards = null;
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
            this.element.innerHTML = ` 
                <div class="front">
                    <div class = "corner top-left">
                        <div class = "rank">${this.rank}</div>
                        <div class= "suit"></div>
                    </div>
                    <div class="center">
                        <div class="suit"></div>
                    </div>
                    <div class= "corner bottom-right">
                        <div class = "rank">${this.rank}</div>
                        <div class= "suit"></div>
                    </div>
                </div>
                <div class = "back"></div>
            `;
        }
        const suits = {
        hearts: "\u2665", // - heart
        diamonds: "\u2666", // - diamond
        clubs: "\u2663",   // - clubs
        spades: "\u2660"  // - spades
        };

        this.element.querySelectorAll(".suit").forEach(s => s.textContent= suits[this.suit]);
        this.element.style.color= this.isRed() ? "red" : "black";
        if (this.faceUp) {
            this.element.classList.remove('face-down');
            this.element.classList.add('face-up');
        } else {
            this.element.classList.remove('face-up');
            this.element.classList.add('face-down');
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
        return top.isRed() !== card.isRed() && card.rankValue() === top.rankValue() + 1;
    }
    render() {
        this.element.innerHTML= "";
        this.cards.forEach((c,i)=> {
            c.render();
            c.element.style.position = "absolute";
            c.element.style.top = (i*25)+"px";
            this.element.appendChild(c.element);
        })
    }
}

class Foundation extends Pile{
    canAdd(card){
    const top = this.topCard();
    if (!top){
        return card.rank === "A";
    }
    return top.suit === card.suit && card.rankValue() === top.rankValue() - 1;
    }
}

class Stock extends Pile{
    constructor(element,waste){
        super(element);
        this.waste = waste;
        this.element.addEventListener("click", () =>{
        this.drawCard();
        })
    }

    drawCard() {
        if (this.cards.length === 0) {
            this.resetStock();
            return;
        }
        const card = this.removeCard();
        card.showCard();
        this.waste.addCard(card);
    }
    resetStock() {
        while (this.waste.cards.length) {
            const card = this.waste.removeCard();
            card.hideCard();
            this.addCard(card);
        }
        this.render();
    }
}

class Waste extends Pile{
    constructor(element){
        super(element);
        this.element.addEventListener("click", ()=>{
            if (game.selectedCards){
                game.dropCard(this);
            }
            else{
                const top = this.topCard();
                if (top) {
                    game.pickCard(top,this);
                }
            }
        })
    }
    canAdd(){
        return false;
    }
    render(){
        this.element.innerHTML = "";
        const top = this.topCard();
        if (top){
            top.faceUp = true;
            top.render();
            this.element.appendChild(top.element);
        }
    }
}
const game = new Game();
game.start();
document.getElementById('restart').addEventListener('click', () => game.restart());
