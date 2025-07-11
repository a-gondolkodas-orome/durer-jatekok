import React, { StrictMode } from 'react';
import { createHashRouter, RouterProvider } from 'react-router';
import { Overview } from '../overview/overview';
import { ErrorPage } from '../error-page';
import { AddReduceDouble } from '../games/pile-splitting-games/add-reduce-double/add-reduce-double';
import { AntiTicTacToe } from '../games/tictactoe-alikes/anti-tictactoe/anti-tictactoe';
import { BankRobbers } from '../games/bank-robbers/bank-robbers';
import { ChessBishops } from '../games/chess-bishops/chess-bishops';
import { ChessRook } from '../games/chess-rook/chess-rook';
import { Coin123 } from '../games/coin-3-piles/coin123';
import { Coin357 } from '../games/coin-3-piles/coin357';
import { CubeColoring } from '../games/cube-coloring/cube-coloring';
import { FiveSquares } from '../games/five-squares/five-squares';
import { FourPilesSpreadAhead } from '../games/pile-splitting-games/four-piles-spread-ahead/four-piles-spread-ahead';
import { HunyadiAndTheJanissaries } from '../games/hunyadi-and-the-janissaries/hunyadi-and-the-janissaries';
import { PileSplitter } from '../games/pile-splitting-games/pile-splitter/pile-splitter';
import { PileSplitter3 } from '../games/pile-splitting-games/pile-splitter-3/pile-splitter-3';
import { PileSplitter4 } from '../games/pile-splitting-games/pile-splitter-4/pile-splitter-4';
import { SuperstitiousCounting } from '../games/superstitious-counting/superstitious-counting';
import { TicTacToe } from '../games/tictactoe-alikes/tictactoe/tictactoe';
import { TicTacToeDoubleStart } from '../games/tictactoe-alikes/tictactoe-doublestart/tictactoe-doublestart';
import { TriangularGridRopes } from '../games/triangular-grid-ropes/triangular-grid-ropes';
import { TwoTimesTwo } from '../games/two-times-two/two-times-two';
import { RockPaperScissor } from '../games/rock-paper-scissor/rock-paper-scissor';
import { FiveFiveCard } from '../games/five-five-card/five-five-card';
import { NumberCovering8, NumberCovering10 } from '../games/number-covering/number-covering';
import { Take1OrHalve } from '../games/take-1-or-halve/take-1-or-halve';
import { TwelveSquares } from '../games/twelve-squares/twelve-squares';
import { Bacteria } from '../games/bacteria/bacteria';
import { SixDiscs, TenDiscs } from '../games/discs-turn-or-remove/discs-turn-or-remove';
import { PrimeExponentials } from '../games/prime-exponentials/prime-exponentials';
import { Policemanthief } from '../games/policeman-thief/policeman-thief';
import { SharkChase4 } from '../games/shark-chase/shark-4-by-4/shark-chase';
import { SharkChase5 } from '../games/shark-chase/shark-5-by-5/shark-chase';
import { PlusOneTwoThree } from '../games/plus-one-two-three/plus-one-two-three';
import { ChessDucksC, ChessDucksE } from '../games/chess-ducks/chess-ducks';
import { TakePowerOfTwo } from '../games/take-power-of-two/take-power-of-two';
import { ThievesMean } from '../games/thieves-mean/thieves-mean';
import { TriangleColoring } from '../games/triangle-coloring/triangle-coloring';
import { DominoesOnChessboard } from '../games/dominoes-on-chessboard/dominoes-on-chessboard';

export const App = () => {
  const routes = [
    { path: '/', element: <Overview /> },
    { path: '/game/AddReduceDouble', element: <AddReduceDouble /> },
    { path: '/game/AntiTicTacToe', element: <AntiTicTacToe /> },
    { path: '/game/BankRobbers', element: <BankRobbers /> },
    { path: '/game/ChessBishops', element: <ChessBishops /> },
    { path: '/game/ChessRook', element: <ChessRook /> },
    { path: '/game/Coin123', element: <Coin123 /> },
    { path: '/game/Coin357', element: <Coin357 /> },
    { path: '/game/CubeColoring', element: <CubeColoring /> },
    { path: '/game/FiveSquares', element: <FiveSquares /> },
    { path: '/game/FourPilesSpreadAhead', element: <FourPilesSpreadAhead /> },
    { path: '/game/HunyadiAndTheJanissaries', element: <HunyadiAndTheJanissaries /> },
    { path: '/game/PileSplitter', element: <PileSplitter /> },
    { path: '/game/PileSplitter3', element: <PileSplitter3 /> },
    { path: '/game/PileSplitter4', element: <PileSplitter4 /> },
    { path: '/game/SuperstitiousCounting', element: <SuperstitiousCounting /> },
    { path: '/game/TicTacToe', element: <TicTacToe /> },
    { path: '/game/TicTacToeDoubleStart', element: <TicTacToeDoubleStart /> },
    { path: '/game/TriangularGridRopes', element: <TriangularGridRopes /> },
    { path: '/game/TwoTimesTwo', element: <TwoTimesTwo /> },
    { path: '/game/rockPaperScissor', element: <RockPaperScissor /> },
    { path: '/game/FiveFiveCard', element: <FiveFiveCard /> },
    { path: '/game/NumberCovering8', element: <NumberCovering8 /> },
    { path: '/game/NumberCovering10', element: <NumberCovering10 /> },
    { path: '/game/Take1OrHalve', element: <Take1OrHalve /> },
    { path: '/game/TwelveSquares', element: <TwelveSquares />},
    { path: '/game/Bacteria', element: <Bacteria />},
    { path: '/game/SixDiscs', element: <SixDiscs />},
    { path: '/game/TenDiscs', element: <TenDiscs />},
    { path: '/game/PrimeExponentials', element: <PrimeExponentials />},
    { path: '/game/Policemanthief', element: <Policemanthief />},
    { path: '/game/SharkChase4', element: <SharkChase4 />},
    { path: '/game/SharkChase5', element: <SharkChase5 />},
    { path: '/game/PlusOneTwoThree', element: <PlusOneTwoThree />},
    { path: '/game/ChessDucksC', element: <ChessDucksC />},
    { path: '/game/ChessDucksE', element: <ChessDucksE />},
    { path: '/game/TakePowerOfTwo', element: <TakePowerOfTwo />},
    { path: '/game/TriangleColoring', element: <TriangleColoring />},
    { path: '/game/ThievesMean', element: <ThievesMean />},
    { path: '/game/DominoesOnChessboard', element: <DominoesOnChessboard />}
  ];
  const router = createHashRouter(
    routes.map(route => ({...route, errorElement: <ErrorPage /> }))
  );
  return <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>;
};
