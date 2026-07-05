import { useEvent } from "react-use";

export const useWindowEvents = (hasUnsavedChanges: () => boolean) => {
  useEvent("beforeunload", (e) => {
    if (hasUnsavedChanges()) {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave?";
    }
  });
};
