const wwyds = await fetch("/wwyd/wwyd.json").then(r => r.json())

const SVG_NS = "http://www.w3.org/2000/svg"

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

function removeOldAnswers(currentDate) {
  const currentKey = `wwyd-${currentDate}`
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (key && key.startsWith("wwyd-") && key !== currentKey) {
      localStorage.removeItem(key)
    }
  }
}

function storedAnswer(date) {
  const raw = localStorage.getItem(`wwyd-${date}`)
  if (raw == null) return null
  try { return JSON.parse(raw) } catch { return raw }
}

function saveAnswer(date, answer) {
  localStorage.setItem(`wwyd-${date}`, JSON.stringify(answer))
}

function normalizeAnswer(answer) {
  if (answer == null) return answer
  if (typeof answer === "string") return ["discard", answer]
  return answer
}

function sameShape(a, b) {
  if (!a || !b || a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}

function drawTile(wwyd) {
  const d = wwyd.draw
  return Array.isArray(d) ? d[0] : d
}

function discardTileOf(answer) {
  if (answer == null) return null
  const n = normalizeAnswer(answer)
  if (Array.isArray(n[0])) {
    for (let i = n.length - 1; i >= 0; i--) {
      const [kind, ...rest] = n[i]
      if (kind === "discard") return rest[0]
    }
    return null
  }
  const [kind, ...rest] = n
  if (kind === "discard" || kind === "riichi") return rest[0]
  if (kind === "skip" && rest.length === 1) return rest[0]
  return null
}

function playActionSound(action) {
  try {
    const audio = new Audio(`/wwyd/assets/${action}.mp3`)
    audio.volume = 0.3
    audio.play().catch(() => {})
  } catch {}
}

function joinClass(...classes) {
  return classes.filter(Boolean).join(" ")
}

function el(tag, attrs, children) {
  const node = document.createElement(tag)
  setAttrs(node, attrs)
  appendChildren(node, children)
  return node
}

function svgEl(tag, attrs, children) {
  const node = document.createElementNS(SVG_NS, tag)
  setAttrs(node, attrs)
  appendChildren(node, children)
  return node
}

function setAttrs(node, attrs) {
  if (!attrs) return
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue
    if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value)
    } else {
      node.setAttribute(key, value === true ? "" : value)
    }
  }
}

function appendChildren(node, children) {
  if (children == null) return
  const arr = Array.isArray(children) ? children : [children]
  for (const c of arr) {
    if (c == null || c === false) continue
    node.appendChild(typeof c === "string" || typeof c === "number"
      ? document.createTextNode(String(c)) : c)
  }
}

function tileNode(tile, { rotated = false } = {}) {
  if (rotated && tile !== "0z") {
    const inner = buildTile(tile)
    return el("span", { class: "tile-rot-slot", title: tile }, [inner])
  }
  return buildTile(tile)
}

function buildTile(tile) {
  if (tile === "0z") {
    return el("span", { class: "tile tile-back", title: tile })
  } else {
    const svg = svgEl("svg", null, [svgEl("use", { href: `/others/tiles.svg#${tile}` })])
    return el("span", { class: "tile", title: tile }, [svg])
  }
}

function tileGroupNode(tiles) {
  return el("div", { class: "tile-group" }, tiles.map(t => tileNode(t)))
}

function meldNode(tiles) {
  return el("div", { class: "wwyd-meld" },
    tiles.map((t, i) => tileNode(t, { rotated: i === 0 && t !== "0z" })))
}

function richTextNode(chunks, className) {
  return el("span", { class: className }, chunks.map(chunk => {
    if (typeof chunk === "string") return el("span", null, [chunk])
    if (chunk[0] === "<b>") return el("strong", null, [chunk[1]])
    if (chunk[0] === "<g>") return el("span", { class: "greentext" }, [chunk[1]])
    return tileGroupNode(chunk)
  }))
}

