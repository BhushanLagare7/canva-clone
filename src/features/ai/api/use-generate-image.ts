import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/hono";

// Response shape returned by the "generate-image" endpoint on success (200)
type ResponseType = InferResponseType<
  (typeof client.api.ai)["generate-image"]["$post"],
  200
>;

// Request body shape expected by the "generate-image" endpoint
type RequestType = InferRequestType<
  (typeof client.api.ai)["generate-image"]["$post"]
>["json"];

/**
 * React Query mutation hook for generating an image via the AI API.
 * Sends a prompt to the backend and returns the generated image data.
 */
export const useGenerateImage = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      // Call the "generate-image" endpoint with the given payload
      const response = await client.api.ai["generate-image"].$post({ json });

      if (!response.ok) {
        let errorMessage = "Failed to generate image";
        try {
          const errData = await response.json();
          if (errData && typeof errData === "object" && "error" in errData) {
            errorMessage = errData.error as string;
          }
        } catch {
          // Ignore parsing errors and keep the default message
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    },
  });

  return mutation;
};
