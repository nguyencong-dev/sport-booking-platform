-- Public venue and image data was collected from the source URLs documented
-- beside each group below on 2026-07-25. External image URLs remain owned and
-- operated by their publishers; for production, obtain permission and copy
-- approved assets to your own Cloudinary account.
-- Latitude and longitude are plausible seed coordinates near the published
-- addresses, not authoritative geocoding results.
-- The logo field uses a separate publicly sourced venue/branding image and
-- never reuses one of that venue's three gallery URLs.
--
-- Test identities and transactions are intentionally fictional. Scraping real
-- customer identities or booking history would expose personal information.
--
-- Every test account uses password: 123456
-- BCrypt source/check: https://stackoverflow.com/questions/25844419

INSERT INTO users (
    id, email, password, phone_number, first_name, last_name, role, enabled,
    created_at, updated_at
) VALUES
    (1, 'admin@fieldmate.local', '$2a$10$KbQiHKTa1WIsQFTQWQKCiujoTJJB7MCMSaSgG/imVkKRicMPwgN5i', '0900000001', 'FieldMate', 'Admin', 'ADMIN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'owner@fieldmate.local', '$2a$10$KbQiHKTa1WIsQFTQWQKCiujoTJJB7MCMSaSgG/imVkKRicMPwgN5i', '0900000002', 'FieldMate', 'Court Owner', 'COURT_OWNER', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users (
    id, email, password, phone_number, first_name, last_name, role, enabled,
    created_at, updated_at
)
SELECT
    series + 2,
    'customer' || LPAD(series::TEXT, 2, '0') || '@fieldmate.local',
    '$2a$10$KbQiHKTa1WIsQFTQWQKCiujoTJJB7MCMSaSgG/imVkKRicMPwgN5i',
    '091' || LPAD(series::TEXT, 7, '0'),
    'Customer',
    LPAD(series::TEXT, 2, '0'),
    'CUSTOMER',
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM GENERATE_SERIES(1, 24) AS series;

INSERT INTO sport_types (id, name) VALUES
    (1, 'Pickleball'),
    (2, 'Bóng đá'),
    (3, 'Cầu lông'),
    (4, 'Tennis'),
    (5, 'Bóng rổ');

