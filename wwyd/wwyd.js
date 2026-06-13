import { h, render, Fragment } from "https://esm.sh/preact@10"
import { useReducer, useEffect, useState } from "https://esm.sh/preact@10/hooks"

const wwyds = await fetch("/wwyd/wwyd.json").then(r => r.json())

function today() {
  return new Date().toISOString().split("T")[0]
}

function millisUntilNextWwyd() {
  const now = new Date()
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
  return next.getTime() - now.getTime()
}

function formatDuration(ms) {
  const total = Math.max(Math.floor(ms / 1000), 0)
  const pad = n => String(n).padStart(2, "0")
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`
}

function joinClass(...classes) {
  return classes.filter(Boolean).join(" ")
}

function sameShape(a, b) {
  if (!a || !b || a.length !== b.length) {
    return false
  }
  return a.every((tile, i) => tile === b[i])
}

function storedAnswer(date) {
  try {
    const parsed = JSON.parse(localStorage.getItem(`wwyd-${date}`))
    if (typeof parsed[0] === "string") {
      return [parsed]
    }
    return parsed
  } catch {
    return null
  }
}

function saveAnswer(date, answer) {
  // in case someone disabled local storage
  try {
    localStorage.setItem(`wwyd-${date}`, JSON.stringify(answer))
  } catch { }
}

function playActionSound(action) {
  const audio = new Audio(`/wwyd/assets/${action}.mp3`)
  audio.volume = 0.3
  audio.play().catch(() => { })
}

function variantsOf(wwyd) {
  return wwyd.variants || [["discard"]]
}

function handAndMelds(wwyd) {
  const source = wwyd.hand
  if (Array.isArray(source[0])) {
    return { handTiles: source[0], melds: source.slice(1) }
  }
  return { handTiles: source, melds: [] }
}

function drawTile(wwyd) {
  const d = wwyd.draw
  return Array.isArray(d) ? d[0] : d
}

function validRiichiTiles(variants) {
  const riichi = variants.find(v => v[0] === "riichi")
  if (!riichi || !Array.isArray(riichi[1])) {
    return []
  }
  return riichi[1].flat()
}

function headingForVariants(variants) {
  const kinds = variants.map(v => v[0])
  if (kinds.includes("pon") && kinds.includes("chii")) {
    return "Would you call?"
  }
  const kind = kinds[0]
  if (kind === "riichi") {
    return "Would you Riichi?"
  }
  if (kind === "pon") {
    return "Would you Pon?"
  }
  if (kind === "chii") {
    return "Would you Chii?"
  }
  if (kind === "kan") {
    return "Would you Kan?"
  }
  return "What would you discard?"
}

function doraTilesOf(wwyd) {
  const indicators = Array.isArray(wwyd.indicator)
    ? wwyd.indicator
    : (wwyd.indicator != null ? [wwyd.indicator] : [])
  const tiles = ["0z", "0z", ...indicators.slice(0, 5)]
  while (tiles.length < 7) {
    tiles.push("0z")
  }
  return tiles
}

function discardTileOf(choice) {
  if (choice == null) {
    return null
  }
  const step = [...choice].reverse().find(([kind, value]) =>
    kind === "discard" || kind === "riichi" || (kind === "skip" && value != null))
  return step ? step[1] : null
}

function callStateOf(state) {
  if (state.choice != null) {
    const call = state.choice.find(step => step[0] === "pon" || step[0] === "chii")
    if (call) {
      return { kind: call[0], formingTiles: [...call[1]] }
    }
    return null
  }
  const p = state.pending
  if (p && (p.kind === "pon" || p.kind === "chii") && p.tiles) {
    return { kind: p.kind, formingTiles: [...p.tiles] }
  }
  return null
}

function previewHiddenIndices(handTiles, callState) {
  const hidden = new Set()
  if (!callState) {
    return hidden
  }
  const remaining = [...callState.formingTiles]
  handTiles.forEach((tile, i) => {
    const j = remaining.indexOf(tile)
    if (j !== -1) {
      hidden.add(i)
      remaining.splice(j, 1)
    }
  })
  return hidden
}

function actionSelection(state, variants) {
  const firstKind = variants[0][0]
  if (state.choice != null) {
    const call = callStateOf(state)
    if (call) {
      return { name: call.kind, callKind: call.kind, shape: call.formingTiles }
    }
    const kind = state.choice[0][0]
    if (kind === "riichi") {
      return { name: "riichi" }
    }
    if (kind === "skip" && firstKind !== "discard") {
      return { name: "skip" }
    }
    if (kind === "kan") {
      return { name: "kan" }
    }
    return {}
  }
  const p = state.pending
  if (p === "riichi") {
    return { name: "riichi" }
  }
  if (p === `${firstKind}-skip`) {
    return { name: "skip" }
  }
  if (p && (p.kind === "pon" || p.kind === "chii")) {
    return { name: p.kind, callKind: p.kind, shape: p.tiles }
  }
  return {}
}

function interactivityOf(state, variants) {
  const firstKind = variants[0][0]
  const p = state.pending
  if (firstKind === "discard") {
    return { clickable: true, validTiles: null }
  }
  if (p === "riichi") {
    return { clickable: true, validTiles: validRiichiTiles(variants) }
  }
  if (p === "riichi-skip" || p === "kan-skip") {
    return { clickable: true, validTiles: null }
  }
  if (p && (p.kind === "pon" || p.kind === "chii") && p.tiles) {
    return { clickable: true, validTiles: null }
  }
  return { clickable: false, validTiles: null }
}

function answerForTileClick(state, variants, tile) {
  const firstKind = variants[0][0]
  if (firstKind === "discard") {
    return [["discard", tile]]
  }
  const p = state.pending
  if (p === "riichi") {
    if (!validRiichiTiles(variants).includes(tile)) {
      return null
    }
    return [["riichi", tile]]
  }
  if (p === "riichi-skip" || p === "kan-skip") {
    return [["skip", tile]]
  }
  if (p && (p.kind === "pon" || p.kind === "chii") && p.tiles) {
    return [[p.kind, p.tiles], ["discard", tile]]
  }
  return null
}

function handView(state, variants, wwyd) {
  const { handTiles, melds } = handAndMelds(wwyd)
  const firstKind = variants[0][0]
  const isCall = firstKind === "pon" || firstKind === "chii"
  const draw = drawTile(wwyd)
  const showDraw = !isCall && draw != null

  const lineup = showDraw ? [...handTiles, draw] : [...handTiles]
  const call = callStateOf(state)
  const hiddenIndices = previewHiddenIndices(handTiles, call)
  const inter = interactivityOf(state, variants)

  const answered = state.choice != null
  const selectedTile = answered ? discardTileOf(state.choice) : null
  const selectedIndex = selectedTile == null ? -1 : lineup.lastIndexOf(selectedTile)

  const cells = lineup.map((tile, i) => ({
    tile,
    hidden: i < handTiles.length && hiddenIndices.has(i),
    selected: i === selectedIndex,
    locked: answered || !inter.clickable,
    disabled: !answered && inter.clickable && inter.validTiles != null && !inter.validTiles.includes(tile),
  }))

  return {
    hand: cells.slice(0, handTiles.length),
    draw: showDraw ? cells[handTiles.length] : null,
    melds,
    previewMeldTiles: call && draw != null ? [draw, ...call.formingTiles] : null,
  }
}

function initState(override) {
  const date = today()
  if (override) {
    return { date, choice: null, pending: null }
  }
  return { date, choice: storedAnswer(date), pending: null }
}

function reducer(state, action) {
  switch (action.type) {
    case "setPending": {
      if (state.choice != null) {
        return state
      }
      return { ...state, pending: action.pending }
    }
    case "submit": {
      if (state.choice != null) {
        return state
      }
      return { ...state, choice: action.answer }
    }
    case "newDay": {
      const date = today()
      if (date === state.date) {
        return state
      }
      return { date, choice: storedAnswer(date), pending: null }
    }
    default: {
      return state
    }
  }
}

function usePersist(state, ephemeral) {
  useEffect(() => {
    if (ephemeral) {
      return
    }
    if (state.choice == null) {
      return
    }
    saveAnswer(state.date, state.choice)
  }, [ephemeral, state.date, state.choice])
}

function useMidnight(date, ephemeral, dispatch) {
  useEffect(() => {
    if (ephemeral) {
      return
    }
    const id = setTimeout(() => {
      dispatch({ type: "newDay" })
    }, millisUntilNextWwyd() + 100)
    return () => clearTimeout(id)
  }, [date, ephemeral, dispatch])
}

function Tile({ tile, rotated = false, selected = false, disabled = false, locked = false, hidden = false, onClick }) {
  const isBack = tile === "0z"
  const cls = joinClass(
    "tile",
    isBack && "tile-back",
    selected && "tile-selected",
    disabled && "tile-disabled",
    locked && "tile-locked",
    hidden && "tile-preview-hidden",
  )
  const image = isBack ? null : h("svg", null, h("use", { href: `/others/tiles.svg#${tile}` }))
  const face = h("span", { class: cls, title: tile, onClick }, image)
  if (rotated && !isBack) {
    return h("span", { class: "tile-rot-slot", title: tile }, face)
  }
  return face
}

