import React, { useState } from 'react';
import { strategyGameFactory } from '../strategy-game';
import { range } from 'lodash';

const primeList = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151,
  157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233,
  239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317,
  331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419,
  421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503,
  509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607,
  613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701,
  709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811,
  821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911,
  919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997
];

const generateNewBoard = () => {
  return Math.floor(Math.random()*1000+1);
};

const GameBoard = ({board, setBoard, ctx}) => {
  const [firstTurnPhase, setFirstTurnPhase] = useState(true);
  const [playerPrime, setPlayerPrime] = useState(null);
  const [hovered, setHovered] = useState(null);

  const choosePrime = (p) => {
    setPlayerPrime(p);
    setFirstTurnPhase(false);
    ctx.setTurnStage("e");
    setHovered(null);
  }

  const chooseExponential = (e) => {
    let newBoard = board;
    newBoard -= playerPrime ** e;
    setPlayerPrime(null);
    setFirstTurnPhase(true);
    ctx.setTurnStage("p");
    ctx.endPlayerTurn(getGameStateAfterMove(newBoard));
  }

  const generateTable = () => {
    let exponentCells = [];

    for(let e = 0; playerPrime**e <= board; e++) {
      const cell = <td
        className={`border-4 aspect-square ${hovered === e ? 'bg-gray-300' : ''}`}
        onClick={() => chooseExponential(e)}>
        <button
            className={`w-full p-[5%] aspect-square`}
            onMouseOver={() => setHovered(e)}
            onMouseOut={() => setHovered(null)}
            onFocus={() => setHovered(e)}
            onBlur={() => setHovered(null)}
        >{e}
        </button>
      </td>
      exponentCells.push(cell);
    }

    let widthClassNames;

    switch (exponentCells.length*10) {
      case 10:
        widthClassNames = "w-[10%] min-w-[10%]";
        break;
      case 20:
        widthClassNames = "w-[20%] min-w-[20%]";
        break;
      case 30:
        widthClassNames = "w-[30%] min-w-[30%]";
        break;
      case 40:
        widthClassNames = "w-[40%] min-w-[40%]";
        break;
      case 50:
        widthClassNames = "w-[50%] min-w-[50%]";
        break;
      case 60:
        widthClassNames = "w-[60%] min-w-[60%]";
        break;
      case 70:
        widthClassNames = "w-[70%] min-w-[70%]";
        break;
      case 80:
        widthClassNames = "w-[80%] min-w-[80%]";
        break;
      case 90:
        widthClassNames = "w-[90%] min-w-[90%]";
        break;
      default:
        widthClassNames = "w-[100%] min-w-[100%]";
    }

    return (<table className={`m-2 border-collapse table-fixed ${widthClassNames}`}>
      <tbody><tr>
        {exponentCells.map(cell => (cell))}
      </tr></tbody>
    </table>);
  }

  let choosablePrimesList = primeList.filter(i => i <= board);
  if (choosablePrimesList.length === 0) {
    choosablePrimesList = [2];
  }
  const widthClassName = `w-[${(Math.min(choosablePrimesList.length, 10))*10}%]`;

  return (
    <section className='p-2 shrink-0 grow basis-2/3'>
      <p className='w-full text-8xl font-bold text-center'>{board}</p><br />
      {!ctx.shouldPlayerMoveNext ? ''
      : <>{firstTurnPhase ?
        <table className={`m-2 border-collapse table-fixed max-w-full ${widthClassName}`}><tbody>
          {range(Math.floor(choosablePrimesList.length/10)+1).map(i => (
            <tr>
              {range(Math.min(10, choosablePrimesList.slice(i*10, choosablePrimesList.length).length)).map(j => (
                <td
                  className={`max-w-[10%] border-4 ${hovered===primeList[10*i+j] ? `bg-gray-300` : ''}`}
                  onClick={() => choosePrime(primeList[10*i+j])}
                >
                  <button
                    className='w-full p-[5%] aspect-square'
                    onMouseOver={() => setHovered(primeList[10*i+j])}
                    onMouseOut={() => setHovered(null)}
                    onFocus={() => setHovered(primeList[10*i+j])}
                    onBlur={() => setHovered(null)}
                  >
                    {primeList[10*i+j]}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody></table>
      : generateTable()}</>}
    </section>
  );
}

const getGameStateAfterMove = (newBoard) => {
  return { newBoard, isGameEnd: newBoard === 0, winnerIndex: null };
}

const getGameStateAfterAiTurn = ({ board }) => {
  let newBoard = board;
  let choosenPrime;
  let choosenExponential;
  if (newBoard%6 === 0) {
    choosenPrime = primeList[Math.floor(Math.random()*primeList.filter(i => i<newBoard).length)];
    choosenExponential = Math.floor(Math.random()*(Math.floor(Math.log(newBoard)/Math.log(choosenPrime))+1));
  } else if (newBoard === 1)  {
    choosenPrime = 2;
    choosenExponential = 0;
  } else {
    let possibleMoves = [];
    for (let i = 0; i < primeList.length; i++) {
      if (primeList[i] > newBoard) {
        break;
      }
      for (let j = 0; primeList[i]**j <= newBoard; j++) {
        if((newBoard - primeList[i]**j) % 6 === 0) {
          possibleMoves.push([primeList[i], j]);
        }
      }
    }
    const rnd = Math.floor(Math.random()*possibleMoves.length);
    choosenPrime = possibleMoves[rnd][0];
    choosenExponential = possibleMoves[rnd][1];
  }
  newBoard -= choosenPrime**choosenExponential;
  return getGameStateAfterMove(newBoard);
}

const getPlayerStepDescription = ({ turnStage }) => {
  return !(turnStage==="e")
    ? 'Válaszd ki a prímet, aminek a hatványát ki szeretnéd vonni.'
    : 'Válaszd ki a kitevőt, amelyre a prímet emelnéd.';
}

const rule = <>
Egy adott számtól kezdődik a játék, (a gép 1 és 1000 között véletlenszerűen generál egy számot),
ebből a játékosok felváltva vonnak le egy tetszőleges
prímhatványt. Az nyer, aki a nullát mondja!
</>

const Game = strategyGameFactory({
  rule,
  title: 'Prímhatványok kivonása',
  GameBoard,
  G: {
    getPlayerStepDescription,
    generateNewBoard,
    getGameStateAfterAiTurn
  }
})

export const PrimeExponentials = () => {
  const [board, setBoard] = useState(generateNewBoard());

  return <Game board={board} setBoard={setBoard} />;
};
