import { h, Component, render } from "https://esm.sh/preact"

const wwyds = await fetch("/js/wwyd.json")
  .then((response) => response.json())

function thunk(..._) {
  return
}

function c(...classes) {
  return classes.filter(e => !!e).join(" ")
}

function Tile(props) {
  const onClick = props.onClick ? () => props.onClick(props.tile) : thunk
  const selectedTileClass = props.selected ? "tile-selected" : ""

  return h("div", { title: props.tile, onClick: onClick },
    h("svg", { class: c("tile", selectedTileClass), fill: "" },
      h("use", { href: `/others/tiles.svg#${props.tile}` })
    )
  )
}

function TileGroup(props) {
  return h("div", { class: "tile-group" },
    props.tiles.map(
      (tile, index) => h(Tile, {
        tile: tile, selected: index == props.selectedIndex, onClick: props.onClick
      }))
  )
}

function Hand(props) {
  let selectedIndex
  let selectDraw
  if (props.draw == props.choice) {
    selectedIndex = -1
    selectDraw = true
  } else {
    selectedIndex = props.tiles.lastIndexOf(props.choice)
    selectDraw = false
  }
  return h("div", { class: "hand" }, [
    h(TileGroup, { tiles: props.tiles, selectedIndex: selectedIndex, onClick: props.onClick }),
    h(Tile, { tile: props.draw, selected: selectDraw, onClick: props.onClick })
  ])
}

function Choice(props) {
  if (typeof props.choice != "string") {
    return ""
  } else if (props.choice == props.answer) {
    return h("span", { class: "wwyd-answer" }, [
      h(Tile, { tile: props.choice }),
      h("p", null, "is correct!")
    ])
  } else {
    return h("span", { class: "wwyd-answer" }, [
      h(Tile, { tile: props.choice }),
      h("p", null, "is incorrect. The correct answer is"),
      h(Tile, { tile: props.answer })
    ])
  }
}

function windName(value) {
  return {
    "E": "East",
    "S": "South",
    "W": "West",
    "N": "North",
  }[value]
}

function formatDate(date) {
  const [withoutTime] = date.toISOString().split("T")
  return withoutTime
}

function today() {
  const date = new Date()
  return formatDate(date)
}

class App extends Component {
  constructor() {
    super()
    this.state = {
      choice: localStorage.getItem(`wwyd-${today()}`),
    }
    this.setWWYDs()
  }

  setWWYDs = () => {
    this.setState({
      wwyd: wwyds[today()],
      choice: localStorage.getItem(`wwyd-${today()}`),
    })
  }

  chooseDiscard = tile => {
    localStorage.setItem(`wwyd-${today()}`, tile)
    this.setState({ choice: tile })
  }

  render() {
    if (this.state.wwyd) {
      return [
        h("h2", null, "What would you do?"),
        h("span", { class: "wwyd-round" }, [
          h("span", null, [
            h("p", null, "Round:"),
            h("p", { class: "wwyd-round-value" }, windName(this.state.wwyd.round))
          ]),
          h("span", null, [
            h("p", null, "Seat:"),
            h("p", { class: "wwyd-round-value" }, windName(this.state.wwyd.seat))
          ]),
          h("span", null, [
            h("p", null, "Turn:"),
            h("p", { class: "wwyd-round-value" }, this.state.wwyd.turn)
          ]),
          h("span", null, [
            h("p", null, "Dora indicator"),
            h(Tile, { tile: this.state.wwyd.indicator })
          ]),
        ]),
        h(Hand, { onClick: this.chooseDiscard, choice: this.state.choice, tiles: this.state.wwyd.hand, draw: this.state.wwyd.draw }),
        h(Choice, { choice: this.state.choice, answer: this.state.wwyd.answer })
      ]
    } else {
      return [
        h("h2", null, `There's no WWYD available for ${today()}`),
      ]
    }
  }
}

let target = document.getElementById("wwyd")
render(h(App), target)