-- Sources:
-- https://shopvnb.com/san-pickleball-vna.html
-- https://shopvnb.com/san-pickleball-alp.html
-- https://shopvnb.com/san-pickleball-van-thanh.html
-- https://shopvnb.com/san-pickleball-van-phuc-city.html
-- https://shopvnb.com/san-pickleball-miss-u.html
-- https://shopvnb.com/san-pickleball-110-dao-su-tich.html
INSERT INTO venues (
    id, name, address, latitude, longitude, banner, logo, status, owner_id,
    created_at, updated_at
) VALUES
    (1, 'Sân Pickleball VNA', '39A Hồng Hà, Phường Tân Sơn Hòa, Thành phố Hồ Chí Minh', 10.8132000, 106.6668000, 'https://shopvnb.com/uploads/images/san-pickleball-vna-2.jpg', 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-vna-5-1731721607.webp', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'Sân Pickleball ALP', '235/1G An Phú Đông 09, Phường An Phú Đông, Thành phố Hồ Chí Minh', 10.8674000, 106.6818000, 'https://shopvnb.com/uploads/tin_tuc/san-pickleball-alp-2_1760302356.jpg', 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-alp-4-1760302356.webp', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 'Sân Pickleball Văn Thánh', '48/10 Điện Biên Phủ, Phường Thạnh Mỹ Tây, Thành phố Hồ Chí Minh', 10.7984000, 106.7145000, 'https://shopvnb.com/uploads/tin_tuc/san-pickleball-van-thanh-2_1779153439.webp', 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-van-thanh-4-1779153442.webp', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (4, 'Sân Pickleball Vạn Phúc City', '140 Đường 16, Khu đô thị Vạn Phúc, Phường Hiệp Bình, Thành phố Hồ Chí Minh', 10.8416000, 106.7341000, 'https://shopvnb.com/uploads/tin_tuc/san-pickleball-van-phuc-city-2_1759952280.jpg', 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-van-phuc-city-4-1759952316.jpg', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 'Sân Pickleball Miss Ú', '14/3 Minh Phụng, Phường Đông Hưng Thuận, Thành phố Hồ Chí Minh', 10.8305000, 106.6228000, 'https://shopvnb.com/uploads/tin_tuc/san-pickleball-miss-u-1_1760141164.jpg', 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-miss-u-4-1760141091.webp', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (6, 'Sân Pickleball 110 Đào Sư Tích', '110 Đào Sư Tích, Xã Nhà Bè, Thành phố Hồ Chí Minh', 10.7118000, 106.7045000, 'https://shopvnb.com/uploads/tin_tuc/san-pickleball-110-dao-su-tich-1_1761602127.jpg', 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-110-dao-su-tich-4-1761602128.webp', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Sources:
-- https://shopvnb.com/san-pickleball-club-21-ho-chi-minh.html
-- https://shopvnb.com/san-pickleball-pickle-dink-ho-chi-minh.html
-- https://shopvnb.com/san-pickleball-trung-tam-van-hoa-the-thao-quan-7.html
-- https://shopvnb.com/san-pickleball-unity.html
-- https://shopvnb.com/san-pickleball-banger.html
-- https://shopvnb.com/san-pickleball-saca.html
INSERT INTO venues (
    id, name, address, latitude, longitude, banner, logo, status, owner_id,
    created_at, updated_at
) VALUES
    (7, 'Pickleball Club 21', '103 Dương Quảng Hàm, Phường An Nhơn, Thành phố Hồ Chí Minh', 10.8382000, 106.6697000, 'https://shopvnb.com/uploads/tin_tuc/san-pickleball-club-21-ho-chi-minh-5_1776135682.webp', 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-club-21-ho-chi-minh-4-1776135684.webp', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (8, 'Pickle Dink Hồ Chí Minh', '36B/31 Đường B7, Làng Đại học Khu B, Xã Nhà Bè, Thành phố Hồ Chí Minh', 10.7129000, 106.7032000, 'https://shopvnb.com/uploads/tin_tuc/san-pickleball-pickle-dink-ho-chi-minh-1_1777337429.webp', 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-pickle-dink-ho-chi-minh-4-1777337716.jpg', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (9, 'Pickleball Trung tâm Văn hóa Thể thao Quận 7', '1521 Huỳnh Tấn Phát, Phường Phú Thuận, Thành phố Hồ Chí Minh', 10.7283000, 106.7212000, 'https://shopvnb.com/uploads/images/san-pickleball-trung-tam-van-hoa-the-thao-quan-7.jpg', 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-trung-tam-van-hoa-the-thao-quan-7-4-1733879333.webp', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (10, 'Sân Pickleball Unity', '136 Dương Đình Hội, Phường Phước Long, Thành phố Hồ Chí Minh', 10.8268000, 106.7745000, 'https://shopvnb.com/uploads/tin_tuc/san-pickleball-unity-4_1761678176.jpg', 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-unity-4-1761678176.webp', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (11, 'Sân Pickleball Banger', '90 Song Hành, Phường Bình Trưng, Thành phố Hồ Chí Minh', 10.7858000, 106.7594000, 'https://shopvnb.com/uploads/tin_tuc/san-pickleball-banger-8_1761687399.webp', 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-banger-4-1761687400.webp', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (12, 'Sân Pickleball SACA', 'Đường 410, Phường Phước Long, Thành phố Hồ Chí Minh', 10.8217000, 106.7769000, 'https://shopvnb.com/uploads/tin_tuc/san-pickleball-saca-3_1760489883.jpg', 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-saca-4-1760489883.webp', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Sources:
-- https://shopvnb.com/san-pickleball-rudal.html
-- https://shopvnb.com/pickleball-168-nguyen-huu-dat.html
-- https://shopvnb.com/san-pickleball-poc.html
-- https://shopvnb.com/san-pickleball-thanh-thai.html
-- https://www.coolmate.me/blog/review-top-san-pickleball-phu-nhuan-5806
-- https://gymstore.vn/san-pickleball-quan-2
-- https://www.vnturf.com/san-pickleball-quan-2-tphcm/
INSERT INTO venues (
    id, name, address, latitude, longitude, banner, logo, status, owner_id,
    created_at, updated_at
) VALUES
    (13, 'RUDAL Pickleball & Academy', '28 Đường 12, Phường An Khánh, Thành phố Hồ Chí Minh', 10.7904000, 106.7308000, 'https://shopvnb.com/uploads/images/san-pickleball-rudal.jpg', 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-pickleball-rudal-4-1720646250.webp', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (14, 'Pickleball 168 Nguyễn Hữu Dật', '168 Nguyễn Hữu Dật, Phường Tây Thạnh, Thành phố Hồ Chí Minh', 10.8070000, 106.6284000, 'https://shopvnb.com/uploads/tin_tuc/pickleball-168-nguyen-huu-dat-3_1761676713.webp', 'https://cdn.shopvnb.com/uploads/images/bai_viet/pickleball-168-nguyen-huu-dat-1-1761602529.webp', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (15, 'Sân Pickleball POC', '25 Tú Xương, Phường Phước Long, Thành phố Hồ Chí Minh', 10.8359000, 106.7725000, 'https://shopvnb.com/uploads/images/san-pickleball-poc-2.jpg', 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-poc-4-1730671188.webp', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (16, 'Sân Pickleball Thành Thái', '3/9 Thành Thái, Phường Diên Hồng, Thành phố Hồ Chí Minh', 10.7751000, 106.6654000, 'https://shopvnb.com/uploads/images/tin_tuc/san-pickleball-thanh-thai-1-1721268349.webp', 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-thanh-thai-4-1723679476.webp', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (17, 'PooC Pickleball & Badminton', '202B Hoàng Văn Thụ, Phường Đức Nhuận, Thành phố Hồ Chí Minh', 10.8013000, 106.6727000, 'https://www.coolmate.me/blog/wp-content/uploads/2025/09/review-top-san-pickleball-phu-nhuan-5806.jpg', 'https://n7media.coolmate.me/image/June2025/san-pickleball-phu-nhuan-003.jpg', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (18, 'An Phú Pickleball Club', '69 Đường Số 2, Phường An Khánh, Thành phố Hồ Chí Minh', 10.7924000, 106.7418000, 'https://bizweb.dktcdn.net/thumb/grande/100/011/344/articles/thum-500x300-b1da2953-ddd3-463f-be17-d0aec98b7685.jpg?v=1734102365383', 'https://www.vnturf.com/wp-content/uploads/2025/01/san-pickleball-an-phu.jpg', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Sources:
-- https://shopvnb.com/san-pickleball-tp-ho-chi-minh.html
-- https://shopvnb.com/san-pickleball-dep.html
-- https://shopvnb.com/san-pickleball-co-mai-che.html
-- https://shopvnb.com/san-pickleball-vuon-lan.html
-- https://shopvnb.com/san-pickleball-102.html
-- https://shopvnb.com/san-pickleball-130-che-lan-vien.html
-- https://shopvnb.com/san-pickleball-002.html
-- https://shopvnb.com/san-pickleball-vuon-ngoc-lan.html
-- https://shopvnb.com/san-pickleball-the-kitchen-zone.html
INSERT INTO venues (
    id, name, address, latitude, longitude, banner, logo, status, owner_id,
    created_at, updated_at
) VALUES
    (19, 'Sân Pickleball Vườn Lan', '21 Đường Số 34, Phường Bình Phú, Thành phố Hồ Chí Minh', 10.7462000, 106.6308000, 'https://shopvnb.com/uploads/tin_tuc/san-pickleball-tp-hcm_1717794548.webp', 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-pickleball-vuon-lan-4-1721617149.webp', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (20, 'Sân Pickleball 102', '55B Nguyễn Thị Minh Khai, Phường Bến Thành, Thành phố Hồ Chí Minh', 10.7718000, 106.6944000, 'https://shopvnb.com/uploads/tin_tuc/san-pickleball-tp-hcm_1717794548.webp', 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-pickleball-102-4-1721438742.webp', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (21, 'Sân Pickleball 130 Chế Lan Viên', '130 Chế Lan Viên, Phường Tây Thạnh, Thành phố Hồ Chí Minh', 10.8063000, 106.6247000, 'https://shopvnb.com/uploads/tin_tuc/san-pickleball-tp-hcm_1717794548.webp', 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-pickleball-130-che-lan-vien-3-1722039724.webp', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (22, '002 Pickleball Club', '28 Thảo Điền, Phường An Khánh, Thành phố Hồ Chí Minh', 10.8039000, 106.7392000, 'https://shopvnb.com/uploads/tin_tuc/san-pickleball-dep_1749522991.webp', 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-pickleball-002-4-1720831938.webp', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (23, 'Sân Pickleball Vườn Ngọc Lan', '189/1 Cống Quỳnh, Phường Cầu Ông Lãnh, Thành phố Hồ Chí Minh', 10.7636000, 106.6872000, 'https://shopvnb.com/uploads/tin_tuc/san-pickleball-dep_1749522991.webp', 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-vuon-ngoc-lan-4-1731441203.webp', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (24, 'The Kitchen Zone Pickleball', '32 Đồng Văn Cống, Phường Bình Trưng, Thành phố Hồ Chí Minh', 10.7908000, 106.7612000, 'https://shopvnb.com/uploads/tin_tuc/san-pickleball-co-mai-che_1747858776.webp', 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-the-kitchen-zone-4-1731091986.webp', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Football sources:
-- https://thegioithethao.vn/san-bong-da-tao-dan-f-b8jEO
-- https://thegioithethao.vn/san-bong-da-tt-370-f-pQhja
-- Badminton sources:
-- https://shopvnb.com/san-cau-long-cang-sai-gon.html
-- https://shopvnb.com/san-cau-long-tan-viet.html
-- Tennis sources:
-- https://tinphatsports.vn/review-san-tennis-ky-hoa-quan-10-chi-tiet/
-- https://tinphatsports.vn/san-tennis-lan-anh/
-- Basketball sources:
-- https://eduoka.com/news/trung-tam-day-bong-ro-tp-ho-chi-minh
-- https://svhtt.hochiminhcity.gov.vn/tin-chi-tiet/-/chi-tiet/trung-tam-huan-luyen-va-thi-%C4%91au-tdtt-thanh-pho-ho-chi-minh-to-chuc-huong-dan-tap-luyen-mien-phi-cac-mon-the-thao-nam-2024-24678-1941.html
-- https://nhathidauphutho.com/
-- https://tuoitre.vn/nld/100-dieu-thu-vi/nha-thi-dau-phu-tho-20130502044524657.htm
INSERT INTO venues (
    id, name, address, latitude, longitude, banner, logo, status, owner_id,
    created_at, updated_at
) VALUES
    (25, 'Sân bóng đá Tao Đàn', 'Đường Huyền Trân Công Chúa, Phường Bến Thành, Thành phố Hồ Chí Minh', 10.7740000, 106.6932000, 'https://img.thegioithethao.vn/media/san-bong-da/ho-chi-minh/quan-1/san-bong-tao-dan/san-bong-tao-Dan-3.webp', 'https://img.thegioithethao.vn/media/san-bong-da/ho-chi-minh/quan-1/san-bong-tao-dan/san-bong-tao-Dan-2.webp', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (26, 'Sân bóng đá TT 370', 'Hẻm 268 Tân Sơn, Phường Tân Sơn, Thành phố Hồ Chí Minh', 10.8249000, 106.6413000, 'https://img.thegioithethao.vn/media/san-bong-da/ho-chi-minh/quan-tan-binh/san-bong-da-tt-370/san-bong-da-tt-370-3.webp', 'https://img.thegioithethao.vn/media/san-bong-da/ho-chi-minh/quan-tan-binh/san-bong-da-tt-370/san-bong-da-tt-370-2.webp', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (27, 'Sân cầu lông Cảng Sài Gòn', 'Số 3 Trương Đình Hợi, Phường Xóm Chiếu, Thành phố Hồ Chí Minh', 10.7576000, 106.7082000, 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-cau-long-quan-4-1-1719005242.webp', 'https://shopvnb.com/themes/images/logo.png', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (28, 'Sân cầu lông Tân Việt', '234 Bình Long, Phường Phú Thạnh, Thành phố Hồ Chí Minh', 10.7844000, 106.6261000, 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-cau-long-tan-viet-1-1703455391.webp', 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-cau-long-tan-viet-2-1703455391.webp', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (29, 'Sân Tennis Kỳ Hòa', '12 Đường 3/2, Phường Hòa Hưng, Thành phố Hồ Chí Minh', 10.7759000, 106.6671000, 'https://tinphatsports.vn/wp-content/uploads/2024/07/Chat-luong-san-1-1.jpg', 'https://tinphatsports.vn/wp-content/uploads/2024/07/Dich-vu-1-1.jpg', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (30, 'CLB Tennis Lan Anh', '291 Cách Mạng Tháng 8, Phường Hòa Hưng, Thành phố Hồ Chí Minh', 10.7768000, 106.6781000, 'https://tinphatsports.vn/wp-content/uploads/2023/11/s%C3%A2n-tennis-Lan-Anh-4.jpg', 'https://tinphatsports.vn/wp-content/uploads/2024/03/tinphatsports-logo2.jpg', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (31, 'Trung tâm Huấn luyện và Thi đấu TDTT TP.HCM', '2A Lê Đại Hành, Phường Phú Thọ, Thành phố Hồ Chí Minh', 10.7672000, 106.6569000, 'https://eduoka.com/uploads/0000/1/2023/07/29/trung-tam-huan-luyen-va-thi-dau-bong-ro-tp-ho-chi-minh.jpg', 'https://eduoka.com/uploads/0000/1/2023/07/28/trung-tam-bong-ro-eballs.jpg', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (32, 'Nhà thi đấu Phú Thọ', 'Số 1 Lữ Gia, Phường Phú Thọ, Thành phố Hồ Chí Minh', 10.7677000, 106.6578000, 'https://nhathidauphutho.com/wp-content/uploads/2025/10/nha-thi-dau-phu-tho-quan-11-tphcm.webp', 'https://nhathidauphutho.com/wp-content/uploads/2025/10/lo-go-nha-thi-dau-phu-tho.png', 'ACTIVE', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Each venue has three distinct, publicly reachable photos of its courts or
-- facilities. Gallery URLs are not reused between venues.
INSERT INTO venue_images (venue_id, url) VALUES
    (1, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-vna-1-1731721604.webp'),
    (1, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-vna-2-1731721605.webp'),
    (1, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-vna-4-1731721606.webp'),
    (2, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-alp-1-1760302439.jpg'),
    (2, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-alp-2-1760302356.webp'),
    (2, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-alp-3-1760302439.jpg'),
    (3, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-van-thanh-1-1779153440.webp'),
    (3, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-van-thanh-2-1779153440.webp'),
    (3, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-van-thanh-3-1779153441.webp'),
    (4, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-van-phuc-city-1-1759952316.jpg'),
    (4, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-van-phuc-city-2-1759952316.jpg'),
    (4, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-van-phuc-city-3-1759951821.webp'),
    (5, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-miss-u-1-1760141164.jpg'),
    (5, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-miss-u-2-1760141164.jpg'),
    (5, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-miss-u-3-1760141164.jpg'),
    (6, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-110-dao-su-tich-1-1761602150.jpg'),
    (6, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-110-dao-su-tich-2-1761602150.jpg'),
    (6, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-110-dao-su-tich-3-1761602127.webp'),
    (7, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-club-21-ho-chi-minh-1-1776135682.webp'),
    (7, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-club-21-ho-chi-minh-2-1776135683.webp'),
    (7, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-club-21-ho-chi-minh-3-1776135684.webp'),
    (8, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-pickle-dink-ho-chi-minh-1-1777337430.webp'),
    (8, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-pickle-dink-ho-chi-minh-2-1777337430.webp'),
    (8, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-pickle-dink-ho-chi-minh-3-1777337431.webp'),
    (9, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-trung-tam-van-hoa-the-thao-quan-7-1-1733879331.webp'),
    (9, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-trung-tam-van-hoa-the-thao-quan-7-2-1733879332.webp'),
    (9, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-trung-tam-van-hoa-the-thao-quan-7-3-1733879333.webp'),
    (10, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-unity-1-1761678199.jpg'),
    (10, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-unity-2-1761678199.jpg'),
    (10, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-unity-3-1761678199.jpg'),
    (11, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-banger-1-1761687419.jpg'),
    (11, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-banger-2-1761687419.jpg'),
    (11, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-banger-1-1761687217.webp'),
    (12, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-saca-1-1760490524.jpg'),
    (12, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-saca-2-1760490524.jpg'),
    (12, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-saca-3-1760490524.jpg'),
    (13, 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-pickleball-rudal-1-1720646249.webp'),
    (13, 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-pickleball-rudal-2-1720646249.webp'),
    (13, 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-pickleball-rudal-3-1720646250.webp'),
    (14, 'https://cdn.shopvnb.com/uploads/images/bai_viet/pickleball-168-nguyen-huu-dat-1-1761676713.webp'),
    (14, 'https://cdn.shopvnb.com/uploads/images/bai_viet/pickleball-168-nguyen-huu-dat-2-1761676714.webp'),
    (14, 'https://cdn.shopvnb.com/uploads/images/bai_viet/pickleball-168-nguyen-huu-dat-3-1761676714.webp'),
    (15, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-poc-1-1730671186.webp'),
    (15, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-poc-2-1730671187.webp'),
    (15, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-poc-3-1730671187.webp'),
    (16, 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-pickleball-thanh-thai-1-1721268349.webp'),
    (16, 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-pickleball-thanh-thai-2-1721268349.webp'),
    (16, 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-pickleball-thanh-thai-3-1721268351.webp'),
    (17, 'https://n7media.coolmate.me/image/June2025/review-top-san-pickleball-phu-nhuan-ban-nhat-dinh-phai-thu-2.jpg'),
    (17, 'https://n7media.coolmate.me/image/June2025/san-pickleball-phu-nhuan-004.jpg'),
    (17, 'https://n7media.coolmate.me/image/June2025/review-top-san-pickleball-phu-nhuan-ban-nhat-dinh-phai-thu-3.jpg'),
    (18, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-an-phu-3-1724469300.webp'),
    (18, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-an-phu-4-1724469301.webp'),
    (18, 'https://www.vnturf.com/wp-content/uploads/2025/01/thue-san-pickleball-quan-2-tphcm.jpg'),
    (19, 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-pickleball-vuon-lan-1-1721617148.webp'),
    (19, 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-pickleball-vuon-lan-2-1721617148.webp'),
    (19, 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-pickleball-vuon-lan-3-1721617149.webp'),
    (20, 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-pickleball-102-1-1721438741.webp'),
    (20, 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-pickleball-102-2-1721438741.webp'),
    (20, 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-pickleball-102-3-1721438742.webp'),
    (21, 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-pickleball-130-che-lan-vien-1-1722039723.webp'),
    (21, 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-pickleball-130-che-lan-vien-2-1722039724.webp'),
    (21, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-130-che-lan-vien-3-1764969069.jpg'),
    (22, 'https://cdn.shopvnb.com/uploads/images/san-pickleball-002-7.webp'),
    (22, 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-pickleball-002-2-1720831936.webp'),
    (22, 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-pickleball-002-3-1720831937.webp'),
    (23, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-vuon-ngoc-lan-1-1731441201.webp'),
    (23, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-vuon-ngoc-lan-2-1731441202.webp'),
    (23, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-vuon-ngoc-lan-3-1731441203.webp'),
    (24, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-the-kitchen-zone-1-1731091984.webp'),
    (24, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-the-kitchen-zone-2-1731091985.webp'),
    (24, 'https://cdn.shopvnb.com/uploads/images/bai_viet/san-pickleball-the-kitchen-zone-3-1731091986.webp');

INSERT INTO venue_images (venue_id, url) VALUES
    (25, 'https://img.thegioithethao.vn/media/san-bong-da/ho-chi-minh/quan-1/san-bong-tao-dan/san-bong-tao-Dan-4.webp'),
    (25, 'https://img.thegioithethao.vn/media/san-bong-da/ho-chi-minh/quan-1/san-bong-tao-dan/san-bong-tao-Dan-1.webp'),
    (25, 'https://img.thegioithethao.vn/media/san-bong-da/ho-chi-minh/quan-1/san-bong-tao-dan/san-bong-tao-Dan-5.webp'),
    (26, 'https://img.thegioithethao.vn/media/san-bong-da/ho-chi-minh/quan-tan-binh/san-bong-da-tt-370/san-bong-da-tt-370-4.webp'),
    (26, 'https://img.thegioithethao.vn/media/san-bong-da/ho-chi-minh/quan-tan-binh/san-bong-da-tt-370/san-bong-da-tt-370-1.webp'),
    (26, 'https://img.thegioithethao.vn/media/san-bong-da/ho-chi-minh/quan-tan-binh/san-bong-da-tt-370/san-bong-da-tt-370-5.webp'),
    (27, 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-cau-long-quan-4-2-1719005242.webp'),
    (27, 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-cau-long-quan-4-3-1719005243.webp'),
    (27, 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-cau-long-quan-4-4-1719005243.webp'),
    (28, 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-cau-long-tan-viet-3-1703455392.webp'),
    (28, 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-cau-long-tan-viet-4-1703455392.webp'),
    (28, 'https://cdn.shopvnb.com/uploads/images/tin_tuc/san-cau-long-tan-viet-5-1703455392.webp'),
    (29, 'https://tinphatsports.vn/wp-content/uploads/2024/07/Mot-so-hinh-anh-tai-san-tennis-Ky-Hoa-quan-10.jpg'),
    (29, 'https://tinphatsports.vn/wp-content/uploads/2024/07/Hinh-anh-san-tennis-Ky-Hoa-quan-10.jpg'),
    (29, 'https://tinphatsports.vn/wp-content/uploads/2024/07/Hinh-anh-khac-cua-tennis-Ky-Hoa-quan-10.jpg'),
    (30, 'https://tinphatsports.vn/wp-content/uploads/2023/11/s%C3%A2n-tennis-Lan-Anh-1.jpg'),
    (30, 'https://tinphatsports.vn/wp-content/uploads/2023/11/s%C3%A2n-tennis-Lan-Anh-2.jpg'),
    (30, 'https://tinphatsports.vn/wp-content/uploads/2023/11/s%C3%A2n-tennis-Lan-Anh-3.jpg'),
    (31, 'https://eduoka.com/uploads/0000/1/2023/07/29/2-trung-tam-the-thao-tam-voc-viet-nam-bong-da-bong-ro-cau-long.jpg'),
    (31, 'https://eduoka.com/uploads/0000/1/2023/07/29/3-hoc-vien-bong-ro-yourlife.jpg'),
    (31, 'https://eduoka.com/uploads/0000/1/2023/07/29/trung-tam-tdtt-phu-nhuan.jpg'),
    (32, 'https://nhathidauphutho.com/wp-content/uploads/2025/10/nha-thi-dau-phu-tho-2025.webp'),
    (32, 'https://nhathidauphutho.com/wp-content/uploads/2025/10/nha-thi-dau-phu-tho-2025-1.webp'),
    (32, 'https://nhathidauphutho.com/wp-content/uploads/2025/10/nha-thi-dau-phu-tho-2025-2.webp');

-- Published court counts and lower-bound prices from the sources above.
-- Where a source did not publish a venue-specific price, 160000 is used,
-- matching ShopVNB's published lower bound for Ho Chi Minh City:
-- https://shopvnb.com/gia-thue-san-pickleball.html
INSERT INTO courts (
    name, price_per_hour, status, venue_id, sport_type_id, created_at, updated_at
)
SELECT
    'Sân Pickleball ' || court_number,
    source.price_per_hour,
    'ACTIVE',
    source.venue_id,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (
    VALUES
        (1, 6, 120000.00),
        (2, 8, 120000.00),
        (3, 14, 180000.00),
        (4, 12, 160000.00),
        (5, 4, 100000.00),
        (6, 2, 160000.00),
        (7, 8, 140000.00),
        (8, 3, 160000.00),
        (9, 2, 100000.00),
        (10, 4, 70000.00),
        (11, 12, 90000.00),
        (12, 4, 80000.00),
        (13, 6, 160000.00),
        (14, 10, 160000.00),
        (15, 4, 120000.00),
        (16, 4, 160000.00),
        (17, 6, 180000.00),
        (18, 4, 160000.00),
        (19, 4, 100000.00),
        (20, 2, 190000.00),
        (21, 3, 90000.00),
        (22, 4, 160000.00),
        (23, 7, 160000.00),
        (24, 4, 160000.00)
) AS source(venue_id, court_count, price_per_hour)
CROSS JOIN LATERAL GENERATE_SERIES(1, source.court_count) AS court_number;

INSERT INTO courts (
    name, price_per_hour, status, venue_id, sport_type_id, created_at, updated_at
)
SELECT
    source.court_name || ' ' || court_number,
    source.price_per_hour,
    'ACTIVE',
    source.venue_id,
    source.sport_type_id,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (
    VALUES
        (25, 1, 2, 'Sân bóng đá', 500000.00),
        (26, 8, 2, 'Sân bóng đá', 400000.00),
        (27, 2, 3, 'Sân cầu lông', 80000.00),
        (28, 4, 3, 'Sân cầu lông', 70000.00),
        (29, 8, 4, 'Sân tennis', 200000.00),
        (30, 8, 4, 'Sân tennis', 200000.00),
        (31, 2, 5, 'Sân bóng rổ', 200000.00),
        (32, 1, 5, 'Sân bóng rổ', 250000.00)
) AS source(venue_id, court_count, sport_type_id, court_name, price_per_hour)
CROSS JOIN LATERAL GENERATE_SERIES(1, source.court_count) AS court_number;

INSERT INTO benefits (venue_id, name)
SELECT venue_id, benefit
FROM GENERATE_SERIES(1, 32) AS venue_id
CROSS JOIN (
    VALUES
        ('Bãi giữ xe'),
        ('Hệ thống chiếu sáng'),
        ('Khu vực nghỉ ngơi'),
        ('Cho thuê vợt và bóng')
) AS benefits(benefit);

INSERT INTO rules (venue_id, name)
SELECT venue_id, rule
FROM GENERATE_SERIES(1, 32) AS venue_id
CROSS JOIN (
    VALUES
        ('Có mặt trước giờ đặt 10 phút'),
        ('Mang giày thể thao phù hợp'),
        ('Không mang đồ ăn vào sân'),
        ('Giữ gìn vệ sinh chung')
) AS rules(rule);

-- Real brand pages and their own public social/marketing images.
INSERT INTO hero_banners (id, url, target_url, created_at, updated_at) VALUES
    (1, 'https://www.decathlon.vn/blog/wp-content/uploads/2024/08/dung-cu-choi-pickleball-e1722498065798.webp', 'https://www.decathlon.vn/blog/pickleball-la-gi/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'https://cdn.hstatic.net/files/1000341630/collection/cover_web_pc__3__dece928b9ff24b428f85852f5dec931a.png', 'https://kamito.vn/collections/pickleball', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 'https://mcdn.coolmate.me/image/November2023/mceclip0_46.jpg', 'https://www.coolmate.me/collection/do-the-thao-nam', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (4, 'https://homepage.momocdn.net/img/momo-amazone-s3-api-241029082636-638657871963540172.jpg', 'https://www.momo.vn/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 'https://vnpay.vn/s1/statics.vnpay.vn/2022/6/0t98r20u2ruh1654574469292.jpg', 'https://vnpay.vn/', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- One owner owns all seeded venues because both supplied sandbox merchant IDs
-- are unique in the current data model and cannot be duplicated per owner.
INSERT INTO owner_payment_accounts (
    id, owner_id, provider, status, created_at, updated_at
) VALUES
    (1, 2, 'MOMO', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 2, 'VNPAY', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- access_key, secret_key and hash_secret are AES-256-GCM ciphertext generated
-- with the CREDENTIAL_ENCRYPTION_KEY currently present in this project.
-- Regenerate these values if that environment key changes.
INSERT INTO momo_credentials (
    id, payment_account_id, partner_code, access_key, secret_key,
    created_at, updated_at
) VALUES (
    1,
    1,
    'MOMO',
    'v1:bUVKqSS8EgF/aUjUP5Sr1g+cq1Jn5IEzG8oidD7+C/B17PpUT6cAmX8=',
    'v1:+yyCCab0y6PLuSLo1SoZ4LmoXcg8MZGK/fxTaEDpZm/XHbL/BhSWHD5XyRQuVf9cL/lUF7wm+hSqgyXc',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

INSERT INTO vnpay_credentials (
    id, payment_account_id, tmn_code, hash_secret, created_at, updated_at
) VALUES (
    1,
    2,
    'ZTAY1P26',
    'v1:xMH7dA4x3Nxf8hmlNDyYExvdR87UPbzPm3K7ofI9oKE7dXtTxWw7zfqV8S5eU+xoft0laDtIN+zKpI9X',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Deterministic test bookings are included for pagination and payment screens.
-- They use fictional customers, current-relative dates and valid court prices.
INSERT INTO bookings (
    id, customer_id, court_id, booking_date, start_time, end_time,
    total_price, required_deposit, status, created_at, updated_at
)
SELECT
    series,
    3 + ((series - 1) % 24),
    series,
    CURRENT_DATE + (1 + ((series - 1) % 14)),
    TIME '06:00' + (((series - 1) % 8) * INTERVAL '2 hours'),
    TIME '07:00' + (((series - 1) % 8) * INTERVAL '2 hours'),
    court.price_per_hour,
    ROUND(court.price_per_hour * 0.30, 2),
    CASE
        WHEN series % 5 = 0 THEN 'CANCELLED'
        WHEN series % 3 = 0 THEN 'CONFIRMED'
        ELSE 'PENDING'
    END,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM GENERATE_SERIES(1, 36) AS series
JOIN courts AS court ON court.id = series;

INSERT INTO payments (
    booking_id, payment_account_id, amount, payment_type, status,
    payment_method, transaction_code, paid_at, created_at, updated_at
)
SELECT
    booking.id,
    CASE WHEN booking.id % 2 = 0 THEN 1 ELSE 2 END,
    booking.required_deposit,
    'DEPOSIT',
    'PAID',
    CASE WHEN booking.id % 2 = 0 THEN 'MOMO' ELSE 'VNPAY' END,
    'SEED-PAID-' || LPAD(booking.id::TEXT, 4, '0'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM bookings AS booking
WHERE booking.status = 'CONFIRMED';

SELECT SETVAL(PG_GET_SERIAL_SEQUENCE('users', 'id'), (SELECT MAX(id) FROM users));
SELECT SETVAL(PG_GET_SERIAL_SEQUENCE('sport_types', 'id'), (SELECT MAX(id) FROM sport_types));
SELECT SETVAL(PG_GET_SERIAL_SEQUENCE('venues', 'id'), (SELECT MAX(id) FROM venues));
SELECT SETVAL(PG_GET_SERIAL_SEQUENCE('venue_images', 'id'), (SELECT MAX(id) FROM venue_images));
SELECT SETVAL(PG_GET_SERIAL_SEQUENCE('courts', 'id'), (SELECT MAX(id) FROM courts));
SELECT SETVAL(PG_GET_SERIAL_SEQUENCE('benefits', 'id'), (SELECT MAX(id) FROM benefits));
SELECT SETVAL(PG_GET_SERIAL_SEQUENCE('rules', 'id'), (SELECT MAX(id) FROM rules));
SELECT SETVAL(PG_GET_SERIAL_SEQUENCE('hero_banners', 'id'), (SELECT MAX(id) FROM hero_banners));
SELECT SETVAL(PG_GET_SERIAL_SEQUENCE('owner_payment_accounts', 'id'), (SELECT MAX(id) FROM owner_payment_accounts));
SELECT SETVAL(PG_GET_SERIAL_SEQUENCE('momo_credentials', 'id'), (SELECT MAX(id) FROM momo_credentials));
SELECT SETVAL(PG_GET_SERIAL_SEQUENCE('vnpay_credentials', 'id'), (SELECT MAX(id) FROM vnpay_credentials));
SELECT SETVAL(PG_GET_SERIAL_SEQUENCE('bookings', 'id'), (SELECT MAX(id) FROM bookings));
SELECT SETVAL(PG_GET_SERIAL_SEQUENCE('payments', 'id'), (SELECT MAX(id) FROM payments));
