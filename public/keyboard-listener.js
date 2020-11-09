export default function createKeyboardListener(document) {
    'use strict'
    
    const state = {
        observers: [],
        playerId: null
    }

    function registerPlayerId(playerId){
        state.playerId = playerId;
    }

    function subscribe(observerFunction) {
        state.observers.push(observerFunction);
    }

    function unsubscribeAll(){
        state.observers = [];
    }

    function notifyAll(command) {
        for (const observerFunction of state.observers) {
            observerFunction(command);
        }
    }

    document.addEventListener('keydown', handleKeydown)

    function handleKeydown(event) {
        const keyPressed = event.key;
        const command = {
            type: 'mover-player',
            playerId: state.playerId,
            keyPressed
        }

        notifyAll(command);
    }

    return {
        registerPlayerId,
        subscribe,
        unsubscribeAll
    }
}
