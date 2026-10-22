import { redirect } from "next/navigation"

/** Typo alias: `/identiy` → `/identity` */
export default function IdentiyRedirectPage() {
  redirect("/identity")
}
