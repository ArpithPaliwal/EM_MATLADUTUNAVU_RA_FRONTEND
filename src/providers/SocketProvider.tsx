import {  useEffect } from "react";
import type { ReactNode } from "react";
// import { useSelector } from "react-redux";
import { connectSocket, disconnectSocket } from "../Services/socket";

// type data ={
//   _id:string|null
// }
// type AuthState = {
//   userData: data | null;
//   isLoggedIn: boolean;
// };

// type AppState = {
//   auth: AuthState;
// };

// export default function SocketProvider({ children }: { children: ReactNode }) {
//   const { isLoggedIn, userData } = useSelector((state: AppState) => state.auth);

// useEffect(() => {
//   if (isLoggedIn && userData?._id) {
//     connectSocket();
//     console.log("socket connected");
//   } else {
//     disconnectSocket();
//     console.log("socket disconnected");
//   }
// }, [isLoggedIn, userData?._id]);


//   return <>{children}</>;
// }

export default function SocketProvider({ children }: { children: ReactNode }) {

  useEffect(() => {
    connectSocket();
    console.log("socket connected");

    return () => {
      disconnectSocket();
      console.log("socket disconnected");
    };
  }, []);

  return <>{children}</>;
}
