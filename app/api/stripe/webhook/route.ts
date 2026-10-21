import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;
    try {
        event = getStripe().webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
    } catch {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = await createClient();

    switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated": {
            const sub = event.data.object as Stripe.Subscription;
            const customerId = sub.customer as string;
            const plan = sub.status === "active" ? "pro" : "free";
            await supabase.from("profiles").update({ plan, stripe_subscription_id: sub.id }).eq("stripe_customer_id", customerId);
            break;
        }
        case "customer.subscription.deleted": {
            const sub = event.data.object as Stripe.Subscription;
            await supabase.from("profiles").update({ plan: "free", stripe_subscription_id: null }).eq("stripe_customer_id", sub.customer as string);
            break;
        }
    }

    return NextResponse.json({ received: true });
}
