import React, { StrictMode, Suspense, lazy } from 'react';
import { createHashRouter, RouterProvider } from 'react-router';
import { Overview } from '../overview/overview';
import { ErrorPage } from '../error-page';

const lazyNamed = (importFn, name) =>
  lazy(() => importFn().then(m => ({ default: m[name] })));

/*
Import all the games individually. Aim to keep abc ordering for easy navigation.
*/

const AddReduceDouble = lazyNamed(() => import('../games/pile-splitting-games/add-reduce-double/add-reduce-double'), 'AddReduceDouble');
const AntiTicTacToe = lazyNamed(() => import('../games/tictactoe-alikes/anti-tictactoe/anti-tictactoe'), 'AntiTicTacToe');
const Bacteria = lazyNamed(() => import('../games/bacteria/bacteria'), 'Bacteria');
const BankRobbers = lazyNamed(() => import('../games/bank-robbers/bank-robbers'), 'BankRobbers');
const ChessBishops = lazyNamed(() => import('../games/chess-bishops/chess-bishops'), 'ChessBishops');
const ChessDucksC = lazyNamed(() => import('../games/chess-ducks/chess-ducks'), 'ChessDucksC');
const ChessDucksE = lazyNamed(() => import('../games/chess-ducks/chess-ducks'), 'ChessDucksE');
const ChessKnight = lazyNamed(() => import('../games/chess-knight/chess-knight'), 'ChessKnight');
const ChessRook = lazyNamed(() => import('../games/chess-rook/chess-rook'), 'ChessRook');
const Coin123 = lazyNamed(() => import('../games/coin-3-piles/coin123'), 'Coin123');
const Coin357 = lazyNamed(() => import('../games/coin-3-piles/coin357'), 'Coin357');
const CubeColoring = lazyNamed(() => import('../games/cube-coloring/cube-coloring'), 'CubeColoring');
const DominoesOnChessboard = lazyNamed(() => import('../games/dominoes-on-chessboard/dominoes-on-chessboard'), 'DominoesOnChessboard');
const FiveFiveCard = lazyNamed(() => import('../games/five-five-card/five-five-card'), 'FiveFiveCard');
const FiveSquares = lazyNamed(() => import('../games/five-squares/five-squares'), 'FiveSquares');
const FourPilesSpreadAhead = lazyNamed(() => import('../games/pile-splitting-games/four-piles-spread-ahead/four-piles-spread-ahead'), 'FourPilesSpreadAhead');
const HunyadiAndTheJanissaries = lazyNamed(() => import('../games/hunyadi-and-the-janissaries/hunyadi-and-the-janissaries'), 'HunyadiAndTheJanissaries');
const NumberCovering10 = lazyNamed(() => import('../games/number-covering/number-covering'), 'NumberCovering10');
const NumberCovering8 = lazyNamed(() => import('../games/number-covering/number-covering'), 'NumberCovering8');
const PairsOfNumbers = lazyNamed(() => import('../games/pairs-of-numbers/pairs-of-numbers'), 'PairsOfNumbers');
const PileSplitter = lazyNamed(() => import('../games/pile-splitting-games/pile-splitter/pile-splitter'), 'PileSplitter');
const PileSplitter3 = lazyNamed(() => import('../games/pile-splitting-games/pile-splitter-3/pile-splitter-3'), 'PileSplitter3');
const PileSplitter4 = lazyNamed(() => import('../games/pile-splitting-games/pile-splitter-4/pile-splitter-4'), 'PileSplitter4');
const PlusOneTwoThree = lazyNamed(() => import('../games/plus-one-two-three/plus-one-two-three'), 'PlusOneTwoThree');
const PolicemanthiefA = lazyNamed(() => import('../games/policeman-thief/policeman-thief'), 'PolicemanthiefA');
const PolicemanthiefB = lazyNamed(() => import('../games/policeman-thief/policeman-thief'), 'PolicemanthiefB');
const PrimeExponentials = lazyNamed(() => import('../games/prime-exponentials/prime-exponentials'), 'PrimeExponentials');
const RemoveDivisorMultiple = lazyNamed(() => import('../games/remove-divisor-multiple/remove-divisor-multiple'), 'RemoveDivisorMultiple');
const RockPaperScissor = lazyNamed(() => import('../games/rock-paper-scissor/rock-paper-scissor'), 'RockPaperScissor');
const SharkChase4 = lazyNamed(() => import('../games/shark-chase/shark-4-by-4/shark-chase'), 'SharkChase4');
const SharkChase5 = lazyNamed(() => import('../games/shark-chase/shark-5-by-5/shark-chase'), 'SharkChase5');
const SixDiscs = lazyNamed(() => import('../games/discs-turn-or-remove/discs-turn-or-remove'), 'SixDiscs');
const StonesRemoveOneNotTwiceFromLeft = lazyNamed(() => import('../games/stones-remove-one-not-twice-from-left/stones-remove-one-not-twice-from-left'), 'StonesRemoveOneNotTwiceFromLeft');
const SuperstitiousCounting = lazyNamed(() => import('../games/superstitious-counting/superstitious-counting'), 'SuperstitiousCounting');
const Take1OrHalve = lazyNamed(() => import('../games/take-1-or-halve/take-1-or-halve'), 'Take1OrHalve');
const TakePowerOfTwo = lazyNamed(() => import('../games/take-power-of-two/take-power-of-two'), 'TakePowerOfTwo');
const TenDiscs = lazyNamed(() => import('../games/discs-turn-or-remove/discs-turn-or-remove'), 'TenDiscs');
const ThievesMean7 = lazyNamed(() => import('../games/thieves-mean/thieves-mean-7/thieves-mean-7'), 'ThievesMean7');
const ThievesMean9 = lazyNamed(() => import('../games/thieves-mean/thieves-mean-9/thieves-mean-9'), 'ThievesMean9');
const TicTacToe = lazyNamed(() => import('../games/tictactoe-alikes/tictactoe/tictactoe'), 'TicTacToe');
const TicTacToeDoubleStart = lazyNamed(() => import('../games/tictactoe-alikes/tictactoe-doublestart/tictactoe-doublestart'), 'TicTacToeDoubleStart');
const TriangleColoring = lazyNamed(() => import('../games/triangle-coloring/triangle-coloring'), 'TriangleColoring');
const TriangularGridRopes = lazyNamed(() => import('../games/triangular-grid-ropes/triangular-grid-ropes'), 'TriangularGridRopes');
const TwelveSquares = lazyNamed(() => import('../games/twelve-squares/twelve-squares'), 'TwelveSquares');
const TwoTimesTwo = lazyNamed(() => import('../games/two-times-two/two-times-two'), 'TwoTimesTwo');

