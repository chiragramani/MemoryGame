/*
 * Create a list that holds all of your cards
 */
let cardContents =
    ['fa-diamond', 'fa-paper-plane-o', 'fa-anchor', 'fa-bolt',
        'fa-cube', 'fa-anchor', 'fa-leaf', 'fa-bicycle',
        'fa-diamond', 'fa-bomb', 'fa-leaf', 'fa-bomb', 'fa-bolt',
        'fa-bicycle', 'fa-paper-plane-o', 'fa-cube'];

let openedCards = [];
let pairedCards = [];
let numberOfMoves = 0;
let isFirstCardClick = true;
let gameTime, gameTimer = 0;
/*
 * Display the cards on the page
 *   - shuffle the list of cards using the provided "shuffle" method below
 *   - loop through each card and create its HTML
 *   - add each card's HTML to the page
 */

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function resetGame() {
    /// Resetting the properties.
    openedCards = [];
    pairedCards = [];
    isFirstCardClick = true;
    resetMoves();
    removeTimer();
    /// Shuffling cards.
    cardContents = shuffle(cardContents);
    /// Shuffle visible listing.
    removeOldListItems();
    shuffleCardListings();
    updateRatingIfNeededForCount(3);
}
// https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript
function removeOldListItems() {
    const myNode = document.querySelector(".deck");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
}

function shuffleCardListings() {
    const fragment = document.createDocumentFragment();
    for (const [index, content] of cardContents.entries()) {
        let card = document.createElement('li');
        card.className = 'card';
        card.innerHTML = `<i class="fa ${cardContents[index]}"></i>`;
        fragment.appendChild(card)
    }
    const deck = document.querySelector('.deck');
    deck.appendChild(fragment);
}


/*
 * set up the event listener for a card. If a card is clicked:
 *  - display the card's symbol (put this functionality in another function that you call from this one)
 *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
 *  - if the list already has another card, check to see if the two cards match
 *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
 *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
 *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
 *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
 */

function addCardClickListener() {
    const deck = document.querySelector('.deck');
    deck.addEventListener('click', function (event) {
        /// Looking for only card click events.
        if (event.target.nodeName === 'LI') {
            const card = event.target;
            didTapOnCard(card);
        }
        /// Ignoring other click events.
    });
}

function didTapOnCard(card) {
    if (isFirstCardClick) {
        setupTimer();
        isFirstCardClick = false;
    }
    incrementMoves();
    if (openedCards.length === 0) {
        /// First card of the pair.
        openedCards.push(card);
        openAndShowCard(card);
    } else {
        openAndShowCard(card);
        /// Second card of the pair.
        const firstOpenedCard = openedCards[0];
        /// Checking if there is a pair match.
        if (areCardsEqual(firstOpenedCard, card)) {
            matchCards(firstOpenedCard, card);
            openedCards = [];
        } else {
            setTimeout(function () {
                hideCards(firstOpenedCard, card);
            }, 500);
            openedCards = [];
        }
        /// Checking if all cards are matched to each other.
        if (areAllCardsPaired()) {
            stopTimer();
            showYouWonModalPopup();
        }
    }
    updateRatings();
}

function areAllCardsPaired() {
    return pairedCards.length == cardContents.length;
}

function matchCards(card1, card2) {
    card1.classList.add('match');
    card2.classList.add('match');
    pairedCards.push(card1, card2);
}

function hideCards(...cards) {
    for (card of cards) {
        card.classList.remove('open', 'avoid-clicks', 'show');
    }
}

function resetMoves() {
    numberOfMoves = 0;
    const movesElement = document.querySelector('.moves');
    movesElement.innerHTML = numberOfMoves;
}

function incrementMoves() {
    numberOfMoves += 1;
    const movesElement = document.querySelector('.moves');
    movesElement.innerHTML = numberOfMoves;
}

function areCardsEqual(card1, card2) {
    return card1.firstElementChild.classList[1] === card2.firstElementChild.classList[1];
}

function openAndShowCard(card) {
    /// Opening and showing the card if not already shown.
    if (card.classList.contains('open') == false) {
        card.classList.add('open', 'show', 'avoid-clicks');
    }
}

function addResetListener() {
    const restartElement = document.querySelector('.restart');
    restartElement.addEventListener('click', function () {
        resetGame();
    });
}

document.addEventListener('DOMContentLoaded', function (event) {
    resetGame();
    /// Add event listeners
    addCardClickListener();
    addResetListener();
});

// Timer

function setupTimer() {
    gameTimer = setInterval(function () {
        document.querySelector('.timer').innerHTML = `${gameTime} seconds`;
        gameTime += 1;
    }, 1000);
}

function removeTimer() {
    gameTime = 0;
    document.querySelector('.timer').innerHTML = '';
    clearInterval(gameTimer);
}

function stopTimer() {
    clearInterval(gameTimer);
    gameTime -= 1;
}

function updateRatings() {
    if (numberOfMoves <= 18) {
        updateRatingIfNeededForCount(3);
    } else if (numberOfMoves > 18 && numberOfMoves < 26) {
        updateRatingIfNeededForCount(2);
    } else {
        updateRatingIfNeededForCount(1);
    }
}

function getRatingStartHTML() {
    return '<li><i class="fa fa-star"></i></li>';
}

function showYouWonModalPopup() {
    const message = `With ${numberOfMoves} moves and ${gameTime} seconds`;
    swal({
        position: "center",
        title: "Congratulations! You won!",
        text: message,
        type: "success",
        confirmButtonColor: 'dfdcf5',
        confirmButtonText: "Play Again"
    }).then((result) => {
        if (result.value) {
            resetGame();
        }
    });
}

function updateRatingIfNeededForCount(count) {
    const stars = document.querySelector('.stars')
    const currentVisibleStarts = stars.children.length;
    const difference = count - currentVisibleStarts;
    if (difference > 0) {
        /// Add more stars
        for (const _ of Array(difference)) {
            stars.innerHTML += getRatingStartHTML();
        }
    } else if (difference < 0) {
        /// Remove starts
        const starElements = Array.from(stars.getElementsByTagName('li'));
        for (const [index, _] of Array(Math.abs(difference)).entries()) {
            starElements[index].remove();
        }
    } else {
        /// Do nothing
    }
}