function headingForVariants(variants) {
  const kinds = variants.map(v => v[0])
  const hasPon = kinds.includes("pon")
  const hasChii = kinds.includes("chii")
  if (hasPon && hasChii) return "Would you call?"
  const kind = kinds[0]
  if (kind === "riichi") return "Would you Riichi?"
  if (kind === "pon") return "Would you Pon?"
  if (kind === "chii") return "Would you Chii?"
  if (kind === "kan") return "Would you Kan?"
  return "What would you discard?"
}

function answerStepNodes(step) {
  const [kind, value] = step
  if (kind === "discard") return [tileGroupNode(value)]
  if (kind === "pon") return [el("span", null, ["Pon "]), tileGroupNode(value)]
  if (kind === "chii") return [el("span", null, ["Chii "]), tileGroupNode(value)]
  if (kind === "riichi") {
    const ns = [el("span", null, ["Riichi"])]
    if (Array.isArray(value) && value.length) { ns.push(el("span", null, [" "])); ns.push(tileGroupNode(value)) }
    return ns
  }
  if (kind === "kan") return [el("span", null, ["Kan"])]
  if (kind === "skip") return [el("span", null, ["Skip"])]
  return []
}

function answerNode(answer) {
  if (!Array.isArray(answer) || answer.length === 0) return null
  const children = [el("span", { class: "wwyd-answer-label" }, ["Answer: "])]
  answer.forEach((step, i) => {
    if (i > 0) children.push(el("span", null, [" → "]))
    for (const n of answerStepNodes(step)) children.push(n)
  })
  return el("span", { class: "wwyd-answer" }, children)
}

class App {
  constructor(target, wwydOverride) {
    this.target = target
    this.ephemeral = !!wwydOverride
    this.date = today()
    if (!this.ephemeral) {
      removeOldAnswers(this.date)
    }
    this.wwyd = wwydOverride || wwyds[this.date]
    this.pending = null
    this.choice = this.ephemeral ? null : storedAnswer(this.date)
    this.refs = { actionButtons: {}, callShapeButtons: [], callShapeContainers: {}, handTiles: [], drawNode: null }
    this.timerInterval = null
    this.midnightTimeout = null
    this.build()
    if (!this.ephemeral) {
      this.scheduleMidnight()
    }
  }

  build() {
    this.target.replaceChildren()
    if (!this.wwyd) {
      this.target.appendChild(el("h2", null, [`There's no WWYD available for ${this.date}`]))
      return
    }
    const wwyd = this.wwyd
    const variants = wwyd.variants || [["discard"]]
    const firstKind = variants[0][0]
    const isCall = firstKind === "pon" || firstKind === "chii"

    this.target.appendChild(el("h2", null, [headingForVariants(variants)]))
    this.target.appendChild(this.buildRoundInfo(wwyd))
    if (wwyd.context) this.target.appendChild(richTextNode(wwyd.context, "wwyd-context"))

    if (firstKind !== "discard") this.buildActionsArea(variants)
    this.buildHandArea(wwyd, isCall)

    this.refs.answerSlot = el("div", { class: "wwyd-answer-slot" })
    this.refs.commentSlot = el("div", { class: "wwyd-comment-slot" })
    this.refs.timerSlot = el("div", { class: "wwyd-timer-slot" })
    this.target.appendChild(this.refs.answerSlot)
    this.target.appendChild(this.refs.commentSlot)
    this.target.appendChild(this.refs.timerSlot)

    this.applyPending()
    if (this.choice != null) this.applyAnswered()
  }

  buildRoundInfo(wwyd) {
    const indicators = Array.isArray(wwyd.indicator) ? wwyd.indicator : (wwyd.indicator ? [wwyd.indicator] : [])
    const doraTiles = ["0z", "0z", ...indicators.slice(0, 5)]
    while (doraTiles.length < 7) doraTiles.push("0z")
    return el("span", { class: "wwyd-round" }, [
      el("span", { class: "wwyd-round-info" }, [
        el("span", null, [`${wwyd.round}, ${wwyd.seat} Seat, Turn ${wwyd.turn}`]),
      ]),
      el("div", { class: "tile-group wwyd-dora-tiles" }, doraTiles.map(t => tileNode(t))),
    ])
  }