function TileGroup({ tiles }) {
  return h("div", { class: "tile-group" }, tiles.map(t => h(Tile, { tile: t })))
}

function Meld({ tiles }) {
  const tileNodes = tiles.map((t, i) => h(Tile, { tile: t, rotated: i === 0 && t !== "0z" }))
  return h("div", { class: "wwyd-meld" }, tileNodes)
}

function Melds({ melds, previewMeldTiles }) {
  const preview = previewMeldTiles ? h(Meld, { tiles: previewMeldTiles }) : null
  const existing = melds.map(m => h(Meld, { tiles: m }))
  return h("div", { class: "wwyd-melds" }, preview, existing)
}

function DoraRow({ wwyd }) {
  const tiles = doraTilesOf(wwyd).map(t => h(Tile, { tile: t }))
  return h("div", { class: "tile-group wwyd-dora-tiles" }, tiles)
}

function RoundInfo({ wwyd }) {
  const label = `${wwyd.round}, ${wwyd.seat} Seat, Turn ${wwyd.turn}`
  const info = h("span", { class: "wwyd-round-info" }, h("span", null, label))
  return h("span", { class: "wwyd-round" }, info, h(DoraRow, { wwyd }))
}

function Heading({ variants }) {
  return h("h2", null, headingForVariants(variants))
}

