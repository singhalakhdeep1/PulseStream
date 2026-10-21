import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getResend, FROM_EMAIL } from "@/lib/email/resend";
import { welcomeEmail } from "@/lib/email/templates";
import { APP_URL } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { username } = await req.json();
  if (!username) return NextResponse.json({ error: "username required" }, { status: 400 });

  const { subject, html, text } = welcomeEmail({ username, loginUrl: `${APP_URL}/login` });

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: user.email!,
    subject,
    html,
    text,
  });

  return NextResponse.json({ sent: true });
}
