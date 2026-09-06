import { createBrowserRouter, RouterProvider } from "react-router-dom";

import RootLayout from "./components/layout/RootLayout";
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
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
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
        path: "profile/:userId",
        element: <ProfilePage />,
      },
      {
        path: "admin",
        element: <AdminPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
