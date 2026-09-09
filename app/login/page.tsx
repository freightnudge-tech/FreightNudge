import type { Metadata } from "next";

import AuthPanel from "@/components/auth-panel";

export const metadata: Metadata = {
  title: "Log in - FreightNudge",
};

export default function LoginPage() {
  return <AuthPanel mode="login" />;
}