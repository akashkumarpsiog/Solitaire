class Game{
    constructor() {
        this.Tableaus = [];
        this.Foundations = [];
        this.stock = null;
        this.waste = null;
        this.moveHistory=[];
        this.deck= [];
        this.moves = 0;
        this.selectedCards = null;
        this.selectedCardPile = null;
        this.dragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.dragElement = null;

        this.seconds = 0;
        this.minutes = 0;
        this.timerInterval = null;
        this.timerElement = document.getElementById("timer");

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
    
    restart() {
        this.moves = 0;
        this.moveHistory = [];
        document.getElementById("moves").textContent = this.moves;

        this.Tableaus.forEach(pile => {
            pile.cards = [];
            pile.render();
        });
        this.Foundations.forEach(pile => {
            pile.cards = [];
            pile.render();
        });
        this.waste.cards = [];
        this.waste.render();
        this.stock.cards = [];
        this.stock.render();

        this.deck = [];
        this.start();
    }

    undo() {
        if (this.moveHistory.length === 0) return;

        const lastMove = this.moveHistory.pop();
        const { cards, from, to } = lastMove;

        to.cards.splice(to.cards.length - cards.length, cards.length);

        cards.forEach(c => {
            from.cards.push(c);
            c.parentPile = from;
        });

        if (from instanceof Tableau) {
            from.cards.forEach(c => c.hideCard());
            const last = from.topCard();
            if (last) last.showCard();
        }

        if (to instanceof Tableau) {
            to.cards.forEach(c => c.hideCard());
            const last = to.topCard();
            if (last) last.showCard();
        }

        from.render();
        to.render();

        this.moves = Math.max(0, this.moves - 1);
        document.getElementById("moves").textContent = this.moves;
    }

    checkWin() {
        if (this.Foundations.every(f => f.cards.length === 13)){
            const winDiv=document.getElementById("win");
            winDiv.style.display="block";
            return true;
        }
        return false;
    }

    startDrag(e, card, pile) {
        if (!card.faceUp) return;
        const index = pile.cards.indexOf(card);
        if (index === -1) return;

        if ((pile instanceof Foundation || pile instanceof Waste) && card !== pile.topCard()) return;

        if (pile instanceof Foundation || pile instanceof Waste) {
            this.selectedCards = [card];
        } else {
            this.selectedCards = pile.cards.slice(index);
        }

        this.selectedCardPile = pile;

        this.dragElement = document.createElement("div");
        this.dragElement.style.position = "absolute";
        this.dragElement.style.zIndex = 1000;
        
        this.selectedCards.forEach((c, i) => {
            const clone = c.element.cloneNode(true);
            clone.style.position = "absolute";
            clone.style.left = "0";
            if (pile instanceof Foundation){
                clone.style.top = `${i * 5}px`;
            }
            else{
                clone.style.top = `${i * 25}px`;
            }
            this.dragElement.appendChild(clone);
        });

        document.body.appendChild(this.dragElement);

        const rect = card.element.getBoundingClientRect();
        this.dragOffsetX = e.clientX - rect.left;
        this.dragOffsetY = e.clientY - rect.top;
        this.updateDragPosition(e);

        this.dragging = true;

        this.selectedCards.forEach(c => c.element.style.visibility = "hidden");

        this.mouseMoveHandler = (ev) => this.updateDragPosition(ev);
        this.mouseUpHandler = (ev) => this.endDrag(ev);
        document.addEventListener("mousemove", this.mouseMoveHandler);
        document.addEventListener("mouseup", this.mouseUpHandler);
    }

    updateDragPosition(e) {
        this.dragElement.style.left = `${e.clientX - this.dragOffsetX}px`;
        this.dragElement.style.top = `${e.clientY - this.dragOffsetY}px`;
    }

    endDrag(e) {
        this.dragging = false;
        document.removeEventListener("mousemove", this.mouseMoveHandler);
        document.removeEventListener("mouseup", this.mouseUpHandler);

        let targetPile = null;

        this.dragElement.style.display = "none";
        let elem = document.elementFromPoint(e.clientX, e.clientY);
        this.dragElement.style.display = "";

        while (elem && elem !== document.body) {
            if (elem.classList.contains("column")) {
                const idx = parseInt(elem.id.slice(3));
                targetPile = this.Tableaus[idx];
                break;
            } else if (elem.classList.contains("foundation")) {
                const idx = parseInt(elem.id.slice(1)) - 1;
                targetPile = this.Foundations[idx];
                break;
            } else if (elem.id === "waste") {
                targetPile = this.waste;
                break;
            }
            elem = elem.parentNode;
        }

        let success = false;
        if (targetPile && targetPile !== this.selectedCardPile) {
            const firstCard = this.selectedCards[0];
            if (targetPile.canAdd(firstCard)) {
                success = this.dropCard(targetPile);
            }
        }

        if (!success) {
            this.selectedCards.forEach(c => c.element.style.visibility = "");
        }

        document.body.removeChild(this.dragElement);
        this.dragElement = null;
        this.selectedCards = null;
        this.selectedCardPile = null;
    }

    dropCard(targetPile) {
        if (!this.selectedCards) return false;
        if ((targetPile instanceof Foundation || targetPile instanceof Waste) && this.selectedCards.length > 1) {
            return false;
        }
        const movingCards = this.selectedCards;
        const firstCard = movingCards[0];
        if (!targetPile.canAdd(firstCard)) return false;

        const fromPile = this.selectedCardPile; 
        const index = fromPile.cards.indexOf(firstCard);

        const removedCards = fromPile.cards.splice(index);

        const last = fromPile.topCard();
        if (fromPile instanceof Tableau && last && !last.faceUp) {
            last.showCard();
        }

        removedCards.forEach(c => {
            c.element.style.visibility = "";  
            targetPile.addCard(c);
        });

        this.moveHistory.push({cards: removedCards, from: fromPile, to: targetPile});
        fromPile.render();
        targetPile.render();

        this.selectedCards = null;
        this.moves++;
        document.getElementById("moves").textContent = this.moves;
        this.checkWin();
        return true;
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval); 
        this.seconds = 0;
        this.minutes = 0;
        this.timerElement = document.getElementById("timer");

        this.timerInterval = setInterval(() => {
            this.seconds++;
            if (this.seconds >= 60) {
                this.seconds = 0;
                this.minutes++;
            }
            const secStr = this.seconds < 10 ? '0' + this.seconds : this.seconds;
            const minStr = this.minutes;
            if (this.timerElement) this.timerElement.textContent = `${minStr}:${secStr}`;
        }, 1000);
    }

}

