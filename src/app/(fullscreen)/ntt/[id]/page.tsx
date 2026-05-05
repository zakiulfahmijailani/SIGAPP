// src/app/(fullscreen)/ntt/[id]/page.tsx
// Redirects to main dashboard
import { redirect } from "next/navigation";

export default function NTTDetailRedirect() {
  redirect("/");
}
