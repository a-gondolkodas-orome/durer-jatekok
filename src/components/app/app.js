import React, { StrictMode } from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { Overview } from '../overview/overview';
import { ErrorPage } from '../error-page';
import { TwoTimesTwo } from '../games/two-times-two/two-times-two';
import { PileSplitter3 } from '../games/pile-splitting-games/pile-splitter-3/pile-splitter-3';

export const App = () => {
  const router = createHashRouter([
    { path: '/', element: <Overview />, errorElement: <ErrorPage /> },
    { path: '/game/TwoTimesTwo', element: <TwoTimesTwo /> },
    { path: '/game/PileSplitter3', element: <PileSplitter3 /> },
    { path: '/game/:gameId', element: <ErrorPage /> }
  ]);
  return <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>;
};
