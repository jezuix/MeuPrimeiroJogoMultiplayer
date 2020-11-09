import { mod } from './utils.js';

export default function createGame() {
    'use strict'

    const state = {
        players: {},
        fruits: {},
        fruitLimit: 50,
        fruitFrequency: 2000,
        screen: {
            width: 15,
            height: 15
        }
    }

    const observers = [];

    function start() {
        setInterval(addFruit, state.fruitFrequency);
    }

    function subscribe(observerFunction) {
        observers.push(observerFunction);
    }

    function notifyAll(command) {
        for (const observerFunction of observers) {
            observerFunction(command);
        }
    }

    function setState(newState) {
        Object.assign(state, newState);
    }

    function addPlayer(command) {
        const playerId = command.playerId;
        const playerName = command.playerName;
        const playerX = 'playerX' in command ? command.playerX : Math.floor(Math.random() * state.screen.width);
        const playerY = 'playerY' in command ? command.playerY : Math.floor(Math.random() * state.screen.height);
        const score = 0;

        state.players[playerId] = {
            x: playerX,
            y: playerY,
            score,
            playerName
        }

        notifyAll({
            type: 'add-player',
            playerId,
            playerX,
            playerY,
            playerName
        });
    }

    function removePlayer(command) {
        const playerId = command.playerId;
        delete state.players[playerId];

        notifyAll({
            type: 'remove-player',
            playerId
        });
    }

    function addFruit(command) {
        const fruitLimit = state.fruitLimit;
        const fruitsInGame = Object.keys(state.fruits).length;
        if (!fruitLimit || fruitsInGame < fruitLimit) {
            const fruitId = command ? command.fruitId : Math.floor(Math.random() * 100000000);
            const fruitX = command ? command.fruitX : Math.floor(Math.random() * state.screen.width);
            const fruitY = command ? command.fruitY : Math.floor(Math.random() * state.screen.height);

            state.fruits[fruitId] = {
                x: fruitX,
                y: fruitY
            }

            notifyAll({
                type: 'add-fruit',
                fruitId,
                fruitX,
                fruitY
            });
        }
    }

    function removeFruit(command) {
        const fruitId = command.fruitId;
        delete state.fruits[fruitId];

        notifyAll({
            type: 'remove-fruit',
            fruitId
        });
    }

    function movePlayer(command) {
        notifyAll(command);

        const acceptedMoves = {
            ArrowUp(player) {
                player.y = mod(state.screen.height, player.y - 1);
            },
            ArrowRight(player) {
                player.x = mod(state.screen.width, player.x + 1);
            },
            ArrowDown(player) {
                player.y = mod(state.screen.height, player.y + 1);
            },
            ArrowLeft(player) {
                player.x = mod(state.screen.width, player.x - 1);
            }
        }

        const keyPressed = command.keyPressed;
        const playerId = command.playerId;
        const player = state.players[playerId];
        const moveFunction = acceptedMoves[keyPressed];

        if (player && moveFunction) {
            moveFunction(player);
            checkForPlayerFruitCollision(playerId);
        }
    }

    function checkForPlayerFruitCollision(playerId) {
        const player = state.players[playerId];
        checkForObjectCollisionWithObjects(player, state.fruits, (fruitId) => {
            removeFruit({ fruitId });
            player.score++;
        });
    }

    function checkForObjectCollisionWithObjects(object1, objects, callback, returnOnFirst = false) {
        const returns = [];
        for (const object2 in objects) {
            let object2Props = objects[object2];
            if (checkForObjectCollision(object1, object2Props)) {
                returns.push(object2);
                if (returnOnFirst) {
                    break;
                }
            }
        }
        if (!callback) {
            return returns;
        } else {
            returns.forEach((element, index) => {
                callback(element, index);
            });
        }
    }

    function checkForObjectCollision(object1, object2) {
        return checkForCollision(object1.x, object1.y, object2.x, object2.y);
    }

    function checkForCollision(object1X, object1Y, object2X, object2Y) {
        return (object1X === object2X && object1Y === object2Y);
    }

    function getPlayersArray() {
        const playersArray = [];
        for (let playerId in state.players) {
            const player = state.players[playerId];
            playersArray.push({
                playerId: playerId,
                x: player.x,
                y: player.y,
                score: player.score,
                playerName: player.playerName
            });
        }

        return playersArray;
    }

    return {
        addPlayer,
        removePlayer,
        addFruit,
        removeFruit,
        movePlayer,
        state,
        setState,
        subscribe,
        start,
        getPlayersArray
    }
}