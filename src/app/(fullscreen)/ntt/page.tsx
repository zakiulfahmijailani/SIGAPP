// src/app/(fullscreen)/ntt/page.tsx
// Redirects to main dashboard
import { redirect } from "next/navigation";

export default function NTTRedirect() {
  redirect("/");
}
