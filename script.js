/* globals interact, cards */

let tableCards = {}
let selectedCard = false

document.addEventListener("DOMContentLoaded", function(event) {
  shuffleArray(cards)
  mkTableCards()
  drawCard()
  setUpExplainer()

  document.addEventListener('focus', onFocus, true)
  window.addEventListener("keydown", onKeyDown)
  window.addEventListener("keyup", onKeyUp)
});

function onFocus(e) {
  const selected = document.activeElement
  if (selected.classList.contains("card")) {
    selectedCard = tableCards[selected.id]
    const interpretation = document.querySelector('input[name="interpretation"]:checked');
    displayExplanation(interpretation.value)
  }
}

function onKeyDown(e) {
  const selected = document.activeElement
  const isCard = selected.classList.contains("card")
  if (isCard) {
    const card = tableCards[selected.id]
    if (e.code == "Space") {
      card.moveToTop()
      e.preventDefault()
    }
    if (!(['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].indexOf(e.code) == -1)){
      card.handleMovement(e.code)
      replenishDeck()
      e.preventDefault()
    }

    if (!(['KeyF', 'KeyR', 'KeyL'].indexOf(e.code) == -1)){
      card.handleControls(e.code)
    }
  }
}

function onKeyUp(e) {
  const selected = document.activeElement
  if (selected.classList.contains("card")) {
    if (!(['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].indexOf(e.code) == -1)){
      selected.classList.remove("floating")
      const card = tableCards[selected.id]
      card.velocity = 0;
      selected.addEventListener("transitionend", e => {
        removeTransition(selected, "transform")
      })
      e.preventDefault()
    }
  }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function mkTableCards () {
  cards.forEach((c, i) => {
    const cardId = c["label"].toLowerCase().replace(/[^a-z]/g, "")
    tableCards[cardId] = new Card(c)
  })
}

function drawCard() {
  if (cards.length > 0) {
    const card = cards.pop()
    const cardId = card["label"].toLowerCase().replace(/[^a-z]/g, "")
    tableCards[cardId].createNode()
  } else {
    console.log("no more cards")
  }
}

function replenishDeck () {
  const deckCards = document.getElementsByClassName("deck-card")
  if (deckCards.length < 1) {
    drawCard()
  }
}

interact('.draggable').draggable({
  listeners: {
    start (event) {
      const card = tableCards[event.target.id]
      if (event.target.classList.contains("deck-card")) {
        card.moveFromDeckToTable()
        replenishDeck()
      }
      event.target.classList.add("floating")
      event.target.children[0].style["box-shadow"] = card.orientation.shadow
    },
    move (event) {
      const targetId = event.target.id
      let card = tableCards[targetId]

      card.x += event.dx
      card.y += event.dy

      event.target.style.transform = card.toTransform
    },
    end (event) {
      event.target.classList.remove("floating")
      event.target.children[0].style["box-shadow"] = "none"
    },
  }
})

/* EXPLAINER */
function setUpExplainer() {
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
            displayExplanation()
          }
      });
  }
}

function displayExplanation() {
  if (selectedCard && selectedCard.visible == "front") {
    const placeholder = document.getElementsByClassName("explanation-placeholder")[0]
    placeholder.style.display = "none"
    const interpretationNode = document.querySelector('input[name="interpretation"]:checked');
    const interpretation = interpretationNode.value

    const map = {
      "cs": {
        positiveTitle: "Positive",
        negativeTitle: "Negative",
        positive: selectedCard["csmeaning"],
        negative: selectedCard["csnegative"]
      },
      "waite": {
        positiveTitle: "Upright",
        negativeTitle: "Reversed",
        positive: selectedCard["waitemeaning"],
        negative: selectedCard["waitereversed"]
      },
    }

    let main = document.querySelector(".explanation-main")
    main.style.display = "block"
    main.scrollTop = 0;

    let title = document.querySelector(".explainer-title")
    title.innerText = "Divinatory Text: " + selectedCard["label"]

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
}

function clearExplanation () {
  let title = document.querySelector(".explainer-title")
  title.innerText = "Divinatory Text"

  const placeholder = document.getElementsByClassName("explanation-placeholder")[0]
  placeholder.style.display = "block"

  let main = document.querySelector(".explanation-main")
  main.style.display = "none"
}


function removeTransition (node, transition) {
  const trans = node.style.transition
  const transes = trans.split(" ")
  let kept = []
  for (i = 0; i < (transes.length/2); i = i+2) {
    if (transes[i] !== transition) {
      kept.push(transes[i])
      kept.push(transes[i+1])
    }
  }
  node.style.transition = kept.join(" ")
}