import { createBrowserRouter } from "react-router-dom";
import Root from "./routes/root/Root";
import Home from "./routes/home/Home";
import Discover from "./routes/discover/Discover";
import UploadMusic from "./routes/upload-music/UploadMusic";
import MusicPlayer from "./routes/music-player/MusicPlayer";
import Profile from "./routes/profile/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "discover",
        Component: Discover,
      },
      {
        path: "discover/:id",
        Component: MusicPlayer,
      },
      {
        path: "upload",
        Component: UploadMusic,
      },
      {
        path: "upload/:id",
        Component: UploadMusic,
      },
      {
        path: "profile/:address",
        Component: Profile,
      },
    ],
  },
]);
