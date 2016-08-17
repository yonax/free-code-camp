function State(cells, turn, ply, winner) {
  this.cells = cells || Array(9).fill(0);
  this.turn = turn || 1;
  this.ply = ply || 0;
  this.winner = winner || 0;
}
State.prototype.play = function play(n) {
  this.cells[n] = this.turn;
  this.turn = 3 - this.turn;
  this.ply += 1;
  this.winner = this.checkWinner().winner;
  return this;
};
State.prototype.canPlay = function canPlay(n) {
  return this.cells[n] === 0;
};
State.prototype.clone = function clone(n) {
  return new State(this.cells.slice(), this.turn, this.ply);
};
State.prototype.playClone = function playClone(n) {
  return this.clone().play(n);
};
State.prototype.legalMoves = function legalMoves() {
  return this.cells.reduce((moves, cell, idx) => cell === 0 ? moves.concat([idx]) : moves, []);
}
State.prototype.checkWinner = function checkWinner() {
  var winSeqs = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]
  ];
  var free = 0;
  for(let seq of winSeqs) {
    var a = this.cells[seq[0]];
    var b = this.cells[seq[1]];
    var c = this.cells[seq[2]];
    if (a !== 0 && a === b && a === c) {
      return {winner: a, seq: seq};
    }
    free += a === 0 || b === 0 || c === 0;
  }
  return free > 0 ? {winner: 0, seq: []} : {winner: 3, seq: []};
}

var random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
var choice = arr => arr[random(0, arr.length - 1)];

function findBestMove(state) {
  var bestMove = {moves: []};
  negamax(state, -1000, 1000, bestMove);
  return choice(bestMove.moves)
}

function negamax(state, a, b, bestMove) {
  if (state.winner !== 0) {
    return state.winner === 3 ? 0 : -100+state.ply;
  }
  var bestValue = -1000;
  for (let move of state.legalMoves()) {
    var v = -negamax(state.playClone(move), -b, -a);
    if (v > bestValue) {
      bestValue = v;
      if (bestMove) bestMove.moves = [move];
      a = Math.max(a, v);
      if (a > b) break;
    } else if (bestMove && v === bestValue) {
      bestMove.moves.push(move);
    }
  }
  return bestValue;
}

function render(state, field, cells) {
  var winInfo = state.checkWinner();
  if (winInfo.winner === 0) {
    field.className = `field ${['', 'x', 'o'][state.turn]}-turn`;
  }
  var classNames = ['cell', 'cell taken x-sign', 'cell taken o-sign'];
  state.cells.forEach((cellState, idx) => {
    cells[idx].className = classNames[cellState] + (winInfo.seq.indexOf(idx) !== -1 ? ' flash' : '');
  });
}

var $ = document.querySelector.bind(document);
var $$ = sel => Array.from(document.querySelectorAll(sel));
var on = (node, evt, sel, cb) =>  node.addEventListener(evt, (e) => e.target.matches(sel) ? cb(e) : void 0);

!function main() {
  var field = $('.field');
  var cells = $$('.cell')
  var menu = $('.menu');
  var info = $('#info');
  var state = new State();

  setTimeout(() => menu.classList.remove('hidden'), 200);

  function getMessage(winner) {
    return ['X won!', 'O won!', "It's tie."][winner - 1] + ' Play again?';
  }

  function toggleMenu() {
    menu.classList.toggle('hidden');
    field.classList.toggle('hidden');
  };

  function play(move) {
    state.play(move);
    render(state, field, cells);

    if (state.winner !== 0) {
      info.textContent = getMessage(state.winner);
      setTimeout(() => {
        state = new State();
        render(state, field, cells);
        toggleMenu();
      }, state.winner === 3 ? 500 : 1500);
      return true;
    }
    return false;
  }

  on(menu, 'click', '.side', function selectSide(event) {
    toggleMenu()
    var player = +event.target.dataset.side;
    if (player === 2) {
      state.play(findBestMove(state));
    }
    setTimeout(() => render(state, field, cells), 500);
  });

  on(field, 'click', '.cell', function makeMove(event) {
    if (state.winner !== 0) return;

    var playerMove = +event.target.dataset.idx;
    if (state.canPlay(playerMove)) {
      if (play(playerMove)) return;

      var aiMove = findBestMove(state);
      play(aiMove);
    }
  });
}();
