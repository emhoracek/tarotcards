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

  const table = document.getElementById("table-cards")

  initializeDeck(table);

  window.addEventListener("keydown", e => {
    console.log("press", e.code)
    const selected = document.activeElement
    console.log(selected)
    if (selected.className.includes("card")) {
      if (e.code == "Space") {
          const cardId = selected.id
          selectCard(cardId)
          e.preventDefault()
      }
      console.log(['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].indexOf(e.code))
      if (!(['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].indexOf(e.code) == -1)){
        selected.className += " floating"
        if (e.code == "ArrowRight") {
          moveCard(15,0)
        }
        if (e.code == "ArrowLeft") {
          moveCard(-15,0)
        }
        if (e.code == "ArrowUp") {
          moveCard(0,-15)
        }
        if (e.code == "ArrowDown") {
          moveCard(0,15)
        }
        e.preventDefault()
      }
    }
  })

  window.addEventListener("keyup", e => {
    console.log(['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].indexOf(e.code))
    if (!(['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].indexOf(e.code) == -1)){
      const selected = document.activeElement
      const newClasses = selected.className.split(" ").filter(c => c !== "floating").join(" ")
      selected.className = newClasses
      e.preventDefault()
    }
  })
});

function moveCard(dx, dy) {
  const selected = document.activeElement
  const cardId = selected.id
  console.log(selected, cardId)
  const card = tableCards[cardId]
  if (selected.parentElement.id == "deck-cards") {
    moveFromDeckToTable(selected, card)
  }
  card.x += dx;
  card.y += dy

  card.node.focus()
  card.node.style.transform = toTransform(card)
}

function displayExplanation(interpretation) {
  const selectedCardNode = document.querySelector(".card:focus-within")
  if (selectedCardNode) {
    const selectedCard = tableCards[selectedCardNode.parentElement.id]

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
  var table = document.getElementById("table-cards");
  var deck = document.getElementById("deck-cards");
  var tableCard = table.querySelector("#" + cardId);
  var deckCard = deck.querySelector("#" + cardId);
  var card = tableCard || deckCard
  var parent = tableCard ? table : deck

  // check if already on top
  if (parent.children[parent.children.length - 1].id == card.id) {
    return false
  }

  if (cardId == "table") { return false }
  if (card.parentElement.id == "deck-cards") { return false }

  // remove card from table
  for (let i = 0; i < cards.length; i++) {
    const thisCardId = cards[i].id

    if (thisCardId == cardId) {
      parent.removeChild(cards[i]);
    }
  }

  // add it back to the table
  parent.appendChild(card);
}

function selectCard(cardId) {
  // display interpretation of card
  const selected = document.querySelector('input[name="interpretation"]:checked');
  displayExplanation(selected.value)
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
  cardNode.className = "card draggable"

  let innerDiv = cardNode.querySelector(".inner-card")
  innerDiv.style.transform = toRotate(deckCard.orientation)

  innerDiv.appendChild(mkRotateLeft(cardId))
  innerDiv.appendChild(mkRotateRight(cardId))
  innerDiv.appendChild(mkFlip(cardId))

  innerDiv.addEventListener("click", e => {
    e.preventDefault()

    let cardId = e.target.parentElement.id || e.target.parentElement.parentElement.id
    if (cardId == "table") {
      cardId = e.target.id
    }
    if (!cardId) { return false }
    selectCard(cardId)
    moveToTop(cardId)
    document.getElementById(cardId).focus()
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
    if (tableCards[cardId].visible == "back") {
      tableCards[cardId].visible = "front"
      cardNode.querySelector("img").style.display = "block";
      setTimeout(() => {
        // not sure why we have to do this - otherwise transition doesn't work
        cardNode.querySelector("img").style.opacity = "100%";
      }, 1)
      e.target.innerText= "↓"

      const selected = document.querySelector('input[name="interpretation"]:checked');
      displayExplanation(selected.value)
    } else {
      tableCards[cardId].visible = "back"
      cardNode.querySelector("img").style.opacity = "0%";
      setTimeout(() => {
        // wait for transition to end before removing img
        cardNode.querySelector("img").style.display = "none";
      }, 1000)
      e.target.innerText = "↑"
    }
    setTitle(tableCards[cardId])
    return false;
  })
  return btn
}

function setTitle(card){
  const position = toPosition(card.orientation)

  if (card.visible == "back") {
    card.node.querySelector("h4").innerText = "A card " + position
  } else {
    const cardNumber = card.number
    const cardTitle = card.title
    const cardTitleWithNumber = cardNumber == "" ? cardTitle : cardNumber + ". " + cardTitle
    card.node.querySelector("h4").innerText = card.title + " " + position
  }
}

function mkRotateLeft(cardId) {
  let btn = document.createElement("button")
  btn.className = "button rotateLeft"
  const textnode = document.createTextNode("←");
  btn.appendChild(textnode)

  btn.addEventListener("click", e => {
    console.log("rotate", cardId, e.target)
    tableCards[cardId].orientation = rotateLeft(tableCards[cardId].orientation)
    tableCards[cardId].node.style.transform = toTransform(tableCards[cardId])
    tableCards[cardId].node.children[0].style.transform = toRotate(tableCards[cardId].orientation)
    setTitle(tableCards[cardId])

    e.preventDefault();
    return false;
  })
  return btn
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

function rotateLeft(orientation) {
  return orientation - 90
}

function mkRotateRight(cardId) {
  let btn = document.createElement("button")
  btn.className = "button rotateRight"
  const textnode = document.createTextNode("→");
  btn.appendChild(textnode)

  btn.addEventListener("click", e => {
    e.preventDefault();
    const orientation = rotateRight(tableCards[cardId].orientation)
    tableCards[cardId].orientation = orientation

    tableCards[cardId].node.style.transform = toTransform(tableCards[cardId], orientation.deg)
    tableCards[cardId].node.children[0].style.transform = toRotate(orientation)
    setTitle(tableCards[cardId])

    return false;
  })
  return btn
}

function rotateRight(orientation) {
  return orientation + 90
}

function initializeDeck(table) {
  const holder = document.getElementById("deck-cards")
  const newCard = createCard(cards[currentCard])
  if (currentCard <= cards.length) {
    currentCard = currentCard + 1
  } else {
    console.log("no more cards")
  }
  const newCard2 = createCard(cards[currentCard])
  newCard2.tabIndex = 2
  if (currentCard <= cards.length) {
    currentCard = currentCard + 1
  } else {
    console.log("no more cards")
  }
  holder.appendChild(newCard)
  holder.appendChild(newCard2)
}

function moveFromDeckToTable(cardNode, card) {
  let holder = document.getElementById("deck-cards")
  let table = document.getElementById("table-cards")
  holder.removeChild(cardNode)
  table.appendChild(cardNode)

  const scrollY = window.scrollY
  const scrollX = window.scrollX
  card.y += scrollY
  card.x += scrollX

  document.querySelector(".no-cards").style.display = "none";

  if (holder.children.length < 2) {
    if (currentCard <= cards.length) {
      const newCard = createCard(cards[currentCard])
      currentCard = currentCard + 1
      holder.appendChild(newCard)
    } else {
      console.log("no more cards")
    }
  }
}




interact('.draggable').draggable({
  listeners: {
    start (event) {
      const card = tableCards[event.target.id]
      if (event.target.parentElement.id == "deck-cards") {
        moveFromDeckToTable(event.target, card)
      }
      event.target.className += " floating"
      event.target.children[0].style["box-shadow"] = shadow(card.orientation)
    },
    move (event) {
      const targetId = event.target.id
      let card = tableCards[targetId]

      const scrollY = window.scrollY

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