class Card{
    constructor(suit,rank){
        this.suit = suit;
        this.rank = rank;
        this.faceUp=false;
        this.element = null;
        this.parentPile = null;
        this.render();
        //when we press on a card and its face up we pass the mouse event e, the card, and pile.
        this.element.addEventListener("mousedown", (e) => {
            if (this.faceUp) {
                game.startDrag(e, this, this.parentPile);
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
    constructor(element){
        this.cards=[];
        this.element= element;
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

        c.element.style.position = "";
        c.element.style.top = "";
        c.element.style.left = "";
        c.element.style.zIndex = "";
        this.element.appendChild(c.element);
        });
    }
}

class Tableau extends Pile{

    canAdd(card){
        const top = this.topCard();
        if (!top){
            return card.rank === "K";
        }
        return top.isRed() !== card.isRed() && card.rankValue() === top.rankValue() - 1;
    }
    render() {
        this.element.innerHTML = "";
        this.cards.forEach((c, i) => {
        c.render();
        
        c.element.style.position = "absolute";
        c.element.style.left = "0px";
        c.element.style.top = (i * 25) + "px";
        c.element.style.zIndex = i;
        this.element.appendChild(c.element);
        });
    }
}

class Foundation extends Pile{
    canAdd(card){
    const top = this.topCard();
    if (!top){
        return card.rank === "A";
    }
    return top.suit === card.suit && card.rankValue() === top.rankValue() + 1;
    }
    render() {
        this.element.innerHTML = "";
        if (this.cards.length > 0) {
        const top = this.topCard();
        top.render();

        top.element.style.position = "absolute";
        top.element.style.left = "0px";
        top.element.style.top = "0px";
        top.element.style.zIndex = 0;
        this.element.appendChild(top.element);
        }
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
    canAdd(){
        return false;
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
    
    render() {
        this.element.innerHTML = "";

        if (this.cards.length > 0) {
            const top = this.topCard();
            top.render();
            top.element.style.position = "absolute";
            top.element.style.left = "0px";
            top.element.style.top = "0px";
            top.element.style.zIndex = this.cards.length;
            this.element.appendChild(top.element);
        } else {
            const recycle = document.createElement("div");
            recycle.style.width = "100%";
            recycle.style.height = "100%";
            recycle.style.display = "flex";
            recycle.style.justifyContent = "center";
            recycle.style.alignItems = "center";
            recycle.style.fontSize = "28px";
            recycle.style.color = "white";
            recycle.textContent = "<->"; 
            this.element.appendChild(recycle);
        }
    }
}


class Waste extends Pile {
    canAdd() { 
    return false; 
    }
    render() {
    this.element.innerHTML = "";
    if (this.cards.length > 0) {
      const top = this.topCard();
      top.render();
      top.element.style.position = "absolute";
      top.element.style.left = "0px";
      top.element.style.top = "0px";
      top.element.style.zIndex = 0;
      this.element.appendChild(top.element);
    }
  }
}

const game = new Game();
game.start();
game.startTimer();
const restartBtn=document.getElementById("restart")
restartBtn.addEventListener("click", ()=>{
    game.restart();
    game.startTimer();
})

const undoBtn=document.getElementById("undo")
undoBtn.addEventListener("click", ()=>{
    game.undo();
})