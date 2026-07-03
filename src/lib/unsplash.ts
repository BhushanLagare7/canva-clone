import { createApi } from "unsplash-js";

const unsplashApiKey = process.env.UNSPLASH_ACCESS_KEY;

if (!unsplashApiKey) {
  throw new Error(
    "UNSPLASH_ACCESS_KEY is not set in the environment",
  );
}

export const unsplash = createApi({
  accessKey: unsplashApiKey,
  fetch: fetch,
});
