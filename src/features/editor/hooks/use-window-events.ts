import { useEvent } from "react-use";

export const useWindowEvents = () => {
  useEvent("beforeunload", (e) => {
    e.preventDefault();
    e.returnValue = "Are you sure you want to leave?";
  });
};
