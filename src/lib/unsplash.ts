import { createApi } from "unsplash-js";

const unsplashApiKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

if (!unsplashApiKey) {
  throw new Error(
    "NEXT_PUBLIC_UNSPLASH_ACCESS_KEY is not set in the environment",
  );
}

export const unsplash = createApi({
  accessKey: unsplashApiKey,
  fetch: fetch,
});
