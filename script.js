/* globals interact, cards */

let tableCards = {}
let currentCard = 0

document.addEventListener("DOMContentLoaded", function(event) {
  shuffleArray(cards);

  mkTableCards();

  const openExplainer = document.getElementById("open-explainer")
  const closeExplainer = document.getElementsByClassName("explainer-button")[0]
  closeExplainer.addEventListener('click', e => {
    const explainer = document.getElementById("explainer")
    explainer.style.display = "none"
    openExplainer.style.display = "block"
  })
  openExplainer.addEventListener('click', e => {
    const explainer = document.getElementById("explainer")
    explainer.style.display = "block"
    openExplainer.style.display = "none"
  })

  const explainerOpt1 = document.getElementById("cs")
  const explainerOpt2 = document.getElementById("waite")

  const inputs = document.getElementsByTagName("input");
  for (var i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener('change', e => {
          const selected = document.querySelector('input[name="interpretation"]:checked');
          if (selected.id == e.target.id) {
            displayExplanation(e.target.value)
          }
      });
  }

  document.addEventListener('focus', e => {
    if (document.activeElement.classList.contains("card")) {
      selectCard(document.activeElement.id)
    }
  }, true)

  const table = document.getElementById("table-cards")

  initializeDeck(table);

  window.addEventListener("keydown", e => {
    const selected = document.activeElement
    const isCard = selected.classList.contains("card")
    if (isCard) {
      if (e.code == "Space") {
        moveToTop(selected.id)
        e.preventDefault()
      }
      if (!(['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].indexOf(e.code) == -1)){
        if (!selected.classList.contains('floating')) { selected.classList.add('floating') }
        selected.style.transition = "transform 0.25s"
        if (e.code == "ArrowRight") {
          moveCard(1,0)
        }
        if (e.code == "ArrowLeft") {
          moveCard(-1,0)
        }
        if (e.code == "ArrowUp") {
          moveCard(0,-1)
        }
        if (e.code == "ArrowDown") {
          moveCard(0,1)
        }
        e.preventDefault()
      }

      if (!(['KeyF', 'KeyR', 'KeyL'].indexOf(e.code) == -1)){
        if (e.code == "KeyF") {
          flipCard(selected, selected.id)
        }
        if (e.code == "KeyL") {
          rotateCard(selected.id, "left")
        }
        if (e.code == "KeyR") {
          rotateCard(selected.id, "right")
        }
      }
    }
  })

  window.addEventListener("keyup", e => {
    const selected = document.activeElement
    if (selected.classList.contains("card")) {
      if (!(['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].indexOf(e.code) == -1)){
        selected.classList.remove("floating")
        tableCards[selected.id].velocity = 0;
        selected.addEventListener("transitionend", e => {
          e.target.style.transition = "none";
        })
        e.preventDefault()
      }
    }
  })
});

function moveCard(dx, dy, max) {
  const selected = document.activeElement
  const cardId = selected.id
  const card = tableCards[cardId]
  if (selected.classList.contains("deck-card")) {
    moveFromDeckToTable(selected, card)
  }

  if (Math.abs(card.velocity) < ( max || 50)) { card.velocity += Math.abs(dx) * 5 }
  if (Math.abs(card.velocity) < ( max || 50)) { card.velocity += Math.abs(dy) * 5 }

  card.x += card.velocity * dx;
  card.y += card.velocity * dy;

  card.node.style.transform = toTransform(card)
}

function displayExplanation(cardId, interpretation) {
  if (cardId) {
    const selectedCard = tableCards[cardId]

    if (selectedCard && selectedCard.visible == "front") {
      const placeholder = document.getElementsByClassName("explanation-placeholder")[0]
      placeholder.style.display = "none"

      const map = {
        "cs": {
          positiveTitle: "Positive",
          negativeTitle: "Negative",
          positive: selectedCard["cspositive"],
          negative: selectedCard["csnegative"]
        },
        "waite": {
          positiveTitle: "Upright",
          negativeTitle: "Reversed",
          positive: selectedCard["waiteregular"],
          negative: selectedCard["waitereversed"]
        },
      }

      let main = document.querySelector(".explanation-main")
      main.style.display = "block"
      main.scrollTop = 0;

      let title = document.querySelector(".explainer-title")
      title.innerText = "Divinatory Text: " + selectedCard["title"]

      let negativeh = document.querySelector(".explanation-negative h1")
      negativeh.innerText = map[interpretation].negativeTitle

      let positivep = document.querySelector(".explanation-positive p")
      positivep.innerText = map[interpretation].positive
      let negativep = document.querySelector(".explanation-negative p")
      negativep.innerText = map[interpretation].negative
    } else {
      let title = document.querySelector(".explainer-title")
      title.innerText = "Divinatory Text"

      const placeholder = document.getElementsByClassName("explanation-placeholder")[0]
      placeholder.style.display = "block"

      let main = document.querySelector(".explanation-main")
      main.style.display = "none"
    }
  } else {
    let title = document.querySelector(".explainer-title")
    title.innerText = "Divinatory Text"

    const placeholder = document.getElementsByClassName("explanation-placeholder")[0]
    placeholder.style.display = "block"

    let main = document.querySelector(".explanation-main")
    main.style.display = "none"
  }
}


function mkTableCards () {
  cards.forEach((c, i) => {
    const cardId = c["label"].toLowerCase().replace(/[^a-z]/g, "")
    const orientation = [0, 180][Math.floor(Math.random() * 2)];

    tableCards[cardId] = {
      "id": cardId,
      "x": 0, "y": 0,
      "velocity": 0,
      "title": c.label,
      "orientation": orientation,
      "image": c.image,
      "number": c.number,
      "visible": "back",
      "drawn": false,
      "cspositive": c.cspositive,
      "csnegative": c.csnegative,
      "waiteregular": c.waiteregular,
      "waitereversed": c.waitereversed,
      "shortdesc": c.shortdesc }
  })
}

function moveToTop(cardId) {
  let card = document.getElementById(cardId);
  let table = document.getElementById("table-cards");

  // check if already on top
  if (table.children.length > 0) {
    if (table.children[table.children.length - 1].id == cardId) {
      return false
    }
  }

  // remove card from table
  card.remove()

  // add it back to the table
  table.appendChild(card);
  card.focus()
}

function selectCard(cardId) {
  // display interpretation of card
  const selected = document.querySelector('input[name="interpretation"]:checked');
  displayExplanation(cardId, selected.value)
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function createCard(card) {
  let cardNode = document.getElementById("card-template").cloneNode(true)

  const cardId = card["label"].toLowerCase().replace(/[^a-z]/g, "")
  let deckCard = tableCards[cardId]

  cardNode.id = deckCard["id"]
  cardNode.className = "card draggable deck-card"

  let innerDiv = cardNode.querySelector(".inner-card")
  innerDiv.style.transform = toRotate(deckCard.orientation)

  innerDiv.appendChild(mkRotateLeft(cardId))
  innerDiv.appendChild(mkRotateRight(cardId))
  innerDiv.appendChild(mkFlip(cardId))

  innerDiv.addEventListener("click", e => {
    e.preventDefault()

    let cardId = e.target.parentElement.id || e.target.parentElement.parentElement.id // second is if image was clicked, le sigh

    if (!cardId) { return false }
    moveToTop(cardId)
    return false;
  })

  let img = cardNode.querySelector("img")
  img.src = deckCard.image;
  img.alt = deckCard.shortdesc

  img.addEventListener("click", e => false )

  tableCards[cardId].drawn = true
  tableCards[cardId].node = cardNode
  return cardNode
}

function mkFlip(cardId) {
  let btn = document.createElement("button")
  btn.className = "button flip"
  const textnode = document.createTextNode("↑");
  btn.appendChild(textnode)

  btn.addEventListener("click", e => {
    e.preventDefault();
    const cardNode = e.target.parentElement
    flipCard(cardNode, cardId)
    return false;
  })
  return btn
}

function flipCard(cardNode, cardId) {
  if (tableCards[cardId].visible == "back") {
    tableCards[cardId].visible = "front"
    cardNode.querySelector("img").style.display = "block";
    setTimeout(() => {
      // not sure why we have to do this - otherwise transition doesn't work
      cardNode.querySelector("img").style.opacity = "100%";
    }, 1)
    cardNode.querySelector('.flip').innerText= "↓"

    const selected = document.querySelector('input[name="interpretation"]:checked');
    displayExplanation(cardId, selected.value)
  } else {
    tableCards[cardId].visible = "back"
    cardNode.querySelector("img").style.opacity = "0%";
    setTimeout(() => {
      // wait for transition to end before removing img
      cardNode.querySelector("img").style.display = "none";
    }, 500)
    cardNode.querySelector('.flip').innerText = "↑"
  }
  setTitle(tableCards[cardId])
}

function setTitle(card){
  const position = toPosition(card.orientation)

  if (card.visible == "back") {
    card.node.querySelector("h3").innerText = "A card " + position
  } else {
    const cardNumber = card.number
    const cardTitle = card.title
    const cardTitleWithNumber = cardNumber == "" ? cardTitle : cardNumber + ". " + cardTitle
    card.node.querySelector("h3").innerText = card.title + " " + position
  }
}

// * Rotation *//
function mkRotateLeft(cardId) {
  let btn = document.createElement("button")
  btn.className = "button rotateLeft"
  const textnode = document.createTextNode("←");
  btn.appendChild(textnode)

  btn.addEventListener("click", e => {
    rotateCard(cardId, "left")
    e.preventDefault();
    return false;
  })
  return btn
}

function mkRotateRight(cardId) {
  let btn = document.createElement("button")
  btn.className = "button rotateRight"
  const textnode = document.createTextNode("→");
  btn.appendChild(textnode)

  btn.addEventListener("click", e => {
    rotateCard(cardId, "right")
    e.preventDefault();
    return false;
  })
  return btn
}

function rotateCard(cardId, direction) {
  const card = tableCards[cardId]
  if (direction == "left") {
    card.orientation = rotateLeft(card.orientation)
  } else {
    card.orientation = rotateRight(card.orientation)
  }
  card.node.style.transform = toTransform(card)
  card.node.children[0].style.transform = toRotate(card.orientation)
  setTitle(card)
}

function toPosition (orientation) {
  const actualOrientation = Math.abs(orientation % 360);
  if (actualOrientation == 0) {
    return ""
  }
  if (actualOrientation == 90) {
    return "rotated right"
  }
  if (actualOrientation == 180) {
    return "reversed"
  }
  return "rotated left"
}

function shadow (orientation) {
  const actualOrientation = Math.abs(orientation % 360);
  if (actualOrientation == 0) {
    return "10px 5px 10px #666666"
  }
  if (actualOrientation == 90) {
    return "10px -5px 10px #666666"
  }
  if (actualOrientation == 180) {
    return "-10px -5px 10px #666666"
  }
  return "-10px 5px 10px #666666"
}

function toTransform (card) {
  return `translate(${card.x}px, ${card.y}px)`
}

function toRotate (orientation) {
  return "rotate(" + orientation + "deg)"
}

function rotateRight(orientation) {
  return orientation + 90
}

function rotateLeft(orientation) {
  return orientation - 90
}
//* END Rotation *//

function initializeDeck(table) {
  const holder = document.getElementById("table-cards")
  const newCard = createCard(cards[currentCard])
  if (currentCard <= cards.length) {
    currentCard = currentCard + 1
  } else {
    console.log("no more cards")
  }
  /*const newCard2 = createCard(cards[currentCard])
  newCard2.tabIndex = 2
  if (currentCard <= cards.length) {
    currentCard = currentCard + 1
  } else {
    console.log("no more cards")
  }*/
  holder.appendChild(newCard)
  //holder.appendChild(newCard2)
}

function moveFromDeckToTable(cardNode, card) {
  const scrollY = window.scrollY
  const scrollX = window.scrollX
  card.y += scrollY
  card.x += scrollX

  cardNode.classList.remove("deck-card")
  const titleNode = cardNode.querySelector("h3")
  if (titleNode.innerText == "The top card on the deck") {
    setTitle(card)
  }

  const deckCards = document.getElementsByClassName("deck-card")
  if (deckCards.length < 1) {
    if (currentCard <= cards.length) {
      const newCard = createCard(cards[currentCard])
      currentCard = currentCard + 1
      let table = document.getElementById("table-cards")
      table.appendChild(newCard)
    } else {
      console.log("no more cards")
    }
  }
}

/* Interact drag-and-drop */
interact('.draggable').draggable({
  listeners: {
    start (event) {
      const card = tableCards[event.target.id]
      if (event.target.classList.contains("deck-card")) {
        moveFromDeckToTable(event.target, card)
      }
      event.target.className += " floating"
      event.target.children[0].style["box-shadow"] = shadow(card.orientation)
    },
    move (event) {
      const targetId = event.target.id
      let card = tableCards[targetId]

      card.x += event.dx
      card.y += event.dy

      event.target.style.transform = toTransform(card)
    },
    end (event) {
      const classes = event.target.className
      const newClasses = classes.split(" ").filter(c => c !== "floating").join(" ")
      event.target.className = newClasses
      event.target.children[0].style["box-shadow"] = "none"
    },
  }
})
/* END Interact drag-and-drop */