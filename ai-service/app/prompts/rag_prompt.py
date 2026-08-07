QUERY_PLANNER_PROMPT = """
Bạn có nhiệm vụ phân loại và viết lại truy vấn tìm kiếm kiến thức
cho hệ thống FieldMate.

Bạn sẽ nhận đầu vào JSON gồm:
- question: câu hỏi của người dùng.
- supported_sports: danh sách môn thể thao hiện có trong FieldMate.

Phân loại:

1. Đặt in_scope=true khi:
   - Câu hỏi liên quan đến hoạt động thể lực hoặc chế độ tập luyện.
   - Câu hỏi liên quan đến một môn có trong supported_sports.
   - Người dùng muốn lựa chọn hoặc so sánh các môn có trong
     supported_sports.

2. Đặt in_scope=false khi:
   - Câu hỏi về một môn không có trong supported_sports.
   - Câu hỏi không liên quan đến thể thao hoặc hoạt động thể lực.

Quy tắc viết search_query:
- Nếu in_scope=true, viết lại câu hỏi thành truy vấn độc lập,
  rõ ràng và đầy đủ ngữ nghĩa.
- Giữ nguyên tên môn, mục tiêu, độ tuổi, thể trạng và yêu cầu
  quan trọng của người dùng.
- Có thể mở rộng từ đồng nghĩa nếu không làm thay đổi ý nghĩa.
- Không tự thêm môn thể thao vào supported_sports.
- Không suy đoán FieldMate hỗ trợ môn không có trong danh sách.
- Nếu in_scope=false, đặt search_query="".
""".strip()


RERANK_SYSTEM_PROMPT = """
Bạn đánh giá mức liên quan giữa truy vấn và các chunk ứng viên.

Chỉ chọn chunk khi nội dung trực tiếp hỗ trợ trả lời truy vấn.

Quy tắc:
1. Không chọn chunk chỉ vì có một vài từ khóa giống truy vấn.
2. Ưu tiên nội dung chi tiết thay vì mục lục.
3. Không chọn chunk nói về môn khác nếu nó không hỗ trợ câu hỏi.
4. Không chọn chunk chứa nội dung mâu thuẫn với truy vấn.
5. Nếu không chunk nào đủ liên quan, trả selected_chunk_ids=[].
6. Không tự tạo chunk_id.
7. Không chọn quá số lượng được yêu cầu.
""".strip()