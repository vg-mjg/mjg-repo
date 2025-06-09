// --- Core Data ---
const rounds = [
  { name: 'East 1', wind: 'East', num: 1 },
  { name: 'East 2', wind: 'East', num: 2 },
  { name: 'East 3', wind: 'East', num: 3 },
  { name: 'East 4', wind: 'East', num: 4 },
  { name: 'South 1', wind: 'South', num: 1 },
  { name: 'South 2', wind: 'South', num: 2 },
  { name: 'South 3', wind: 'South', num: 3 },
  { name: 'South 4', wind: 'South', num: 4 },
];

function pickDealerRounds() {
  const n = Math.floor(Math.random() * 4) + 1; // 1~4
  return [n - 1, n + 3]; // Indexes in rounds: East n, South n
}
const dealerRounds = pickDealerRounds();

const pointsTable = {
  nondealer: [
    { label: "1000", value: 1000, tsumo: 300 },
    { label: "2000", value: 2000, tsumo: 500 },
    { label: "3900", value: 3900, tsumo: 1000 },
    { label: "7700", value: 7700, tsumo: 2000 },
    { label: "Mangan", value: 8000, tsumo: 2000, display: "Mangan" },
    { label: "Haneman", value: 12000, tsumo: 3000, display: "Haneman" },
    { label: "Baiman", value: 16000, tsumo: 4000, display: "Baiman" },
    { label: "Sanbaiman", value: 24000, tsumo: 6000, display: "Sanbaiman" },
    { label: "Yakuman", value: 32000, tsumo: 8000, display: "Yakuman" }
  ],
  dealer: [
    { label: "1500", value: 1500, tsumo: 700 },
    { label: "2900", value: 2900, tsumo: 1000 },
    { label: "5800", value: 5800, tsumo: 2000 },
    { label: "11600", value: 11600, tsumo: 3900 },
    { label: "Mangan", value: 12000, tsumo: 4000, display: "Mangan" },
    { label: "Haneman", value: 18000, tsumo: 6000, display: "Haneman" },
    { label: "Baiman", value: 24000, tsumo: 8000, display: "Baiman" },
    { label: "Sanbaiman", value: 36000, tsumo: 12000, display: "Sanbaiman" },
    { label: "Yakuman", value: 48000, tsumo: 16000, display: "Yakuman" }
  ]
};

// LESSENED RYUUKOKU CHANCE OVERALL
const outcomeSpinners = {
  "Push for High Value": [0.13, 0.13, 0.30, 0.19, 0.25],
  "Fold":                [0.04, 0.04, 0.13, 0.14, 0.65],
  "Aim for Speed":       [0.24, 0.24, 0.08, 0.22, 0.22],
  "Standard Pinfu Hand": [0.20, 0.18, 0.19, 0.19, 0.24]
};

const pointSpinnerMap = {
  "Push for High Value": [2.5, 2, 1.5, 1, 1, 0.7, 0.3, 0.15, 0.05],
  "Fold": [10, 6, 2, 1, 1, 0.5, 0.2, 0.1, 0.05],
  "Aim for Speed": [7, 7, 2.5, 1, 1, 0.3, 0.1, 0.07, 0.03],
  "Standard Pinfu Hand": [3, 3, 2, 1, 1, 0.7, 0.2, 0.07, 0.03],
};

const outcomeLabels = [
  "Player wins with ron",
  "Player wins with tsumo",
  "Player deals in ron",
  "Other player tsumos",
  "Ryuukyoku (draw)"
];

let state = {
  roundIdx: 0,
  points: 25000,
  selectedChoice: null,
  outcome: null,
  pointResult: null,
  isDealer: false,
  finished: false,
  repeat: 0,
  lastDealerRound: -1,
  started: false,
  stats: {
    numHands: 0,
    winCount: 0,
    dealinCount: 0
  }
};

const sim = id => document.getElementById('mahjong-sim-' + id);

