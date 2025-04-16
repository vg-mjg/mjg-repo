let puzzles = [];
let currentIndex = 0;

function displayPuzzle(puzzle, date) {
  const container = document.getElementById('puzzleContainer');
  container.innerHTML = '';

  const title = document.createElement('h3');
  title.textContent = `Puzzle Date: ${date}`;
  container.appendChild(title);

  const info = document.createElement('p');
  info.innerHTML = `<b>Seat:</b> ${puzzle.seat}, <b>Round:</b> ${puzzle.round}, <b>Turn:</b> ${puzzle.turn}`;
  container.appendChild(info);

  const dora = document.createElement('p');
  dora.innerHTML = `<b>Dora Indicator:</b> ${puzzle.indicator}`;
  container.appendChild(dora);

  const hand = document.createElement('p');
  hand.innerHTML = `<b>Hand:</b> ${puzzle.hand.join(' ')}`;
  container.appendChild(hand);

  const draw = document.createElement('p');
  draw.innerHTML = `<b>Draw:</b> ${puzzle.draw}`;
  container.appendChild(draw);

  const answer = document.createElement('p');
  answer.innerHTML = `<b>Answer:</b> ${puzzle.answer}`;
  container.appendChild(answer);

  const comment = document.createElement('div');
  comment.innerHTML = `<b>Comment:</b><br>${puzzle.comment.map(x => Array.isArray(x) ? x.join('') : x).join('')}`;
  container.appendChild(comment);
}

function updatePuzzle() {
  const dateKeys = Object.keys(puzzles);
  const key = dateKeys[currentIndex];
  const puzzle = puzzles[key];
  displayPuzzle(puzzle, key);
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('wwyd.json')
    .then(response => response.json())
    .then(data => {
      puzzles = data;
      updatePuzzle();
    });

  document.getElementById('prevPuzzle').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + Object.keys(puzzles).length) % Object.keys(puzzles).length;
    updatePuzzle();
  });

  document.getElementById('nextPuzzle').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % Object.keys(puzzles).length;
    updatePuzzle();
  });
});
