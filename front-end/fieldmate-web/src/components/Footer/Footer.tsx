import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export type FooterVariant = "public" | "compact";

const footerLinks = {
  "Khám phá": [
    { label: "Trang chủ", href: "/" },
    { label: "Tìm sân", href: "/venues" },
    { label: "Trợ lý AI", href: "/assistant" },
  ],
  "Tài khoản": [
    { label: "Đăng nhập", href: "/login" },
    { label: "Đăng ký", href: "/register" },
    { label: "Lịch đặt của tôi", href: "/bookings" },
  ],
};

type FooterProps = {
  variant?: FooterVariant;
};

export function Footer({ variant = "public" }: FooterProps) {
  if (variant === "compact") {
    return (
      <footer className="mt-auto border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-5 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-base font-black text-[#073b77]"
            >
              FieldMate
            </Link>
            <span className="hidden h-4 w-px bg-slate-200 sm:block" />
            <p className="text-xs font-medium text-slate-500">
              © {new Date().getFullYear()} FieldMate
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-500 transition-colors hover:text-[#ff174f]"
            >
              Trang chủ
            </Link>
            <Link
              href="/venues"
              className="text-xs font-semibold text-slate-500 transition-colors hover:text-[#ff174f]"
            >
              Sân tập
            </Link>
            <Link
              href="/bookings"
              className="text-xs font-semibold text-slate-500 transition-colors hover:text-[#ff174f]"
            >
              Lịch đặt
            </Link>
            <Link
              href="mailto:nguyenvancong72033@gmail.com"
              className="text-xs font-semibold text-slate-500 transition-colors hover:text-[#ff174f]"
            >
              Liên hệ
            </Link>
          </nav>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-auto border-t border-white/10 bg-[#073b77] text-blue-100">
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_2fr] lg:px-8">
        <div className="max-w-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5"
            aria-label="FieldMate - Trang chủ"
          >
            <Image
              src="https://res.cloudinary.com/dxek6c0tg/image/upload/v1784977099/4d7ca5d8-bdb2-4fbf-b282-ad3c7194163b_sba6et.jpg"
              alt="FieldMate"
              width={230}
              height={64}
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

          <div>
            <h2 className="text-sm font-extrabold text-white">
              Liên hệ
            </h2>

            <address className="mt-4 space-y-3 not-italic">
              <a
                href="mailto:nguyenvancong72033@gmail.com"
                className="flex items-start gap-2.5 text-sm text-blue-100/75 transition-colors hover:text-[#ff5c82]"
              >
                <Mail className="mt-0.5 size-4 shrink-0" />
                <span className="break-all">
                  nguyenvancong72033@gmail.com
                </span>
              </a>

              <a
                href="tel:0365777023"
                className="flex items-start gap-2.5 text-sm text-blue-100/75 transition-colors hover:text-[#ff5c82]"
              >
                <Phone className="mt-0.5 size-4 shrink-0" />
                <span>0365 777 023</span>
              </a>

              <p className="flex items-start gap-2.5 text-sm leading-6 text-blue-100/75">
                <MapPin className="mt-1 size-4 shrink-0" />
                <span>
                  2/125A, Thủ Khoa Huân, Thuận Giao, Thuận An,
                  Hồ Chí Minh
                </span>
              </p>

              <a
                href="https://www.facebook.com/nguyen.cong.643873/"
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-2.5 text-sm text-blue-100/75 transition-colors hover:text-[#ff5c82]"
              >
                <FacebookIcon className="mt-0.5 size-4 shrink-0" />
                <span>Facebook</span>
              </a>
            </address>
          </div>
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

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M13.5 22v-8.7h2.9l.5-3.4h-3.4V7.7c0-1 .3-1.7 1.7-1.7H17V3a24 24 0 0 0-2.7-.2c-2.7 0-4.6 1.7-4.6 4.7v2.4H7v3.4h2.7V22h3.8Z" />
    </svg>
  );
}
