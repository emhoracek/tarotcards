class Card {
  constructor (cardData) {
    this.id = cardData.label.toLowerCase().replace(/[^a-z]/g, "")
    this.label = cardData.label
    this.image = cardData.image
    this.number = cardData.number
    this.description = cardData.shortdesc

    // meanings
    this.csmeaning = cardData.cspositive
    this.csnegative = cardData.csnegative
    this.waitemeaning = cardData.waiteregular
    this.waitereversed = cardData.waitereversed

    // visual state
    this.x = 0
    this.y = 0
    this.velocity = 0
    this.visible = "back"
    this.orientation = new Orientation([0, 180][Math.floor(Math.random() * 2)])

    // node
    this.node = false
  }

  createNode () {
    let cardNode = document.getElementById("card-template").cloneNode(true)

    cardNode.id = this.id
    cardNode.className = "card draggable deck-card"

    let innerDiv = cardNode.querySelector(".inner-card")
    innerDiv.style.transform = this.orientation.toTransform

    // setup buttons
    this.setupRotate(cardNode, ".rotateRight", "right")
    this.setupRotate(cardNode, ".rotateLeft", "left")
    this.setupFlip(cardNode)

    const card = this
    innerDiv.addEventListener("click", e => {
      e.preventDefault()
      let cardId = e.target.parentElement.id || e.target.parentElement.parentElement.id // second is if image was clicked, le sigh
      if (!cardId) { return false }
      card.moveToTop()
      return false;
    })

    // set image
    let img = cardNode.querySelector("img")
    img.src = this.image
    img.alt = this.description

    let table = document.getElementById("table-cards")
    table.appendChild(cardNode)

    this.node = cardNode
  }

  setupRotate(node, className, direction) {
    const btn = node.querySelector(className)

    const card = this
    btn.addEventListener("click", e => {
      e.preventDefault()
      card.rotate(direction)
      return false
    })
    return btn
  }

  setupFlip (node) {
    const btn = node.querySelector('.flip')

    const card = this
    btn.addEventListener("click", e => {
      e.preventDefault();
      card.flip()
      return false;
    })
  }

  get toTransform () {
    return `translate(${this.x}px, ${this.y}px)`
  }

  move(dx, dy) {
    if (this.node.classList.contains("deck-card")) {
      this.moveFromDeckToTable()
    }

    if (Math.abs(this.velocity) < 50) { this.velocity += Math.abs(dx) * 5 }
    if (Math.abs(this.velocity) < 50) { this.velocity += Math.abs(dy) * 5 }

    this.x += this.velocity * dx;
    this.y += this.velocity * dy;

    this.node.style.transform = this.toTransform
  }

  moveToTop() {
    let table = document.getElementById("table-cards");

    // check if already on top
    if (table.children.length > 0) {
      if (table.children[table.children.length - 1].id == this.id) {
        return false
      }
    }

    // get node
    const node = this.node

    // remove node from parent
    node.remove()

    // add it back to the table
    table.appendChild(node);

    // return focus
    this.node.focus()
  }

  moveFromDeckToTable() {
    // set initital position
    const scrollY = window.scrollY
    const scrollX = window.scrollX
    this.y += scrollY + 11
    this.x += scrollX + 6

    this.node.classList.remove("deck-card")
    this.setTitle() // change "The top card on the deck" => "A card"
    this.node.style.transform = this.toTransform
  }

  get title() {
    if (this.visible == "back") {
      return "A card " + this.orientation.to_str
    } else {
      const title = this.number == "" ? this.label : this.number + ". " + this.label
      return title + " " + this.orientation.to_str
    }
  }

  setTitle () {
    this.node.querySelector("h3").innerText = this.title
  }

  rotate(direction) {
    if (direction == "left") {
      this.orientation.rotateLeft()
    } else {
      this.orientation.rotateRight()
    }
    this.node.style.transform = this.toTransform
    this.node.querySelector(".inner-card").style.transform = this.orientation.toTransform
    this.node.style.width = this.orientation.width
    this.setTitle()
  }

  flip () {
    if (this.visible == "back") {
      this.visible = "front"
      this.node.querySelector("img").style.display = "block";
      this.node.removeEventListener("transitionend", hideImage)
      setTimeout(() => {
        // not sure why we have to do this - otherwise transition doesn't work
        this.node.querySelector("img").style.opacity = "100%";
      }, 1)
      this.node.querySelector('.flip').innerText= "↓"
    } else {
      this.visible = "back"
      this.node.querySelector("img").style.opacity = "0%";
      this.node.addEventListener("transitionend", hideImage)
      this.node.querySelector('.flip').innerText = "↑"
    }
    this.setTitle()
    displayExplanation()
  }

  handleMovement(key){
    if (!this.node.classList.contains('floating')) { this.node.classList.add('floating') }
    if (!this.node.classList.contains('deck-card')) {
      this.node.style.transition = "transform 0.25s"
    }
    if (key == "ArrowRight") {
      this.move(1,0)
    }
    if (key == "ArrowLeft") {
      this.move(-1,0)
    }
    if (key == "ArrowUp") {
      this.move(0,-1)
    }
    if (key == "ArrowDown") {
      this.move(0,1)
    }
  }

  handleControls(key) {
    if (key == "KeyF") {
      this.flip()
    }
    if (key == "KeyL") {
      this.rotate("left")
    }
    if (key == "KeyR") {
      this.rotate("right")
    }
  }
}

class Orientation {
  constructor (deg) {
    this.value = deg
  }

  get normalized () {
    return Math.abs(this.value % 360);
  }

  get to_str () {
    if (this.normalized == 0) {
      return ""
    }
    if (this.normalized == 90) {
      return "rotated right"
    }
    if (this.normalized == 180) {
      return "reversed"
    }
    return "rotated left"
  }

  get shadow () {
    if (this.normalized == 0) {
      return "10px 5px 10px #666666"
    }
    if (this.normalized == 90) {
      return "10px -5px 10px #666666"
    }
    if (this.normalized == 180) {
      return "-10px -5px 10px #666666"
    }
    return "-10px 5px 10px #666666"
  }

  get width () {
    if (this.normalized == 0 || this.normalized == 180) {
      return "250px"
    }
    return "325px"
  }

  get toTransform () {
    return "rotate(" + this.value + "deg)"
  }

  rotateRight() {
    this.value += 90
  }

  rotateLeft() {
    this.value -= 90
  }
}

function hideImage(e) {
  if (e.target.tagName == "IMG") {
    e.target.style.display = "none";
  }
}