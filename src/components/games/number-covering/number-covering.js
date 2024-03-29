import React, { useState } from 'react';
import { strategyGameFactory } from '../strategy-game';
import { range } from 'lodash';

const GameBoard = ({ board, ctx }) => {

    const clickNumber = (number) => {
        if (ctx.shouldPlayerMoveNext) {
            let newBoard = [...board];
            newBoard[number-1] = -1;
            ctx.endPlayerTurn(getGameStateAfterMove(newBoard));
        }
    };


    return(
    <section className="p-2 shrink-0 grow basis-2/3">
        <table className="m-2 border-collapse table-fixed w-full"><tbody>
            <tr>
                {range(board.length).map(i => (
                    board[i]!==-1 ?
                    <td className='text-center border-4 aspect-square'
                    key = {i}
                    onClick={() => clickNumber(i+1)}>
                    {board[i]}</td> :
                    <td className='text-center border-4 bg-blue-300'
                    key = {i}>X</td>
                ))}
            </tr>
        </tbody></table>
    </section>
    );
};

const getGameStateAfterMove = (newBoard) => {
    let remaining = newBoard.filter(i => i>0);
    let isGameEnd = false;
    let winnerIndex = null;
    if (remaining.length === 2) {
        isGameEnd = true;
        winnerIndex = (remaining[0]+remaining[1])%2;
    }
    return { newBoard: newBoard, isGameEnd: isGameEnd, winnerIndex: winnerIndex };
};

const getGameStateAfterAiTurn = ({ board, playerIndex }) => {
    let newBoard = [...board];
    const notCovered = newBoard.filter(i => i!==-1);
    const evens = newBoard.filter(i => i%2===0);
    const odds = newBoard.filter(i => i%2===1 && i!==-1);
    if (evens.length===odds.length || evens.length === 0 || odds.length === 0) {
        newBoard[notCovered[Math.floor(Math.random() * (notCovered.length))]-1] = -1;
    } else {
        if (playerIndex===0){
            let ch = Math.floor(Math.random() * (evens.length>odds.length ? evens.length : odds.length));
            newBoard[(evens.length>odds.length ? evens : odds)[ch]-1] = -1;
        } else {
            let ch = Math.floor(Math.random() * (evens.length<odds.length ? evens.length : odds.length));
            newBoard[(evens.length<odds.length ? evens : odds)[ch]-1] = -1;
        }
    }

    return (getGameStateAfterMove(newBoard));
};

const rule8 = <>
Egy táblázatban 1-től 8-ig szerepelnek a számok. Két játékos felválva takar le 1-1
számot addig, amíg csak 2 szám marad. Ha a megmaradt két szám összege páros, akkor a kezdő
nyer, ha pedig páratlan, akkor a második.
</>;

const rule10 = <>
Egy táblázatban 1-től 10-ig szerepelnek a számok. Két játékos felválva takar le 1-1
számot addig, amíg csak 2 szám marad. Ha a megmaradt két szám összege páros, akkor a kezdő
nyer, ha pedig páratlan, akkor a második.
</>;

const Game8 = strategyGameFactory({
    rule: rule8,
    title: 'Számok lefedés 1-től 8-ig',
    GameBoard,
    G: {
        getPlayerStepDescription: () => 'Kattints egy számra, hogy lefedd',
        generateNewBoard: () => [1,2,3,4,5,6,7,8],
        getGameStateAfterAiTurn
    }
});

const Game10 = strategyGameFactory({
    rule: rule10,
    title: 'Számok lefedés 1-től 10-ig',
    GameBoard,
    G: {
        getPlayerStepDescription: () => 'Kattints egy számra, hogy lefedd',
        generateNewBoard: () => [1,2,3,4,5,6,7,8,9,10],
        getGameStateAfterAiTurn
    }
});

export const NumberCovering8 = () => {
    const [board, setBoard] = useState([1,2,3,4,5,6,7,8]);

    return <Game8 board={board} setBoard={setBoard} />;
};

export const NumberCovering10 = () => {
    const [board, setBoard] = useState([1,2,3,4,5,6,7,8,9,10]);

    return <Game10 board={board} setBoard={setBoard} />;
};
