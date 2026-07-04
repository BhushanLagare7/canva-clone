import { InferenceClient } from "@huggingface/inference";

const token = process.env.HUGGINGFACE_API_KEY;

if (!token) {
  throw new Error("HUGGINGFACE_API_KEY is not set in environment variables");
}

/**
 * InferenceClient instance from @huggingface/inference library for interacting with
 * Hugging Face Inference API. Initialized with the HUGGINGFACE_API_KEY from
 * environment variables.
 * @see {@link https://huggingface.co/docs/huggingface.js/inference-client}
 */
export const hf = new InferenceClient(token);