  buildActionsArea(variants) {
    const firstKind = variants[0][0]
    const row = el("div", { class: "wwyd-actions" })
    for (const v of variants) {
      const kind = v[0]
      if (kind === "riichi") {
        this.addActionButton(row, "riichi", () => this.setPending("riichi"))
      } else if (kind === "pon" || kind === "chii") {
        const shapes = v[1]
        this.addActionButton(row, kind, () => {
          const tiles = shapes.length === 1 ? shapes[0] : null
          this.setPending({ kind, tiles })
        })
      } else if (kind === "kan") {
        this.addActionButton(row, "kan", () => this.submit(["kan"]))
      }
    }
    if (firstKind === "riichi" || firstKind === "kan") {
      this.addActionButton(row, `${firstKind}-skip`, () => this.setPending(`${firstKind}-skip`), "skip")
    } else if (firstKind !== "discard") {
      this.addActionButton(row, `${firstKind}-skip`, () => this.submit(["skip"]), "skip")
    }
    this.target.appendChild(row)

    for (const v of variants) {
      const kind = v[0]
      if ((kind !== "pon" && kind !== "chii") || v[1].length <= 1) continue
      const container = el("div", { class: "wwyd-call-shapes", hidden: true })
      for (const shape of v[1]) {
        const btn = el("button", { class: "wwyd-call-shape", type: "button" }, [tileGroupNode(shape)])
        btn.addEventListener("click", () => {
          if (btn.hasAttribute("disabled")) return
          this.setPending({ kind, tiles: shape })
        })
        this.refs.callShapeButtons.push({ kind, btn, shape })
        container.appendChild(btn)
      }
      this.refs.callShapeContainers[kind] = container
      this.target.appendChild(container)
    }
  }

  addActionButton(row, action, onClick, refKey) {
    const img = el("img", {
      src: `/wwyd/assets/${action}.png`, alt: action, class: "wwyd-action-img",
    })
    const btn = el("button", {
      class: joinClass("wwyd-action", `wwyd-action-${action}`), type: "button",
    }, [img])
    btn.addEventListener("click", () => {
      if (btn.hasAttribute("disabled")) return
      playActionSound(action)
      onClick()
    })
    this.refs.actionButtons[refKey || action] = btn
    row.appendChild(btn)
  }

  buildHandArea(wwyd, isCall) {
    const handSource = wwyd.hand
    const handTiles = Array.isArray(handSource[0]) ? handSource[0] : handSource
    const melds = Array.isArray(handSource[0]) ? handSource.slice(1) : []

    const handArea = el("div", { class: "wwyd-hand-area" })
    const handRow = el("div", { class: "hand" })
    const tileGroup = el("div", { class: "tile-group" })
    for (const tile of handTiles) {
      const node = tileNode(tile)
      this.attachTileClick(node, tile)
      this.refs.handTiles.push({ node, tile })
      tileGroup.appendChild(node)
    }
    handRow.appendChild(tileGroup)
    if (!isCall) {
      const dt = drawTile(wwyd)
      const node = tileNode(dt)
      this.attachTileClick(node, dt)
      this.refs.drawNode = { node, tile: dt }
      handRow.appendChild(node)
    }
    handArea.appendChild(handRow)

    this.refs.meldsContainer = el("div", { class: "wwyd-melds" })
    for (const meld of melds) this.refs.meldsContainer.appendChild(meldNode(meld))
    handArea.appendChild(this.refs.meldsContainer)

    this.target.appendChild(handArea)
  }

  attachTileClick(node, tile) {
    node.addEventListener("click", () => {
      if (this.choice != null) return
      if (node.classList.contains("tile-disabled")) return
      if (node.classList.contains("tile-locked")) return
      this.onTileClick(tile)
    })
  }

  onTileClick(tile) {
    const variants = this.wwyd.variants || [["discard"]]
    const firstKind = variants[0][0]
    if (firstKind === "discard") return this.submit(["discard", tile])
    const p = this.pending
    if (p === "riichi") {
      const r = variants.find(v => v[0] === "riichi")
      const valid = r ? r[1].flat() : []
      if (!valid.includes(tile)) return
      return this.submit(["riichi", tile])
    }
    if (p === "riichi-skip" || p === "kan-skip") return this.submit(["skip", tile])
    if (p && (p.kind === "pon" || p.kind === "chii") && p.tiles) {
      return this.submit([[p.kind, p.tiles], ["discard", tile]])
    }
  }