export const App = () => {
  const routes = [
    { path: '/', element: <Overview /> },
    { path: '/game/AddReduceDouble', element: <AddReduceDouble /> },
    { path: '/game/AntiTicTacToe', element: <AntiTicTacToe /> },
    { path: '/game/Bacteria', element: <Bacteria />},
    { path: '/game/BankRobbers', element: <BankRobbers /> },
    { path: '/game/ChessBishops', element: <ChessBishops /> },
    { path: '/game/ChessDucksC', element: <ChessDucksC />},
    { path: '/game/ChessDucksE', element: <ChessDucksE />},
    { path: '/game/ChessKnight', element: <ChessKnight />},
    { path: '/game/ChessRook', element: <ChessRook /> },
    { path: '/game/Coin123', element: <Coin123 /> },
    { path: '/game/Coin357', element: <Coin357 /> },
    { path: '/game/CubeColoring', element: <CubeColoring /> },
    { path: '/game/DominoesOnChessboard', element: <DominoesOnChessboard />},
    { path: '/game/FiveFiveCard', element: <FiveFiveCard /> },
    { path: '/game/FiveSquares', element: <FiveSquares /> },
    { path: '/game/FourPilesSpreadAhead', element: <FourPilesSpreadAhead /> },
    { path: '/game/HunyadiAndTheJanissaries', element: <HunyadiAndTheJanissaries /> },
    { path: '/game/NumberCovering10', element: <NumberCovering10 /> },
    { path: '/game/NumberCovering8', element: <NumberCovering8 /> },
    { path: '/game/PairsOfNumbers', element: <PairsOfNumbers />},
    { path: '/game/PileSplitter', element: <PileSplitter /> },
    { path: '/game/PileSplitter3', element: <PileSplitter3 /> },
    { path: '/game/PileSplitter4', element: <PileSplitter4 /> },
    { path: '/game/PlusOneTwoThree', element: <PlusOneTwoThree />},
    { path: '/game/Policemanthief', element: <PolicemanthiefA />},
    { path: '/game/PolicemanthiefB', element: <PolicemanthiefB />},
    { path: '/game/PrimeExponentials', element: <PrimeExponentials />},
    { path: '/game/RemoveDivisorMultiple', element: <RemoveDivisorMultiple />},
    { path: '/game/rockPaperScissor', element: <RockPaperScissor /> },
    { path: '/game/SharkChase4', element: <SharkChase4 />},
    { path: '/game/SharkChase5', element: <SharkChase5 />},
    { path: '/game/SixDiscs', element: <SixDiscs />},
    { path: '/game/StonesRemoveOneNotTwiceFromLeft', element: <StonesRemoveOneNotTwiceFromLeft />},
    { path: '/game/SuperstitiousCounting', element: <SuperstitiousCounting /> },
    { path: '/game/Take1OrHalve', element: <Take1OrHalve /> },
    { path: '/game/TakePowerOfTwo', element: <TakePowerOfTwo />},
    { path: '/game/TenDiscs', element: <TenDiscs />},
    { path: '/game/ThievesMean', element: <ThievesMean7 />},
    { path: '/game/ThievesMean9', element: <ThievesMean9 />},
    { path: '/game/TicTacToe', element: <TicTacToe /> },
    { path: '/game/TicTacToeDoubleStart', element: <TicTacToeDoubleStart /> },
    { path: '/game/TriangleColoring', element: <TriangleColoring />},
    { path: '/game/TriangularGridRopes', element: <TriangularGridRopes /> },
    { path: '/game/TwelveSquares', element: <TwelveSquares />},
    { path: '/game/TwoTimesTwo', element: <TwoTimesTwo /> }
  ];

  const router = createHashRouter(
    routes.map(route => ({...route, errorElement: <ErrorPage /> }))
  );

return <StrictMode>
    <Suspense fallback={<div>Loading game...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  </StrictMode>;
};
