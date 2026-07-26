import type { Metadata } from "next";

import { RegisterScreen } from "@/screens/Register/RegisterScreen";

export const metadata: Metadata = {
  title: "Đăng ký | FieldMate",
  description: "Tạo tài khoản FieldMate.",
};

export default function RegisterPage() {
  return <RegisterScreen />;
}
