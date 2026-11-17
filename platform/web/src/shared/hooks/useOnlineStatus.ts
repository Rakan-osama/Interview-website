import { useEffect, useState } from "react";
import { flushMutationQueue } from "../offline/mutationQueue";

export function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const connect = () => {
      setOnline(true);
      void flushMutationQueue();
    };
    const disconnect = () => setOnline(false);
    window.addEventListener("online", connect);
    window.addEventListener("offline", disconnect);
    if (navigator.onLine) void flushMutationQueue();
    return () => {
      window.removeEventListener("online", connect);
      window.removeEventListener("offline", disconnect);
    };
  }, []);

  return online;
}
