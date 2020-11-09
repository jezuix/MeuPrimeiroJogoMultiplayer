'use strict'

import express from 'express';
import http from 'http';
import createGame from './public/game.js';
import socketio from 'socket.io';

const app = express();
const server = http.createServer(app);
const sockets = socketio(server);

app.use(express.static('public'));

const game = createGame();
game.start();

game.subscribe((command) => {
    console.log(`> Emitting ${command.type}`);
    sockets.emit(command.type, command);
});

sockets.on('connect', (socket) => {
    const playerId = socket.id;
    const playerName = socket.handshake.query.userName;
    const playersArray = game.getPlayersArray();
    const duplicateName = playersArray.find((player) => player.playerName === playerName);
    console.log(game);

    if (!playerName || duplicateName) {
        socket.emit('duplicate-player-name', { type: 'duplicate-player-name' });
        return;
    }

    game.addPlayer({ playerId: playerId, playerName: playerName });
    console.log(`> Player connected on Server with id: ${playerId} and name: ${playerName}`);

    socket.emit('setup', game.state);

    socket.on('disconnect', () => {
        game.removePlayer({ playerId });
        console.log(`> Player disconnected: ${playerId}`);
    });

    socket.on('move-player', (command) => {
        command.playerId = playerId;
        command.type = 'move-player';

        game.movePlayer(command);
    })
});

server.listen(3000, () => {
    console.log('> Server listening on port: 3000');
});