function showBanner() {
  const container = document.getElementById('mahjong-sim-container');
  container.innerHTML = `
    <div id="mahjong-banner" tabindex="0" style="width:300px;height:100px;padding:0;border:none;outline:none;overflow:hidden;display:flex;">
      <img src="game_assets/banner2.png" alt="Mahjong Banner"
        style="width:300px;height:100px;object-fit:cover;display:block;border:none;margin:0;padding:0;"/>
    </div>
  `;
  // The whole banner is clickable/focusable
  const bannerDiv = document.getElementById('mahjong-banner');
  const startGameCb = () => {
    state.started = true;
    document.getElementById('mahjong-sim-container').innerHTML = `
      <div id="mahjong-sim-header">
        <span id="mahjong-sim-status"></span>
        <span id="mahjong-sim-points"></span>
        <span id="mahjong-sim-dealer"></span>
      </div>
      <div id="mahjong-sim-choices"></div>
      <div id="mahjong-sim-events"></div>
      <div id="mahjong-sim-spinner"></div>
      <div id="mahjong-sim-footer"></div>
    `;
    startGame();
  };
  bannerDiv.onclick = startGameCb;
  bannerDiv.onkeypress = e => { if (e.key === "Enter" || e.key === " ") startGameCb(); };
}

function weightedRandomIndex(weights) {
  let total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; ++i) {
    if (r < weights[i]) return i;
    r -= weights[i];
  }
  return weights.length - 1;
}

function updateHeader() {
  const r = rounds[state.roundIdx];
  let repeatDisplay = "";
  state.isDealer = (dealerRounds[0] === state.roundIdx || dealerRounds[1] === state.roundIdx);
  if (state.isDealer && state.repeat > 0) {
    repeatDisplay = ` <span style="color:#d8660d;font-size:11px;background:#f8e0b2;border-radius:4px;padding:0 3px;">Repeat: ${state.repeat}</span>`;
  }
  sim('status').innerHTML = `<span style="font-size:16px;color:#b84c00;text-shadow:1px 1px 0 #fff7;">${r.name}</span>${repeatDisplay}`;
  sim('points').innerHTML = `<span style="font-size:14px;background:#fffbe9;border-radius:4px;padding:0 4px 0 7px;border:1px solid #e3ba63;box-shadow:0 1px 2px #e3ba6333;color:#a33;">${state.points}</span>`;
  if (state.isDealer) {
    sim('dealer').innerHTML = '<span class="dealer-badge" style="font-size:10.5px;background:#ffe9a2;color:#a15e0c;border:1px solid #f5c55c;">Dealer</span>';
  } else {
    sim('dealer').innerHTML = '';
  }
}

function updateFooter() {
  sim('footer').innerHTML = `<span style="color:#a58c60;background:#f7ecd7;border-radius:3px;padding:0 4px;">${state.finished ? "kyap..." : `Round ${state.roundIdx + 1}/8`}</span>`;
}

function resetUI() {
  sim('choices').innerHTML = '';
  sim('events').innerHTML = '';
  sim('spinner').innerHTML = '';
}

function showChoices() {
  resetUI();
  const choices = [
    { name: "Push for High Value", color: "#e8b754", hover: "#ffe7b1" },
    { name: "Fold", color: "#d3d3d3", hover: "#f2f2f2" },
    { name: "Aim for Speed", color: "#90c3e8", hover: "#c6e6ff" },
    { name: "Standard Pinfu Hand", color: "#fffbe6", hover: "#e6e9ff" }
  ];
  sim('choices').innerHTML = '';
  choices.forEach(stratObj => {
    const btn = document.createElement('button');
    btn.textContent = stratObj.name;
    btn.className = "mahjong-sim-btn";
    btn.style.background = stratObj.color;
    btn.onmouseover = () => btn.style.background = stratObj.hover;
    btn.onmouseout = () => btn.style.background = stratObj.color;
    btn.onclick = () => {
      state.selectedChoice = stratObj.name;
      nextStep("choice");
    };
    sim('choices').appendChild(btn);
  });
}

function showSelectedChoice() {
  sim('choices').innerHTML = `<span style="color:#135;font-weight:600;font-size:13px;letter-spacing:0.5px;">You chose: <b>${state.selectedChoice}</b></span>`;
  sim('events').innerHTML = '';
  sim('spinner').innerHTML = '';
  // Show Let's Mahjong!
  const goBtn = document.createElement('button');
  goBtn.textContent = "Let's Mahjong!";
  goBtn.className = "mahjong-sim-btn";
  goBtn.style.background = "#ffe6a1";
  goBtn.style.fontWeight = "bold";
  goBtn.onclick = () => nextStep("spinOutcome");
  sim('choices').appendChild(goBtn);
}

