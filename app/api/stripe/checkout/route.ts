import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, STRIPE_PLANS } from "@/lib/stripe/client";
import { APP_URL } from "@/lib/constants";

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { plan } = await req.json();
    const priceId = STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS];
    if (!priceId) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

    const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_customer_id, email")
        .eq("id", user.id)
        .single();

    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: user.email,
            metadata: { supabase_user_id: user.id },
        });
        customerId = customer.id;
        await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
    }

    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${APP_URL}/settings?upgrade=success`,
        cancel_url: `${APP_URL}/settings?upgrade=cancel`,
        metadata: { supabase_user_id: user.id },
    });

    return NextResponse.json({ url: session.url });
}
