import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export const getStripe = (): Stripe => {
  if (stripeInstance) {
    return stripeInstance;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set in the environment variables");
  }

  stripeInstance = new Stripe(stripeSecretKey, {
    apiVersion: "2026-06-24.dahlia",
    typescript: true,
  });

  return stripeInstance;
};
