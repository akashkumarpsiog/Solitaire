
const restartButton = document.getElementById("restart");
const scoreDisplay= document.getElementById("score");

restartButton.addEventListener("click", () =>{
    scoreDisplay.innerHTML= 0;
})

const suits = ["hearts", "diamonds", "clubs", "spades"];
const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
// of is for values, in is for index.
function createDeck() {
    const deck=[];
    for (let suit of suits){
        for(let rank of ranks){
            deck.push({suit, rank})
        }
    }
    return deck;
}
function shuffle(deck){
    return deck.sort(()=> Math.random() -0.5)
}

function createCardElement(card, faceUp = false){
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");
    if (faceUp){
        cardDiv.classList.add("face-up");
        cardDiv.textContent = card.rank + " "+ getSuitSymbol(card.suit);
    }
    else {
        cardDiv.classList.add("face-down");
    }
    if (card.suit === "hearts" || card.suit ==="diamonds"){
        cardDiv.style.color = "red";
    }
    else {
        cardDiv.style.color = "black";
    }
    return cardDiv;
}

function getSuitSymbol(suit) {
  switch (suit) {
    case "hearts":   return "\u2665"; // heart
    case "diamonds": return "\u2666"; // diamond
    case "clubs":    return "\u2663"; // clubs
    case "spades":   return "\u2660"; // spade
  }
}