function spinRoulette(labels, weights, cb, spinnerId, speed = 50, spins = 15) {
  let spinCt = spins + Math.floor(Math.random() * 6);
  let i = 0;
  let interval = setInterval(() => {
    sim(spinnerId).innerHTML = `<span style="color:#947d4c">${labels[i % labels.length]}</span>`;
    i++;
    if (i >= spinCt) {
      clearInterval(interval);
      const idx = weightedRandomIndex(weights);
      sim(spinnerId).innerHTML = `<span style="color:#b86b00;font-weight:bold">${labels[idx]}</span>`;
      cb(idx);
    }
  }, speed);
}

function showOutcomeSpinner() {
  sim('choices').innerHTML = '';
  sim('events').textContent = 'Spinning for outcome...';
  const outcomeWeights = outcomeSpinners[state.selectedChoice];
  spinRoulette(
    outcomeLabels,
    outcomeWeights,
    (idx) => {
      state.outcome = idx;
      sim('events').innerHTML = `<span style="font-weight:bold;color:#b84c00;background:#fff6e4;border-radius:4px;padding:0 3px;">${outcomeLabels[idx]}</span>`;
      sim('spinner').innerHTML = '';
      setTimeout(() => nextStep('pointCalcBtn'), 900);
    },
    'spinner'
  );
}

function showPointCalcBtn() {
  sim('choices').innerHTML = '';
  const calcBtn = document.createElement('button');
  calcBtn.textContent = "Calculate Points";
  calcBtn.className = "mahjong-sim-btn";
  calcBtn.style.background = "#ffe6a1";
  calcBtn.style.fontWeight = "bold";
  calcBtn.onclick = () => showPointSpinner();
  sim('choices').appendChild(calcBtn);
}

function getDisplayHand(ptObj) {
  if (ptObj.display) return ptObj.display;
  return ptObj.label;
}

function showPointSpinner() {
  sim('choices').innerHTML = '';
  if (state.outcome === 4) { // ryuukyoku
    sim('events').innerHTML += " It's a draw! No point change.";
    sim('spinner').innerHTML = '';
    state.stats.numHands++;
    setTimeout(() => showContinueBtn(shouldDealerRepeat()), 900);
    return;
  }
  let pointSet = state.isDealer ? pointsTable.dealer : pointsTable.nondealer;
  let weights = pointSpinnerMap[state.selectedChoice];
  spinRoulette(
    pointSet.map(x => getDisplayHand(x)),
    weights,
    (idx) => {
      state.pointResult = idx;
      sim('spinner').innerHTML = '';
      calcPoints();
    },
    'spinner'
  );
}

function calcPoints() {
  let isDealer = state.isDealer;
  let ptSet = isDealer ? pointsTable.dealer : pointsTable.nondealer;
  let pointObj = ptSet[state.pointResult];
  let outcome = state.outcome;
  let pts = state.points;
  let delta = 0;
  let handDisplay = getDisplayHand(pointObj);
  let scoreMsg = '';

  sim('events').innerHTML = '';

  // Update stats
  state.stats.numHands++;
  if (outcome === 0 || outcome === 1) {
    state.stats.winCount++;
  }
  if (outcome === 2) {
    state.stats.dealinCount++;
  }

  if (outcome === 0) { // player ron win
    delta = pointObj.value;
    pts += delta;
    scoreMsg = `You won by Ron! <b>${handDisplay}</b>. <span style="color:#207d37;">+${delta} points.</span>`;
  } else if (outcome === 1) { // player tsumo
    delta = pointObj.value;
    pts += delta;
    scoreMsg = `You won by Tsumo! <b>${handDisplay}</b>. <span style="color:#207d37;">+${delta} points.</span>`;
  } else if (outcome === 2) { // player deals in
    delta = pointObj.value;
    pts -= delta;
    scoreMsg = `You dealt in! <b>${handDisplay}</b>. <span style="color:#c82d2d;">-${delta} points.</span>`;
  } else if (outcome === 3) { // other player tsumos
    delta = pointObj.tsumo;
    pts -= delta;
    scoreMsg = `Another player tsumo! <b>${handDisplay}</b>. <span style="color:#c82d2d;">-${delta} points.</span>`;
  } else if (outcome === 4) {
    delta = 0;
    scoreMsg = `Ryuukyoku (draw). No change.`;
  }
  sim('events').innerHTML = ` <b>${scoreMsg}</b>`;
  sim('spinner').innerHTML = '';
  state.points = pts;

  setTimeout(() => showContinueBtn(shouldDealerRepeat()), 1000);
}