  setPending(pending) {
    if (JSON.stringify(this.pending) === JSON.stringify(pending)) return
    this.pending = pending
    this.applyPending()
  }

  submit(answer) {
    if (this.choice != null) return
    this.choice = answer
    if (!this.ephemeral) saveAnswer(this.date, answer)
    this.applyAnswered()
  }

  applyPending() {
    if (this.choice != null) return
    const variants = this.wwyd.variants || [["discard"]]
    const firstKind = variants[0][0]
    const p = this.pending

    for (const [name, btn] of Object.entries(this.refs.actionButtons)) {
      let selected = false
      if (name === "riichi" && p === "riichi") selected = true
      else if (name === "skip" && p === `${firstKind}-skip`) selected = true
      else if ((name === "pon" || name === "chii") && p && p.kind === name) selected = true
      btn.classList.toggle("wwyd-action-selected", selected)
    }

    for (const [kind, container] of Object.entries(this.refs.callShapeContainers)) {
      container.hidden = !(p && p.kind === kind)
    }
    for (const { kind, btn, shape } of this.refs.callShapeButtons) {
      const active = p && p.kind === kind
      btn.classList.toggle("wwyd-action-selected", active && sameShape(shape, p.tiles))
    }

    this.applyMeldPreview()
    this.updateHandClickability()
  }

  getCallState() {
    if (this.choice != null) {
      if (Array.isArray(this.choice) && Array.isArray(this.choice[0])) {
        const call = this.choice.find(s => s[0] === "pon" || s[0] === "chii")
        if (call) return { kind: call[0], formingTiles: [...call[1]] }
        return null
      }
      const [kind, ...rest] = this.choice
      if (kind === "pon" || kind === "chii") return { kind, formingTiles: [...rest[0]] }
      return null
    }
    const p = this.pending
    if (p && (p.kind === "pon" || p.kind === "chii") && p.tiles) {
      return { kind: p.kind, formingTiles: [...p.tiles] }
    }
    return null
  }

  applyMeldPreview() {
    if (this.refs.previewMeldNode) {
      this.refs.previewMeldNode.remove()
      this.refs.previewMeldNode = null
    }
    for (const { node } of this.refs.handTiles) node.classList.remove("tile-preview-hidden")

    const state = this.getCallState()
    const called = drawTile(this.wwyd)
    if (!state || called == null) return
    const remaining = [...state.formingTiles]
    for (const { node, tile } of this.refs.handTiles) {
      if (node.classList.contains("tile-preview-hidden")) continue
      const i = remaining.indexOf(tile)
      if (i !== -1) {
        node.classList.add("tile-preview-hidden")
        remaining.splice(i, 1)
      }
    }
    const meldTiles = [called, ...state.formingTiles]
    const node = meldNode(meldTiles)
    const first = this.refs.meldsContainer.firstChild
    this.refs.meldsContainer.insertBefore(node, first)
    this.refs.previewMeldNode = node
  }

