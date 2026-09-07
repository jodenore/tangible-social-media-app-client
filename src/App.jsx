import { createBrowserRouter, RouterProvider } from "react-router-dom";

import RootLayout from "./components/layout/RootLayout";
import AdminRoute from "./components/AdminRoute";
import CurrentProfileRoute from "./components/CurrentProfileRoute";
import GuestRoute from "./components/GuestRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPage from "./pages/AdminPage";
import FeedPage from "./pages/FeedPage";
import GroupDetailsPage from "./pages/GroupDetailsPage";
import GroupsPage from "./pages/GroupsPage";
import LoginPage from "./pages/LoginPage";
import PlayerDetailsPage from "./pages/PlayerDetailsPage";
import PlayersPage from "./pages/PlayersPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <FeedPage />,
      },
      {
        element: <GuestRoute />,
        children: [
          {
            path: "login",
            element: <LoginPage />,
          },
          {
            path: "register",
            element: <RegisterPage />,
          },
        ],
      },
      {
        path: "players",
        element: <PlayersPage />,
      },
      {
        path: "players/:playerId",
        element: <PlayerDetailsPage />,
      },
      {
        path: "groups",
        element: <GroupsPage />,
      },
      {
        path: "groups/:groupId",
        element: <GroupDetailsPage />,
      },

      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "profile/current",
            element: <CurrentProfileRoute />,
          },
          {
            path: "profile/:userId",
            element: <ProfilePage />,
          },
        ],
      },
      {
        element: <AdminRoute />,
        children: [
          {
            path: "admin",
            element: <AdminPage />,
          },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