function shouldDealerRepeat() {
  if (state.isDealer) {
    // Dealer: win or draw
    return state.outcome === 0 || state.outcome === 1 || state.outcome === 4;
  }
  // Non-dealer: never repeat
  return false;
}

function showContinueBtn(isRepeat) {
  sim('choices').innerHTML = '';
  sim('events').innerHTML = sim('events').innerHTML.replace("Spinning for points...", "");

  // At South 4, show "Results Report" instead of "Continue to Next Hand"
  if (state.roundIdx === rounds.length - 1 && !state.finished) {
    const resultsBtn = document.createElement('button');
    resultsBtn.textContent = "Results Report";
    resultsBtn.className = "mahjong-sim-btn";
    resultsBtn.style.background = "#ffd27d";
    resultsBtn.onclick = () => {
      state.finished = true;
      updateHeader();
      showFinalStats();
      sim('choices').innerHTML = '';
      sim('spinner').innerHTML = '';
    };
    sim('choices').appendChild(resultsBtn);
    return;
  }

  // Only show the continue button if not finished
  if (!state.finished) {
    const contBtn = document.createElement('button');
    contBtn.textContent = "Continue to Next Hand";
    contBtn.className = "mahjong-sim-btn";
    contBtn.style.background = "#fff8e1";
    contBtn.onclick = () => nextStep("nextRound", isRepeat);
    sim('choices').appendChild(contBtn);
  }
}

function nextStep(step, isRepeat = false) {
  // Prevent any further interaction after game end
  if (state.finished) return;

  if (step === "choice") {
    showSelectedChoice();
  } else if (step === "spinOutcome") {
    showOutcomeSpinner();
  } else if (step === "pointCalcBtn") {
    showPointCalcBtn();
  } else if (step === "nextRound") {
    if (isRepeat) {
      state.repeat = (state.repeat || 0) + 1;
      updateHeader();
      updateFooter();
      state.selectedChoice = null;
      state.outcome = null;
      state.pointResult = null;
      showChoices();
      return;
    } else {
      state.repeat = 0;
      state.roundIdx++;
    }
    if (state.roundIdx >= rounds.length) {
      state.finished = true;
      updateHeader();
      showFinalStats();
      sim('choices').innerHTML = '';
      sim('spinner').innerHTML = '';
      return;
    }
    state.selectedChoice = null;
    state.outcome = null;
    state.pointResult = null;
    updateHeader();
    updateFooter();
    showChoices();
  }
}

function showFinalStats() {
  // Calculate stats
  const score = state.points;
  let placement;
  if (score >= 32000) {
    placement = "1st";
  } else if (score >= 25000) {
    placement = "2nd";
  } else if (score >= 20000) {
    placement = "3rd";
  } else {
    placement = "4th";
  }
  const hands = state.stats.numHands || 1;
  const winRate = ((state.stats.winCount / hands) * 100).toFixed(1);
  const dealInRate = ((state.stats.dealinCount / hands) * 100).toFixed(1);

  let statsHtml = `
    <div style="font-size:13px;text-align:center;line-height:1.35;margin-top:4px;">
      <b>Final Score:</b> <span style="color:#b84c00">${score}</span><br>
      <b>Placement:</b> <span style="color:#205">${placement}</span><br>
      <b>Win rate:</b> <span style="color:#176d37">${winRate}%</span><br>
      <b>Deal in rate:</b> <span style="color:#c82d2d">${dealInRate}%</span>
      <hr style="border:none;border-top:1px solid #e3ba63;margin:5px 0 4px 0;">
      <span style="font-size:12px;color:#b97;">Interpolate your luck based on this data. Good luck!</span>
    </div>
  `;
  sim('choices').innerHTML = '';
  sim('events').innerHTML = statsHtml;
  sim('spinner').innerHTML = '';
  updateFooter();
}

// --- Game Start ---
function startGame() {
  state = {
    roundIdx: 0,
    points: 25000,
    selectedChoice: null,
    outcome: null,
    pointResult: null,
    isDealer: false,
    finished: false,
    repeat: 0,
    lastDealerRound: -1,
    started: true,
    stats: {
      numHands: 0,
      winCount: 0,
      dealinCount: 0
    }
  };
  updateHeader();
  updateFooter();
  showChoices();
}

// --- INIT ---
document.addEventListener("DOMContentLoaded", showBanner);