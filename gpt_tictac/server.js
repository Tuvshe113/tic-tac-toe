const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

let players = [];
let board = Array(9).fill(null);

wss.on('connection', (ws) => {
    if (players.length < 2) {
        players.push(ws);
        ws.send(JSON.stringify({ type: 'player', player: players.length }));

        if (players.length === 2) {
            players[0].send(JSON.stringify({ type: 'start', turn: true }));
            players[1].send(JSON.stringify({ type: 'start', turn: false }));
        }
    } else {
        ws.close();
    }

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'move') {
            board[data.index] = data.player;
            players.forEach((player, index) => {
                player.send(JSON.stringify({
                    type: 'move',
                    index: data.index,
                    player: data.player,
                    turn: index !== data.player - 1
                }));
            });

            // Check for a winner
            const winner = checkWinner();
            if (winner) {
                players.forEach(player => player.send(JSON.stringify({ type: 'winner', player: winner })));
                resetGame();
            }
        }
    });

    ws.on('close', () => {
        players = players.filter(player => player !== ws);
        resetGame();
    });
});

const checkWinner = () => {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    return board.includes(null) ? null : 'draw';
};

const resetGame = () => {
    board = Array(9).fill(null);
    players.forEach(player => player.send(JSON.stringify({ type: 'reset' })));
};

server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});
