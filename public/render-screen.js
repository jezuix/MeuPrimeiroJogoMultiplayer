export function setupScreen(canvas, game) {
    'use strict'

    const { screen: { width, height } } = game.state;
    canvas.width = width;
    canvas.height = height;
}

export default function renderScreen(screen, scoreTable, game, requestAnimationFrame, currentPlayerId) {
    'use strict'

    const context = screen.getContext('2d');
    context.fillStyle = 'white';
    const { screen: { width, height } } = game.state;
    context.clearRect(0, 0, width, height);

    for (const playerId in game.state.players) {
        const player = game.state.players[playerId];
        context.fillStyle = 'black';
        context.fillRect(player.x, player.y, 1, 1);
    }
    for (const fruitId in game.state.fruits) {
        const fruit = game.state.fruits[fruitId];
        context.fillStyle = 'green';
        context.fillRect(fruit.x, fruit.y, 1, 1);
    }

    updateScoreTable(scoreTable, game, currentPlayerId);

    const currentPlayer = game.state.players[currentPlayerId];
    if (currentPlayer) {
        context.fillStyle = '#F0DB4F';
        context.fillRect(currentPlayer.x, currentPlayer.y, 1, 1);
    }

    requestAnimationFrame(() => {
        renderScreen(screen, scoreTable, game, requestAnimationFrame, currentPlayerId);
    });

    function updateScoreTable(scoreTable, game, currentPlayerId) {
        const maxResults = 10;

        let scoreTableInnerHTML = `
            <tr class="header">
                <td>Top 10 Jogadores</td>
                <td>Pontos</td>
            </tr>`

        const playersArray = game.getPlayersArray();

        const playerSortedByScore = playersArray.sort((first, second) => {
            if (first.score < second.score) {
                return 1;
            }
            if (first.score > second.score) {
                return -1;
            }
            return 0;
        });

        const topScorePlayers = playerSortedByScore.slice(0, maxResults);

        scoreTableInnerHTML = topScorePlayers.reduce((stringFormed, player) => {
            return stringFormed + `
                <tr ${player.playerId === currentPlayerId ? 'class="current-player"' : ''}>
                    <td class="player-id">${player.playerName}</td>
                    <td class="player-score">${player.score}</td>
                </tr>
            `
        }, scoreTableInnerHTML);

        const currentPlayerScore = playersArray.find((player) => player.playerId === currentPlayerId);

        if (currentPlayerScore) {
            scoreTableInnerHTML += `
                <tr>
                    <td></td>
                </tr>
                <tr>
                    <td>My Score</td>
                </tr>
                <tr class="current-player bottom">
                    <td class="socket-id player-id">${currentPlayerScore.playerName}</td>
                    <td class="score-value player-score">${currentPlayerScore.score}</td>
                </tr>
            `
        }

        scoreTable.innerHTML = scoreTableInnerHTML;
    }
}