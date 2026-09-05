# FieldMate - Nền tảng đặt sân thể thao

FieldMate là nền tảng hỗ trợ người dùng tìm kiếm, đặt sân và thanh toán trực tuyến; đồng thời cung cấp công cụ quản lý sân, lịch đặt và doanh thu cho chủ sân.

![Next.js](https://img.shields.io/badge/Next.js-16.2.11-000000?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1.0-6DB33F?style=flat-square&logo=springboot)
![Java](https://img.shields.io/badge/Java-25-ED8B00?style=flat-square&logo=openjdk)
![FastAPI](https://img.shields.io/badge/FastAPI-0.139.0-009688?style=flat-square&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.14-3776AB?style=flat-square&logo=python)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?style=flat-square&logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## Tổng quan

FieldMate kết nối khách hàng có nhu cầu đặt sân với các chủ sân thể thao. Hệ thống hỗ trợ quản lý toàn bộ quy trình từ tìm kiếm sân, xem lịch trống, đặt sân, thanh toán đến quản lý hoạt động kinh doanh.

Hệ thống gồm ba thành phần chính:

- Frontend xây dựng bằng Next.js và React.
- Backend nghiệp vụ xây dựng bằng Spring Boot.
- AI Service xây dựng bằng FastAPI, LangChain và OpenAI.

## Tính năng chính

### Khách hàng

- Đăng ký, đăng nhập và quản lý thông tin cá nhân.
- Tìm kiếm sân theo tên, môn thể thao, trạng thái và khoảng cách.
- Xem vị trí sân trên bản đồ.
- Xem thông tin cụm sân, sân con, tiện ích và quy định.
- Kiểm tra lịch trống và đặt sân theo ngày, giờ.
- Theo dõi lịch sử và trạng thái đặt sân.
- Thanh toán trực tuyến bằng MoMo hoặc VNPay.
- Trò chuyện với trợ lý AI để tìm sân, kiểm tra lịch và hỏi kiến thức thể thao.
- Tìm sân gần vị trí hiện tại.

### Chủ sân

- Thêm, chỉnh sửa và quản lý cụm sân.
- Quản lý sân con, hình ảnh, tiện ích và quy định.
- Quản lý lịch đặt của khách hàng.
- Xác nhận hoàn thành lượt đặt.
- Ghi nhận thanh toán tiền mặt.
- Đăng ký tài khoản nhận tiền MoMo hoặc VNPay.
- Theo dõi thống kê doanh thu.
- Theo dõi mức độ sử dụng sân theo khung giờ.
- Xem xếp hạng các sân theo doanh thu hoặc số giờ được đặt.

### Quản trị viên

- Quản lý tài khoản người dùng.
- Phân quyền và khóa hoặc mở khóa tài khoản.
- Duyệt cụm sân do chủ sân đăng ký.
- Quản lý môn thể thao.
- Quản lý banner trang chủ.
- Duyệt tài khoản nhận tiền của chủ sân.
- Quản lý tài liệu kiến thức dành cho trợ lý AI.
- Theo dõi trạng thái xử lý và lập chỉ mục tài liệu.

## Kiến trúc hệ thống

```text
┌─────────────────────────────────────────────────────────┐
│              Next.js Frontend - Port 3000               │
│        Giao diện khách hàng, chủ sân và quản trị         │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/Axios
            ┌──────────┴───────────┐
            │                      │
┌───────────▼────────────┐  ┌──────▼──────────────────────┐
│ Spring Boot Backend    │  │ FastAPI AI Service         │
│ Port 8080              │  │ Port 8000                  │
│                        │  │                             │
│ • JWT Authentication   │  │ • Trợ lý hội thoại         │
│ • Quản lý sân          │  │ • Tìm kiếm sân bằng AI     │
│ • Quản lý đặt sân      │  │ • RAG tài liệu PDF         │
│ • Thanh toán           │  │ • Lịch sử hội thoại        │
│ • Thống kê chủ sân     │  │ • Trích dẫn nguồn          │
└───────────┬────────────┘  └──────┬──────────────────────┘
            │                      │
            │              Gọi API FieldMate Backend
            │                      │
            └──────────┬───────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│          PostgreSQL 18 + pgvector - Port 5432           │
│                                                         │
│ • Dữ liệu nghiệp vụ                                    │
│ • Hội thoại và tin nhắn AI                              │
│ • Tài liệu, đoạn văn và vector embedding                │
└─────────────────────────────────────────────────────────┘
```

Các dịch vụ bên ngoài:

- Cloudinary dùng để lưu trữ hình ảnh.
- OpenAI dùng cho mô hình hội thoại và embedding.
- MoMo và VNPay dùng để xử lý thanh toán trực tuyến.
- Province Open API dùng để lấy dữ liệu tỉnh thành.

## Công nghệ sử dụng

### Frontend

| Thành phần | Công nghệ |
|---|---|
| Framework | Next.js 16.2.11 |
| Thư viện giao diện | React 19.2.4 |
| Ngôn ngữ | TypeScript 5 |
| CSS | Tailwind CSS 4 |
| Thành phần UI | Base UI, shadcn |
| Gọi API | Axios |
| Biểu đồ | Recharts |
| Bản đồ | Leaflet, React Leaflet |
| Biểu tượng | Lucide React |

### Backend

| Thành phần | Công nghệ |
|---|---|
| Framework | Spring Boot 4.1.0 |
| Ngôn ngữ | Java 25 |
| Cơ sở dữ liệu | PostgreSQL 18 |
| ORM | Spring Data JPA |
| Xác thực | Spring Security, JWT |
| Migration | Flyway |
| API Documentation | Springdoc OpenAPI |
| Lưu trữ ảnh | Cloudinary |
| Thanh toán | MoMo, VNPay |
| Build Tool | Maven |

### AI Service

| Thành phần | Công nghệ |
|---|---|
| Framework | FastAPI 0.139.0 |
| Ngôn ngữ | Python 3.14 |
| AI Framework | LangChain |
| Mô hình | OpenAI |
| ORM | SQLAlchemy |
| Migration | Alembic |
| Vector Database | PostgreSQL, pgvector |
| Xử lý PDF | pypdf |
| HTTP Client | HTTPX |

## Cấu trúc thư mục

```text
sport-booking-platform/
├── fieldmate/                         # Spring Boot Backend
│   ├── src/main/java/com/nguyencong/fieldmate/
│   │   ├── config/                    # Security, CORS, OpenAPI
│   │   ├── controller/                # REST API Controller
│   │   ├── dto/                       # Request và Response DTO
│   │   ├── entity/                    # JPA Entity và Enum
│   │   ├── exception/                 # Xử lý ngoại lệ
│   │   ├── mapper/                    # Chuyển đổi Entity và DTO
│   │   ├── payment/                   # MoMo và VNPay
│   │   ├── repository/                # Repository và Specification
│   │   ├── scheduler/                 # Xử lý booking hết hạn
│   │   ├── security/                  # JWT Authentication
│   │   ├── service/                   # Business logic
│   │   └── utils/                     # Tiện ích dùng chung
│   ├── src/main/resources/
│   │   ├── db/migration/              # Flyway migration
│   │   └── application.properties
│   ├── Dockerfile
│   └── pom.xml
│
├── front-end/
│   └── fieldmate-web/                 # Next.js Frontend
│       ├── src/
│       │   ├── app/                   # App Router và các trang
│       │   ├── components/            # Component dùng chung
│       │   ├── configs/               # API client
│       │   ├── contexts/              # Auth và Geolocation Context
│       │   ├── hooks/                 # Custom React hooks
│       │   ├── screens/               # Giao diện chính
│       │   ├── services/              # Các service gọi API
│       │   └── types/                 # TypeScript type
│       ├── public/                    # Tài nguyên tĩnh
│       └── package.json
│
├── ai-service/                        # FastAPI AI Service
│   ├── app/
│   │   ├── agents/                    # AI Agent
│   │   ├── api/                       # Chat, conversation, document API
│   │   ├── clients/                   # FieldMate API client
│   │   ├── core/                      # Config, database, security
│   │   ├── models/                    # SQLAlchemy model
│   │   ├── prompts/                   # System prompt và RAG prompt
│   │   ├── rag/                       # Đọc và chia nhỏ tài liệu PDF
│   │   ├── repositories/              # Truy cập dữ liệu
│   │   ├── services/                  # AI và RAG service
│   │   ├── tools/                     # Công cụ cho AI Agent
│   │   └── main.py
│   ├── migrations/                    # Alembic migration
│   ├── data/documents/                # Tài liệu được tải lên
│   ├── Dockerfile
│   └── requirements.txt
│
├── docker/
│   └── postgres/
│       └── init.sql                   # Khởi tạo pgvector và schema AI
│
├── docker-compose.yml
├── LICENSE
└── README.md
```

## Yêu cầu cài đặt

- Git.
- Docker Desktop và Docker Compose.
- Node.js 20 trở lên.
- npm.
- Kết nối Internet để sử dụng OpenAI, Cloudinary, MoMo và VNPay.

Nếu chạy Backend trực tiếp ngoài Docker:

- Java 25.
- Maven 3.9 trở lên.

Nếu chạy AI Service trực tiếp ngoài Docker:

- Python 3.14.
- PostgreSQL có extension pgvector.

## Cài đặt và chạy project

### 1. Clone repository

```bash
git clone https://github.com/nguyencong-dev/sport-booking-platform.git
cd sport-booking-platform
```

### 2. Tạo file môi trường

Sao chép các file cấu hình mẫu:

```bash
cp fieldmate/.env.example fieldmate/.env
cp ai-service/.env.example ai-service/.env
cp front-end/fieldmate-web/.env.example front-end/fieldmate-web/.env
```

Trên Windows Command Prompt:

```bat
copy fieldmate\.env.example fieldmate\.env
copy ai-service\.env.example ai-service\.env
copy front-end\fieldmate-web\.env.example front-end\fieldmate-web\.env
```

Tạo file `.env` tại thư mục gốc:

```env
DB_NAME=fieldmatedb
DB_USER=postgres
DB_PASS=your_database_password
```

Sau đó cập nhật thông tin cần thiết trong:

- `fieldmate/.env`
- `ai-service/.env`
- `front-end/fieldmate-web/.env`

Không đưa API key, mật khẩu hoặc khóa bảo mật thật lên GitHub.

### 3. Cấu hình Backend

Các nhóm biến môi trường chính trong `fieldmate/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fieldmatedb
DB_USER=postgres
DB_PASS=your_database_password

JWT_SECRET=replace_with_a_secret_at_least_32_characters_long
JWT_EXPIRATION=86400000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CREDENTIAL_ENCRYPTION_KEY=replace_with_base64_encoded_32_byte_key

CORS_ALLOWED_ORIGINS=http://localhost:3000
URL_RETURN_PAYMENT=http://localhost:3000/bookings
```

Thông tin MoMo và VNPay được khai báo theo hướng dẫn trong `fieldmate/.env.example`.

### 4. Cấu hình AI Service

Các biến quan trọng trong `ai-service/.env`:

```env
APP_NAME=FieldMate AI Service
APP_ENV=local
APP_HOST=127.0.0.1
APP_PORT=8000

DATABASE_URL=postgresql+psycopg://postgres:your_database_password@localhost:5432/fieldmatedb
DATABASE_SCHEMA=ai

FIELDMATE_API_BASE_URL=http://localhost:8080

OPENAI_API_KEY=your_openai_api_key
OPENAI_CHAT_MODEL=gpt-4o
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_EMBEDDING_DIMENSIONS=1536

CORS_ALLOWED_ORIGINS=["http://localhost:3000"]
```

### 5. Chạy Backend, AI Service và PostgreSQL bằng Docker

Đảm bảo Docker Desktop đang chạy, sau đó thực hiện:

```bash
docker compose up -d --build
```

Kiểm tra trạng thái container:

```bash
docker compose ps
```

Xem log:

```bash
docker compose logs -f
```

Dừng hệ thống:

```bash
docker compose down
```

### 6. Chạy Frontend

Frontend hiện được chạy riêng ngoài Docker:

```bash
cd front-end/fieldmate-web
npm install
npm run dev
```

Truy cập ứng dụng tại:

```text
http://localhost:3000
```

## Địa chỉ dịch vụ

| Dịch vụ | Địa chỉ |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/api |
| Backend Swagger UI | http://localhost:8080/swagger-ui.html |
| AI Service | http://localhost:8000 |
| AI Swagger UI | http://localhost:8000/docs |
| AI ReDoc | http://localhost:8000/redoc |

## API chính

### Xác thực

| Phương thức | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập |

### Cụm sân và sân con

| Phương thức | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/venues` | Tìm kiếm danh sách cụm sân |
| GET | `/api/venues/{id}` | Xem chi tiết cụm sân |
| GET | `/api/venues/{id}/courts` | Lấy danh sách sân con |
| GET | `/api/venues/{id}/booking-schedule` | Xem lịch đã đặt |
| POST | `/api/secure/venues` | Thêm cụm sân |
| PUT | `/api/secure/venues/{id}` | Cập nhật cụm sân |
| POST | `/api/secure/venues/{id}/courts` | Thêm sân con |

### Đặt sân và thanh toán

| Phương thức | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/secure/bookings` | Tạo lượt đặt |
| GET | `/api/secure/bookings/me` | Xem lịch đặt của khách hàng |
| GET | `/api/secure/venues/{id}/bookings` | Xem lịch đặt của cụm sân |
| PATCH | `/api/secure/bookings/{id}/complete` | Hoàn thành lượt đặt |
| POST | `/api/secure/bookings/{id}/payments` | Tạo thanh toán trực tuyến |
| POST | `/api/secure/bookings/{id}/cash-payments` | Ghi nhận thanh toán tiền mặt |

### Thống kê chủ sân

| Phương thức | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/secure/owner/statistics/revenue` | Thống kê doanh thu |
| GET | `/api/secure/owner/statistics/peak-hours` | Thống kê theo khung giờ |
| GET | `/api/secure/owner/statistics/courts/ranking` | Xếp hạng sân |

### AI Service

| Phương thức | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/chat` | Gửi tin nhắn cho trợ lý AI |
| GET | `/api/conversations` | Lấy danh sách cuộc trò chuyện |
| GET | `/api/conversations/{id}/messages` | Lấy lịch sử tin nhắn |
| DELETE | `/api/conversations/{id}` | Xóa cuộc trò chuyện |
| POST | `/api/admin/documents/upload` | Tải tài liệu PDF |
| GET | `/api/admin/documents` | Lấy danh sách tài liệu |
| GET | `/api/admin/documents/{id}` | Xem chi tiết tài liệu |
| POST | `/api/admin/documents/{id}/reindex` | Lập chỉ mục lại tài liệu |

Danh sách API Backend đầy đủ được cung cấp tại Swagger UI:

```text
http://localhost:8080/swagger-ui.html
```

## Trợ lý AI và RAG

Trợ lý AI của FieldMate có thể:

- Tìm cụm sân theo tên, địa chỉ hoặc môn thể thao.
- Tìm sân gần vị trí hiện tại của người dùng.
- Xem thông tin cụm sân và sân con.
- Kiểm tra lịch đặt theo ngày.
- Trả lời câu hỏi liên quan đến kiến thức thể thao.
- Tìm kiếm nội dung trong tài liệu PDF.
- Hiển thị nguồn tài liệu được sử dụng trong câu trả lời.
- Lưu và quản lý lịch sử hội thoại.

Tài liệu PDF được chia thành các đoạn nhỏ, chuyển thành vector embedding và lưu trong PostgreSQL bằng pgvector.

## Phân quyền

Hệ thống có ba vai trò:

| Vai trò | Quyền chính |
|---|---|
| `CUSTOMER` | Tìm sân, đặt sân, thanh toán và sử dụng trợ lý AI |
| `COURT_OWNER` | Quản lý sân, lịch đặt, thanh toán và thống kê |
| `ADMIN` | Quản lý người dùng, nội dung và phê duyệt dữ liệu |

Các API bảo mật sử dụng JWT và có tiền tố:

```text
/api/secure
```

Header xác thực:

```http
Authorization: Bearer <access_token>
```

## Kiểm tra project

### Frontend

```bash
cd front-end/fieldmate-web
npm run lint
npm run build
```

### Backend

Trên Windows:

```bat
cd fieldmate
mvnw.cmd test
```

Trên Linux hoặc macOS:

```bash
cd fieldmate
./mvnw test
```

## Giấy phép

Project được phát hành theo giấy phép MIT. Xem chi tiết tại [LICENSE](LICENSE).

## Tác giả

[nguyencong-dev](https://github.com/nguyencong-dev)

## Hỗ trợ

Nếu phát hiện lỗi hoặc muốn đề xuất tính năng, vui lòng tạo issue tại:

[GitHub Issues](https://github.com/nguyencong-dev/sport-booking-platform/issues)
