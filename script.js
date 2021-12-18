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

  const table = document.getElementById("table")

  initializeDeck(table);
});

function displayExplanation(interpretation) {
  const selectedCardNode = document.getElementsByClassName("selected")[0]
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

      let main = document.querySelector(".explanation-main")
      main.style.display = "block"

      let positiveh = document.querySelector(".explanation-positive h1")
      positiveh.innerText = map[interpretation].positiveTitle
      let negativeh = document.querySelector(".explanation-negative h1")
      negativeh.innerText = map[interpretation].negativeTitle

      let positivep = document.querySelector(".explanation-positive p")
      positivep.innerText = map[interpretation].positive
      let negativep = document.querySelector(".explanation-negative p")
      negativep.innerText = map[interpretation].negative
    } else {
      const placeholder = document.getElementsByClassName("explanation-placeholder")[0]
      placeholder.style.display = "block"

      let main = document.querySelector(".explanation-main")
      main.style.display = "none"
    }
  } else {
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
      "visible": "back",
      "drawn": false,
      "cspositive": c.cspositive,
      "csnegative": c.csnegative,
      "waiteregular": c.waiteregular,
      "waitereversed": c.waitereversed }
  })
}

function moveToTop(cardId) {
  var table = document.getElementById("table");
  var cards = document.getElementsByClassName("card");
  var card = document.getElementById(cardId);

  if (cardId == "table") { return false }

  if (card.parentElement.id == "camera") { return false }

  // clear selected from all children
  for (let i = 0; i < cards.length; i++) {
    cards[i].children[0].className = "innerCard"
  }

  // remove card from table
  for (let i = 0; i < cards.length; i++) {
    const thisCardId = cards[i].id

    if (thisCardId == cardId) {
      table.removeChild(cards[i]);
    }
  }

  // select card and add it back to the table
  card.children[0].className = "innerCard selected"
  table.appendChild(card);

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
  let cardNode = document.createElement("div")
  const cardId = card["label"].toLowerCase().replace(/[^a-z]/g, "")
  let deckCard = tableCards[cardId]
  cardNode.id = deckCard["id"]
  cardNode.className = "card draggable"

  let innerDiv = document.createElement("div")
  innerDiv.className = "innerCard"
  innerDiv.style.transform = toRotate(deckCard.orientation)
  cardNode.appendChild(innerDiv)

  innerDiv.appendChild(mkRotateLeft(cardId))
  innerDiv.appendChild(mkRotateRight(cardId))
  innerDiv.appendChild(mkFlip(cardId))

  innerDiv.addEventListener("click", e => { e.preventDefault()
    let cardId = e.target.parentElement.id
    if (cardId == "table") {
      cardId = e.target.id
    }
    if (!cardId) { return false }
    moveToTop(cardId)
    return false;
  })


  tableCards[cardId].drawn = true
  tableCards[cardId].node = cardNode
  return cardNode
}


function mkFlip(cardId) {
  let div = document.createElement("div")
  div.className = "button flip"
  const textnode = document.createTextNode("↑");
  div.appendChild(textnode)

  div.addEventListener("click", e => {
    e.preventDefault();
    const cardNode = e.target.parentElement
    if (tableCards[cardId].visible == "back") {
      tableCards[cardId].visible = "front"
      cardNode.style["background-color"] = "white"
      cardNode.style["background-image"] = "url('" + tableCards[cardId].image + "')"
      cardNode.style["background-size"] = "185px"
      e.target.innerText= "↓"

      const selected = document.querySelector('input[name="interpretation"]:checked');
      displayExplanation(selected.value)
    } else {
      tableCards[cardId].visible = "back"
      cardNode.style["background-color"] = ""
      cardNode.style["background-image"] = ""
      cardNode.style["background-size"] = ""
      e.target.innerText = "↑"
    }
    return false;
  })
  return div
}

function mkRotateLeft(cardId) {
  let div = document.createElement("div")
  div.className = "button rotateLeft"
  const textnode = document.createTextNode("←");
  div.appendChild(textnode)

  div.addEventListener("click", e => {
    e.preventDefault();

    tableCards[cardId].orientation = rotateLeft(tableCards[cardId].orientation)
    tableCards[cardId].node.style.transform = toTransform(tableCards[cardId])
    tableCards[cardId].node.children[0].style.transform = toRotate(tableCards[cardId].orientation)

    return false;
  })
  return div
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
  let div = document.createElement("div")
  div.className = "button rotateRight"
  const textnode = document.createTextNode("→");
  div.appendChild(textnode)

  div.addEventListener("click", e => {
    e.preventDefault();
    const orientation = rotateRight(tableCards[cardId].orientation)
    tableCards[cardId].orientation = orientation

    tableCards[cardId].node.style.transform = toTransform(tableCards[cardId], orientation.deg)
    tableCards[cardId].node.children[0].style.transform = toRotate(orientation)

    return false;
  })
  return div
}

function rotateRight(orientation) {
  return orientation + 90
}

function initializeDeck(table) {
  const deck = document.getElementsByClassName("deck")[0]
  const camera = document.getElementById("camera")
  deck.addEventListener("click", e => {
    const newCard = createCard(cards[currentCard])
    if (currentCard <= cards.length) {
      currentCard = currentCard + 1
    } else {
      console.log("no more cards")
    }
    const newCard2 = createCard(cards[currentCard])
    if (currentCard <= cards.length) {
      currentCard = currentCard + 1
    } else {
      console.log("no more cards")
    }
    camera.appendChild(newCard)
    camera.appendChild(newCard2)
  });
}

interact('.draggable').draggable({
  listeners: {
    start (event) {
      const card = tableCards[event.target.id]
      if (event.target.parentElement.id == "camera") {
        let camera = document.getElementById("camera")
        let table = document.getElementById("table")
        camera.removeChild(event.target)
        table.appendChild(event.target)

        const scrollY = window.scrollY
        const scrollX = window.scrollX
        card.y += scrollY
        card.x += scrollX

        if (camera.children.length < 2) {
          if (currentCard <= cards.length) {
            const newCard = createCard(cards[currentCard])
            currentCard = currentCard + 1
            camera.appendChild(newCard)
          } else {
            console.log("no more cards")
          }
        }
      }
      event.target.className += " floating"
      event.target.children[0].style["box-shadow"] = shadow(card.orientation)
    },
    move (event) {
      const targetId = event.target.id
      let card = tableCards[targetId]

      const scrollY = window.scrollY

      card.x += event.dx
      card.y += event.dy // add scroll distance to this!!

      tableCards[targetId].x = card.x
      tableCards[targetId].y = card.y

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