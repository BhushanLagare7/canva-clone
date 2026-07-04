import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/hono";

// Response shape returned by the "remove-bg" endpoint on success (200)
type ResponseType = InferResponseType<
  (typeof client.api.ai)["remove-bg"]["$post"],
  200
>;

// Request body shape expected by the "remove-bg" endpoint
type RequestType = InferRequestType<
  (typeof client.api.ai)["remove-bg"]["$post"]
>["json"];

/**
 * React Query mutation hook for removing background from an image via the AI API.
 * Sends an image to the backend and returns the result with the background removed.
 */
export const useRemoveBg = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      // Call the "remove-bg" endpoint with the given payload
      const response = await client.api.ai["remove-bg"].$post({ json });

      if (!response.ok) {
        let errorMessage = "Failed to remove background";
        try {
          const errData = await response.json();
          if (errData && typeof errData === "object" && "error" in errData) {
            errorMessage = `${errData.error} (Status: ${response.status})`;
          } else {
            errorMessage = `Failed to remove background (Status: ${response.status})`;
          }
        } catch {
          errorMessage = `Failed to remove background (Status: ${response.status})`;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    },
  });

  return mutation;
};
