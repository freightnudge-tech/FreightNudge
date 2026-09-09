import type { Metadata } from "next";

import AuthPanel from "@/components/auth-panel";

export const metadata: Metadata = {
  title: "Sign up - FreightNudge",
};

export default function SignupPage() {
  return <AuthPanel mode="signup" />;
}