import Stripe from "stripe";

let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
    if (!_stripe) {
        if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
        _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: "2025-02-24.acacia",
            typescript: true,
        });
    }
    return _stripe;
}

export const STRIPE_PLANS = {
    pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
    pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
} as const;