function richChunk(chunk) {
  if (typeof chunk === "string") {
    return h("span", null, chunk)
  }
  if (chunk[0] === "<b>") {
    return h("strong", null, chunk[1])
  }
  if (chunk[0] === "<g>") {
    return h("span", { class: "greentext" }, chunk[1])
  }
  return h(TileGroup, { tiles: chunk })
}

function RichText({ chunks, className }) {
  return h("span", { class: className }, chunks.map(richChunk))
}

function ActionButton({ action, selected, disabled, onClick }) {
  const cls = joinClass(
    "wwyd-action",
    `wwyd-action-${action}`,
    selected && "wwyd-action-selected",
    disabled && "wwyd-action-disabled",
  )
  const img = h("img", { src: `/wwyd/assets/${action}.png`, alt: action, class: "wwyd-action-img" })
  return h("button", { class: cls, type: "button", disabled, onClick }, img)
}

function CallShapes({ kind, shapes, sel, answered, dispatch }) {
  if (sel.callKind !== kind) {
    return null
  }
  const buttons = shapes.map(shape => {
    const cls = joinClass(
      "wwyd-call-shape",
      sameShape(shape, sel.shape) && "wwyd-action-selected",
      answered && "wwyd-action-disabled",
    )
    const onClick = () => dispatch({ type: "setPending", pending: { kind, tiles: shape } })
    return h("button", { class: cls, type: "button", disabled: answered, onClick }, h(TileGroup, { tiles: shape }))
  })
  return h("div", { class: "wwyd-call-shapes" }, buttons)
}

function Actions({ variants, state, dispatch }) {
  const firstKind = variants[0][0]
  const sel = actionSelection(state, variants)
  const answered = state.choice != null

  const setPending = pending => dispatch({ type: "setPending", pending })
  const submit = answer => dispatch({ type: "submit", answer })
  const button = (action, name, run) => {
    const selected = sel.name === name
    const onClick = () => {
      if (!selected) {
        playActionSound(action)
      }
      run()
    }
    return h(ActionButton, { action, selected, disabled: answered, onClick })
  }

  const callButtons = variants.map(v => {
    const kind = v[0]
    if (kind === "riichi") {
      return button("riichi", "riichi", () => setPending("riichi"))
    }
    if (kind === "pon" || kind === "chii") {
      const shapes = v[1]
      const tiles = shapes.length === 1 ? shapes[0] : null
      return button(kind, kind, () => setPending({ kind, tiles }))
    }
    if (kind === "kan") {
      return button("kan", "kan", () => submit([["kan"]]))
    }
    return null
  })

  const skipAction = `${firstKind}-skip`
  const skipDefersToDiscard = firstKind === "riichi" || firstKind === "kan"
  let skipButton = null
  if (skipDefersToDiscard) {
    skipButton = button(skipAction, "skip", () => setPending(skipAction))
  } else if (firstKind !== "discard") {
    skipButton = button(skipAction, "skip", () => submit([["skip"]]))
  }

  const pickers = variants
    .filter(v => (v[0] === "pon" || v[0] === "chii") && v[1].length > 1)
    .map(v => h(CallShapes, { kind: v[0], shapes: v[1], sel, answered, dispatch }))

  const row = h("div", { class: "wwyd-actions" }, callButtons, skipButton)
  return h(Fragment, null, row, pickers)
}

