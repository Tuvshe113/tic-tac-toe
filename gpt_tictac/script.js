let player = null;
let turn = false;
const socket = new WebSocket('ws://localhost:8080');

const cells = document.querySelectorAll('.cell');
const status = document.getElementById('status');

cells.forEach(cell => {
    cell.addEventListener('click', () => {
        if (turn && !cell.textContent) {
            socket.send(JSON.stringify({
                type: 'move',
                index: cell.dataset.index,
                player
            }));
        }
    });
});

socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'player') {
        player = data.player;
        status.textContent = `You are player ${player}`;
    }

    if (data.type === 'start') {
        turn = data.turn;
        status.textContent = turn ? 'Your turn' : 'Opponent\'s turn';
    }

    if (data.type === 'move') {
        cells[data.index].textContent = data.player === 1 ? 'X' : 'O';
        turn = data.turn;
        status.textContent = turn ? 'Your turn' : 'Opponent\'s turn';
    }

    if (data.type === 'winner') {
        status.textContent = data.player === 'draw' ? 'Draw!' : `Player ${data.player} wins!`;
    }

    if (data.type === 'reset') {
        cells.forEach(cell => cell.textContent = '');
        status.textContent = turn ? 'Your turn' : 'Opponent\'s turn';
    }
});
