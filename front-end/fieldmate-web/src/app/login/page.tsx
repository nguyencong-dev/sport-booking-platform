import type { Metadata } from "next";

import { LoginScreen } from "@/screens/Login/LoginScreen";

export const metadata: Metadata = {
  title: "Đăng nhập | FieldMate",
  description: "Đăng nhập tài khoản FieldMate.",
};

export default function LoginPage() {
  return <LoginScreen />;
}