function HandArea({ wwyd, variants, state, dispatch }) {
  const view = handView(state, variants, wwyd)
  const onTile = tile => {
    const answer = answerForTileClick(state, variants, tile)
    if (answer) {
      dispatch({ type: "submit", answer })
    }
  }
  const tileNode = c => h(Tile, {
    tile: c.tile, hidden: c.hidden, selected: c.selected, locked: c.locked, disabled: c.disabled,
    onClick: () => onTile(c.tile),
  })

  const handTiles = h("div", { class: "tile-group" }, view.hand.map(tileNode))
  const drawNode = view.draw ? tileNode(view.draw) : null
  const hand = h("div", { class: "hand" }, handTiles, drawNode)
  const melds = h(Melds, { melds: view.melds, previewMeldTiles: view.previewMeldTiles })
  return h("div", { class: "wwyd-hand-area" }, hand, melds)
}

function AnswerStep({ step }) {
  const [kind, value] = step
  const labeledTiles = label => h(Fragment, null, h("span", null, label), h(TileGroup, { tiles: value }))
  if (kind === "discard") {
    return h(TileGroup, { tiles: value })
  }
  if (kind === "pon") {
    return labeledTiles("Pon ")
  }
  if (kind === "chii") {
    return labeledTiles("Chii ")
  }
  if (kind === "riichi") {
    if (Array.isArray(value) && value.length) {
      return labeledTiles("Riichi ")
    }
    return h("span", null, "Riichi")
  }
  if (kind === "kan") {
    return h("span", null, "Kan")
  }
  if (kind === "skip") {
    return h("span", null, "Skip")
  }
  return null
}

function Answer({ answer }) {
  if (!Array.isArray(answer) || answer.length === 0) {
    return null
  }
  const label = h("span", { class: "wwyd-answer-label" }, "Answer: ")
  const steps = answer.map((step, i) => {
    const separator = i > 0 ? h("span", null, " → ") : null
    return h(Fragment, null, separator, h(AnswerStep, { step }))
  })
  return h("span", { class: "wwyd-answer" }, label, steps)
}

function Timer({ onRollover }) {
  const [ms, setMs] = useState(() => millisUntilNextWwyd())
  useEffect(() => {
    const id = setInterval(() => {
      const remaining = millisUntilNextWwyd()
      setMs(remaining)
      if (remaining <= 0) {
        onRollover()
      }
    }, 1000)
    return () => clearInterval(id)
  }, [onRollover])
  return h("p", { class: "wwyd-timer" }, `Next WWYD in ${formatDuration(ms)}`)
}

function NoWwyd({ date }) {
  return h("h2", null, `There's no WWYD available for ${date}`)
}

function Wwyd({ override }) {
  const ephemeral = !!override
  const [state, dispatch] = useReducer(reducer, override, initState)
  const wwyd = override ?? wwyds[state.date]

  usePersist(state, ephemeral)
  useMidnight(state.date, ephemeral, dispatch)

  if (!wwyd) {
    return h(NoWwyd, { date: state.date })
  }

  const variants = variantsOf(wwyd)
  const firstKind = variants[0][0]
  const answered = state.choice != null

  const context = wwyd.context ? h(RichText, { chunks: wwyd.context, className: "wwyd-context" }) : null
  const actions = firstKind !== "discard" ? h(Actions, { variants, state, dispatch }) : null
  const answer = answered ? h(Answer, { answer: wwyd.answer }) : null
  const comment = answered && wwyd.comment ? h(RichText, { chunks: wwyd.comment, className: "wwyd-comment" }) : null
  const timer = answered && !ephemeral ? h(Timer, { onRollover: () => dispatch({ type: "newDay" }) }) : null

  return h(Fragment, null,
    h(Heading, { variants }),
    h(RoundInfo, { wwyd }),
    context,
    actions,
    h(HandArea, { wwyd, variants, state, dispatch }),
    answer,
    comment,
    timer,
  )
}

export function mount(target, override) {
  render(h(Wwyd, { override }), target)
  return () => render(null, target)
}

const defaultTarget = document.getElementById("wwyd")
if (defaultTarget) {
  mount(defaultTarget)
}

export { wwyds }
