import type { Metadata } from "next";

import { VenuesScreen } from "@/screens/Venues/VenuesScreen";

export const metadata: Metadata = {
  title: "Sân tập thể thao | FieldMate",
  description: "Tìm kiếm và đặt sân thể thao phù hợp với bạn.",
};

export default function VenuesPage() {
  return <VenuesScreen />;
}
