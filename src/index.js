import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './routes/App';
import ErrorPage from './error-page';
import Table, { loader as tableLoader } from './routes/Table';
import Setup from './routes/Setup';
import Create, { action as createAction } from './routes/Create';
import Join, { action as joinAction } from './routes/Join';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <Setup />,
      },
      {
        path: 'create',
        element: <Create />,
        action: createAction,
      },
      {
        path: 'join',
        element: <Join />,
        action: joinAction,
      },
      {
        path: 't/:id',
        element: <Table />,
        loader: tableLoader,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
