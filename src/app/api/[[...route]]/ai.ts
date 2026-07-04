import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { hf } from "@/lib/huggingface";

// Hono app exposing AI-related endpoints (background removal & image generation)
const app = new Hono()
  /**
   * POST /remove-bg
   * Removes the background from a given image using a Hugging Face
   * image segmentation model, returning the result as a base64 data URL.
   */
  .post(
    "/remove-bg",
    // Add auth verification here
    zValidator(
      "json",
      z.object({
        image: z.string(), // URL of the image to process
      }),
    ),
    async (c) => {
      const { image } = c.req.valid("json");

      try {
        // Fetch the source image as a Blob
        const imageResponse = await fetch(image);
        const imageBlob = await imageResponse.blob();

        // Run background removal via HF Inference API (free tier)
        const result = await hf.imageSegmentation({
          model: "briaai/RMBG-2.0",
          inputs: imageBlob,
        });

        // imageSegmentation returns an array of segments with base64 masks.
        // For background removal, the first segment's mask is the result.
        const segment = result[0];

        if (!segment?.mask) {
          throw new Error(
            "Unexpected response format from background removal model",
          );
        }

        // Ensure the mask is returned as a properly formatted data URL
        const dataUrl = segment.mask.startsWith("data:")
          ? segment.mask
          : `data:image/png;base64,${segment.mask}`;

        return c.json({ data: dataUrl });
      } catch (error) {
        console.error("AI Error:", error);
        return c.json({ error: "Failed to remove background" }, 500);
      }
    },
  )
  /**
   * POST /generate-image
   * Generates an image from a text prompt using a Hugging Face
   * text-to-image model, returning the result as a base64 data URL.
   */
  .post(
    "/generate-image",
    // Add auth verification here
    zValidator(
      "json",
      z.object({
        prompt: z.string(), // Text prompt describing the desired image
      }),
    ),
    async (c) => {
      const { prompt } = c.req.valid("json");

      try {
        // Generate image via HF Inference API (free tier)
        // outputType: "dataUrl" returns a base64 data URL string directly
        const dataUrl = await hf.textToImage(
          {
            model: "black-forest-labs/FLUX.1-schnell",
            inputs: prompt,
          },
          { outputType: "dataUrl" },
        );

        return c.json({ data: dataUrl });
      } catch (error) {
        console.error("AI Error:", error);
        return c.json({ error: "Failed to generate image" }, 500);
      }
    },
  );

export default app;
