/* globals interact, cards */

let tableCards = {}
let currentCard = 0

document.addEventListener("DOMContentLoaded", function(event) {
  shuffleArray(cards);
    
  mkTableCards();
  
  const explainer = document.getElementById("")
  const explainerOpt1 = document.getElementById("cs")
  const explainerOpt2 = document.getElementById("waite")
 /*
  var rad = document.getElementsByTagName("input")
  var prev = null;
  for (var i = 0; i < rad.length; i++) {
      rad[i].addEventListener('change', function() {
          //const selected = document.querySelector('input[name="interpretation"]:checked').value;
          if (selected.id == rad[i].id) { 
          interpretation
          } 
          (prev) ? console.log(prev.value): null;
          if (this !== prev) {
              prev = this;
          }
          console.log(this.value)
      });
  }*/
  
  const table = document.getElementById("table")

  initializeDeck(table);
});

function mkTableCards () {
  cards.forEach((c, i) => {
    const cardId = c["label"].toLowerCase().replace(/[^a-z]/g, "")
    const orientation = [0, 180][Math.floor(Math.random() * 2)];
    
    tableCards[cardId] = { 
      "id": cardId, 
      "x": 0, "y": 0, 
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
  
  console.log("card", cardId, card)
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
      console.log("removed", thisCardId)
      table.removeChild(cards[i]);
    }
  }

  // select card and add it back to the table
  console.log("parent id:", card.parentElement ? card.parentElement.id: "no parent")
  card.children[0].className = "innerCard selected"
  table.appendChild(card);
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
    //console.log("click target", e.target.id, e.target.parentElement.id)
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
  console.log("or", actualOrientation)
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
          console.log("more")
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
      console.log("classes",classes, newClasses)
      event.target.className = newClasses
      event.target.children[0].style["box-shadow"] = "none"
    },
  }
})