  applyAnswered() {
    const choice = this.choice
    const variants = this.wwyd.variants || [["discard"]]
    const firstKind = variants[0][0]
    const callStep = Array.isArray(choice) && Array.isArray(choice[0])
      ? choice.find(s => s[0] === "pon" || s[0] === "chii")
      : null
    const kind = callStep ? callStep[0]
      : Array.isArray(choice) ? choice[0] : "discard"

    let selectedName = null
    let selectedShape = null
    let selectedCallKind = null
    if (kind === "riichi") selectedName = "riichi"
    else if (kind === "skip" && firstKind !== "discard") selectedName = "skip"
    else if (kind === "pon" || kind === "chii") {
      selectedName = kind; selectedCallKind = kind; selectedShape = callStep[1]
    }
    else if (kind === "kan") selectedName = "kan"

    for (const [name, btn] of Object.entries(this.refs.actionButtons)) {
      btn.classList.toggle("wwyd-action-selected", name === selectedName)
      btn.setAttribute("disabled", "")
      btn.classList.add("wwyd-action-disabled")
    }
    for (const [ck, container] of Object.entries(this.refs.callShapeContainers)) {
      container.hidden = ck !== selectedCallKind
    }
    for (const { kind: ck, btn, shape } of this.refs.callShapeButtons) {
      const match = ck === selectedCallKind && !!selectedShape && sameShape(shape, selectedShape)
      btn.classList.toggle("wwyd-action-selected", match)
      btn.setAttribute("disabled", "")
      btn.classList.add("wwyd-action-disabled")
    }

    this.applyMeldPreview()

    this.refs.answerSlot.replaceChildren()
    const c = answerNode(this.wwyd.answer)
    if (c) this.refs.answerSlot.appendChild(c)
    this.refs.commentSlot.replaceChildren()
    if (this.wwyd.comment) this.refs.commentSlot.appendChild(richTextNode(this.wwyd.comment, "wwyd-comment"))

    this.startTimer()
    this.updateHandClickability()
  }

  updateHandClickability() {
    const variants = this.wwyd.variants || [["discard"]]
    const firstKind = variants[0][0]
    const p = this.pending
    const all = [...this.refs.handTiles]
    if (this.refs.drawNode) all.push(this.refs.drawNode)

    for (const { node } of all) {
      node.classList.remove("tile-disabled", "tile-selected", "tile-locked")
    }

    if (this.choice != null) {
      const sel = discardTileOf(this.choice)
      for (const { node } of all) node.classList.add("tile-locked")
      if (sel != null) {
        for (let i = all.length - 1; i >= 0; i--) {
          if (all[i].tile === sel) { all[i].node.classList.add("tile-selected"); break }
        }
      }
      return
    }

    let interactive = false
    let validTiles = null
    if (firstKind === "discard") interactive = true
    else if (p === "riichi") {
      interactive = true
      const r = variants.find(v => v[0] === "riichi")
      validTiles = r ? r[1].flat() : []
    }
    else if (p === "riichi-skip" || p === "kan-skip") interactive = true
    else if (p && (p.kind === "pon" || p.kind === "chii") && p.tiles) interactive = true

    if (!interactive) {
      for (const { node } of all) node.classList.add("tile-locked")
      return
    }
    if (validTiles) {
      for (const { node, tile } of all) {
        if (!validTiles.includes(tile)) node.classList.add("tile-disabled")
      }
    }
  }

  startTimer() {
    this.stopTimer()
    this.refs.timerSlot.replaceChildren()
    const timerEl = el("p", { class: "wwyd-timer" }, [`Next WWYD in ${formatDuration(millisUntilNextWwyd())}`])
    this.refs.timerSlot.appendChild(timerEl)
    this.timerInterval = setInterval(() => {
      const remaining = millisUntilNextWwyd()
      timerEl.textContent = `Next WWYD in ${formatDuration(remaining)}`
      if (remaining <= 0) this.refreshForNewDay()
    }, 1000)
  }

  stopTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval)
    this.timerInterval = null
  }

  scheduleMidnight() {
    this.nextWwydTimeout = setTimeout(() => {
      this.refreshForNewDay()
      this.scheduleMidnight()
    }, millisUntilNextWwyd() + 100)
  }

  refreshForNewDay() {
    const date = today()
    if (date === this.date) return
    removeOldAnswers(date)
    this.date = date
    this.wwyd = wwyds[date]
    this.pending = null
    this.choice = storedAnswer(date)
    this.refs = { actionButtons: {}, callShapeButtons: [], callShapeContainers: {}, handTiles: [], drawNode: null }
    this.build()
  }

  destroy() {
    this.stopTimer()
    if (this.midnightTimeout) {
      clearTimeout(this.midnightTimeout)
      this.midnightTimeout = null
    }
  }
}

const defaultTarget = document.getElementById("wwyd")
if (defaultTarget) new App(defaultTarget)

export { App, wwyds }
