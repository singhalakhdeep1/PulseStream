import { redirect } from "next/navigation";

// Root route → redirect to feed (owned by feed-mfe)
export default function HomePage() {
    redirect("/feed");
}
