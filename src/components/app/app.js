import React, { StrictMode } from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { Overview } from '../overview/overview';
import { ErrorPage } from '../error-page';
import { TwoTimesTwo } from '../games/two-times-two/two-times-two';

export const App = () => {
  const router = createHashRouter([
    { path: '/', element: <Overview />, errorElement: <ErrorPage /> },
    { path: '/game/TwoTimesTwo', element: <TwoTimesTwo /> },
    { path: '/game/:gameId', element: <ErrorPage /> }
  ]);
  return <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>;
};
