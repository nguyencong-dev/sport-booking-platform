import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  "Khám phá": [
    { label: "Tìm sân", href: "/venues" },
    { label: "Môn thể thao", href: "/sports" },
    { label: "Cách đặt sân", href: "/how-it-works" },
  ],
  "Tài khoản": [
    { label: "Đăng nhập", href: "/login" },
    { label: "Đăng ký", href: "/register" },
    { label: "Lịch đặt của tôi", href: "/bookings" },
  ],
  "Hỗ trợ": [
    { label: "Trung tâm trợ giúp", href: "/support" },
    { label: "Điều khoản sử dụng", href: "/terms" },
    { label: "Chính sách bảo mật", href: "/privacy" },
  ],
};

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#073b77] text-blue-100">
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_2fr] lg:px-8">
        <div className="max-w-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5"
            aria-label="FieldMate - Trang chủ"
          >
            <img
              src="https://res.cloudinary.com/dxek6c0tg/image/upload/v1784977099/4d7ca5d8-bdb2-4fbf-b282-ad3c7194163b_sba6et.jpg"
              alt="FieldMate"
              loading="lazy"
              className="h-16 w-auto max-w-[230px] rounded-xl bg-white object-contain px-2"
            />
          </Link>

          <p className="mt-4 text-sm leading-6 text-blue-100/80">
            Nền tảng giúp bạn tìm kiếm và đặt sân thể thao nhanh chóng, minh
            bạch và thuận tiện.
          </p>

        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h2 className="text-sm font-extrabold text-white">
                {group}
              </h2>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-blue-100/75 transition-colors hover:text-[#ff5c82]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Separator className="bg-white/10" />

      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-2 px-4 py-5 text-xs text-blue-200/65 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} FieldMate. Mọi quyền được bảo lưu.</p>
        <p>Đặt sân nhanh, sẵn sàng vào trận.</p>
      </div>
    </footer>
  );
}
