import React, { StrictMode } from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { Overview } from '../overview/overview';
import { ErrorPage } from '../error-page';
import { AddReduceDouble } from '../games/pile-splitting-games/add-reduce-double/add-reduce-double';
import { AntiTicTacToe } from '../games/tictactoe-alikes/anti-tictactoe/anti-tictactoe';
import { CubeColoring } from '../games/cube-coloring/cube-coloring';
import { FiveSquares } from '../games/five-squares/five-squares';
import { FourPilesSpreadAhead } from '../games/four-piles-spread-ahead/four-piles-spread-ahead';
import { HunyadiAndTheJanissaries } from '../games/hunyadi-and-the-janissaries/hunyadi-and-the-janissaries';
import { PileSplitter } from '../games/pile-splitting-games/pile-splitter/pile-splitter';
import { PileSplitter3 } from '../games/pile-splitting-games/pile-splitter-3/pile-splitter-3';
import { PileSplitter4 } from '../games/pile-splitting-games/pile-splitter-4/pile-splitter-4';
import { SuperstitiousCounting } from '../games/superstitious-counting/superstitious-counting';
import { TicTacToe } from '../games/tictactoe-alikes/tictactoe/tictactoe';
import { TicTacToeDoubleStart } from '../games/tictactoe-alikes/tictactoe-doublestart/tictactoe-doublestart';
import { TwoTimesTwo } from '../games/two-times-two/two-times-two';

export const App = () => {
  const router = createHashRouter([
    { path: '/', element: <Overview />, errorElement: <ErrorPage /> },
    { path: '/game/AddReduceDouble', element: <AddReduceDouble /> },
    { path: '/game/AntiTicTacToe', element: <AntiTicTacToe /> },
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
    { path: '/game/TwoTimesTwo', element: <TwoTimesTwo /> }
  ]);
  return <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>;
};
