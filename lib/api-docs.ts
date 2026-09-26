// OpenAPI 3.0 cho BE Next.js (18 Route Handlers trong app/api/**).
// Giữ đồng bộ với lib/api.ts khi thêm/sửa endpoint.
export const apiOpenApiDoc = {
  openapi: "3.0.3",
  info: {
    title: "MỘC Wedding API",
    version: "1.0.0",
    description: "Backend Next.js + Supabase: thiệp cưới, RSVP, lời chúc, khách mời, tài khoản.",
  },
  servers: [{ url: "/", description: "Cùng origin với frontend" }],
  tags: [
    { name: "Auth", description: "Đăng ký / đăng nhập (cookie HttpOnly)" },
    { name: "Account", description: "Thiệp của tài khoản đã đăng nhập" },
    { name: "Invitations", description: "CRUD thiệp bằng edit key (#k=) hoặc cookie chủ sở hữu" },
    { name: "Guests", description: "Quản lý danh sách khách mời" },
    { name: "Public", description: "Endpoint công khai cho trang khách /invite/[slug]" },
    { name: "Docs", description: "Tài liệu API" },
  ],
  paths: {
    "/api/docs": {
      get: {
        tags: ["Docs"],
        summary: "Lấy OpenAPI JSON của API này",
        responses: { "200": { description: "OpenAPI JSON" } },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Đăng ký tài khoản (email + mật khẩu)",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/AuthInput" } } },
        },
        responses: {
          "201": { description: "Đã tạo, trả accessToken + user", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
          "400": { $ref: "#/components/responses/Problem" },
          "409": { description: "Email đã có tài khoản", content: { "application/json": { schema: { $ref: "#/components/schemas/Problem" } } } },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Đăng nhập, set cookie phiên",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/AuthInput" } } },
        },
        responses: {
          "200": { description: "OK, trả accessToken + user", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
          "401": { $ref: "#/components/responses/Problem" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Lấy user hiện tại từ cookie",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": { description: "User hiện tại", content: { "application/json": { schema: { $ref: "#/components/schemas/AccountUser" } } } },
          "401": { $ref: "#/components/responses/Problem" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Đăng xuất, xoá cookie phiên",
        security: [{ cookieAuth: [] }],
        responses: { "204": { description: "Đã đăng xuất" } },
      },
    },
    "/api/account/invitations": {
      get: {
        tags: ["Account"],
        summary: "Liệt kê thiệp của tài khoản",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": { description: "Danh sách thiệp", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/AccountInvitation" } } } } },
          "401": { $ref: "#/components/responses/Problem" },
        },
      },
    },
    "/api/account/invitations/claim": {
      post: {
        tags: ["Account"],
        summary: "Nhận thiệp về tài khoản bằng edit key",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/ClaimInput" } } },
        },
        responses: {
          "200": { description: "Thiệp đã nhận", content: { "application/json": { schema: { $ref: "#/components/schemas/AccountInvitation" } } } },
          "401": { $ref: "#/components/responses/Problem" },
          "404": { $ref: "#/components/responses/Problem" },
        },
      },
    },
    "/api/invitations": {
      post: {
        tags: ["Invitations"],
        summary: "Tạo thiệp mới, trả link chỉnh sửa",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CreateInvitationInput" } } },
        },
        responses: {
          "201": { description: "Đã tạo (id, slug, key)", content: { "application/json": { schema: { $ref: "#/components/schemas/CreatedInvitation" } } } },
          "400": { $ref: "#/components/responses/Problem" },
        },
      },
    },
    "/api/invitations/{id}": {
      get: {
        tags: ["Invitations"],
        summary: "Lấy thiệp để sửa",
        security: [{ editKey: [] }, { cookieAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/InvitationId" }],
        responses: {
          "200": { description: "Chi tiết thiệp", content: { "application/json": { schema: { $ref: "#/components/schemas/InvitationDto" } } } },
          "401": { $ref: "#/components/responses/Problem" },
          "404": { $ref: "#/components/responses/Problem" },
        },
      },
      patch: {
        tags: ["Invitations"],
        summary: "Autosave: sửa mẫu / nội dung / slug / xuất bản",
        security: [{ editKey: [] }, { cookieAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/InvitationId" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateInvitationInput" } } },
        },
        responses: {
          "200": { description: "Thiệp sau khi sửa", content: { "application/json": { schema: { $ref: "#/components/schemas/InvitationDto" } } } },
          "400": { $ref: "#/components/responses/Problem" },
          "401": { $ref: "#/components/responses/Problem" },
        },
      },
    },
    "/api/invitations/{id}/responses": {
      get: {
        tags: ["Invitations"],
        summary: "Xem RSVP + lời chúc của thiệp",
        security: [{ editKey: [] }, { cookieAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/InvitationId" }],
        responses: {
          "200": { description: "RSVP, tổng hợp, lời chúc", content: { "application/json": { schema: { $ref: "#/components/schemas/ResponsesDto" } } } },
          "401": { $ref: "#/components/responses/Problem" },
        },
      },
    },
    "/api/invitations/{id}/guests": {
      get: {
        tags: ["Guests"],
        summary: "Liệt kê khách mời",
        security: [{ editKey: [] }, { cookieAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/InvitationId" }],
        responses: {
          "200": { description: "Danh sách khách", content: { "application/json": { schema: { $ref: "#/components/schemas/GuestList" } } } },
          "401": { $ref: "#/components/responses/Problem" },
        },
      },
      post: {
        tags: ["Guests"],
        summary: "Thêm một khách mời (household bắt buộc)",
        security: [{ editKey: [] }, { cookieAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/InvitationId" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/GuestInput" } } },
        },
        responses: {
          "201": { description: "Khách đã tạo", content: { "application/json": { schema: { $ref: "#/components/schemas/GuestDto" } } } },
          "400": { $ref: "#/components/responses/Problem" },
        },
      },
    },
    "/api/invitations/{id}/guests/import": {
      post: {
        tags: ["Guests"],
        summary: "Nhập hàng loạt khách mời",
        security: [{ editKey: [] }, { cookieAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/InvitationId" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", required: ["guests"], properties: { guests: { type: "array", items: { $ref: "#/components/schemas/GuestInput" } } } } } },
        },
        responses: {
          "200": { description: "Kết quả import", content: { "application/json": { schema: { $ref: "#/components/schemas/GuestImportResult" } } } },
          "400": { $ref: "#/components/responses/Problem" },
        },
      },
    },
    "/api/invitations/{id}/guests/{guestId}": {
      patch: {
        tags: ["Guests"],
        summary: "Sửa khách mời (trường bỏ qua = giữ nguyên)",
        security: [{ editKey: [] }, { cookieAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/InvitationId" }, { $ref: "#/components/parameters/GuestId" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/GuestInput" } } },
        },
        responses: {
          "200": { description: "Khách sau khi sửa", content: { "application/json": { schema: { $ref: "#/components/schemas/GuestDto" } } } },
          "404": { $ref: "#/components/responses/Problem" },
        },
      },
      delete: {
        tags: ["Guests"],
        summary: "Xoá khách mời",
        security: [{ editKey: [] }, { cookieAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/InvitationId" }, { $ref: "#/components/parameters/GuestId" }],
        responses: { "204": { description: "Đã xoá" }, "404": { $ref: "#/components/responses/Problem" } },
      },
    },
    "/api/invitations/{id}/media": {
      post: {
        tags: ["Invitations"],
        summary: "Upload ảnh (PNG/JPEG/WebP ≤2MB) hoặc nhạc (MP3 ≤8MB)",
        security: [{ editKey: [] }, { cookieAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/InvitationId" }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["kind", "file"],
                properties: {
                  kind: { type: "string", enum: ["image", "audio"] },
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "URL file", content: { "application/json": { schema: { type: "object", required: ["url"], properties: { url: { type: "string" } } } } } },
          "400": { $ref: "#/components/responses/Problem" },
          "413": { $ref: "#/components/responses/Problem" },
          "415": { $ref: "#/components/responses/Problem" },
        },
      },
    },
    "/api/invitations/{id}/wishes/{wishId}": {
      patch: {
        tags: ["Invitations"],
        summary: "Ẩn / duyệt lời chúc",
        security: [{ editKey: [] }, { cookieAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/InvitationId" }, { $ref: "#/components/parameters/WishId" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", properties: { hidden: { type: "boolean" }, approved: { type: "boolean" } } } } },
        },
        responses: { "204": { description: "Đã cập nhật" }, "404": { $ref: "#/components/responses/Problem" } },
      },
    },
    "/api/public/invitations/{slug}": {
      get: {
        tags: ["Public"],
        summary: "Lấy thiệp đã xuất bản + lời chúc đã duyệt (không cache)",
        parameters: [{ $ref: "#/components/parameters/Slug" }],
        responses: {
          "200": { description: "Thiệp công khai", content: { "application/json": { schema: { $ref: "#/components/schemas/PublicInvitationDto" } } } },
          "404": { $ref: "#/components/responses/Problem" },
        },
      },
    },
    "/api/public/invitations/{slug}/rsvp": {
      post: {
        tags: ["Public"],
        summary: "Gửi RSVP (qua Edge Function, chống spam)",
        security: [{ idempotencyKey: [] }],
        parameters: [{ $ref: "#/components/parameters/Slug" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RsvpInput" } } },
        },
        responses: {
          "204": { description: "Đã nhận RSVP" },
          "400": { $ref: "#/components/responses/Problem" },
          "403": { description: "Chủ thiệp đã tắt RSVP", content: { "application/json": { schema: { $ref: "#/components/schemas/Problem" } } } },
          "404": { $ref: "#/components/responses/Problem" },
          "429": { $ref: "#/components/responses/Problem" },
        },
      },
    },
    "/api/public/invitations/{slug}/wishes": {
      post: {
        tags: ["Public"],
        summary: "Gửi lời chúc (mặc định chờ duyệt)",
        security: [{ idempotencyKey: [] }],
        parameters: [{ $ref: "#/components/parameters/Slug" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/WishInput" } } },
        },
        responses: {
          "201": { description: "Lời chúc", content: { "application/json": { schema: { $ref: "#/components/schemas/PublicWish" } } } },
          "400": { $ref: "#/components/responses/Problem" },
          "429": { $ref: "#/components/responses/Problem" },
        },
      },
    },
    "/api/public/invitations/{slug}/guests/{token}": {
      get: {
        tags: ["Public"],
        summary: "Giải mã link khách ?g= thành tên hộ (sai token = 404, không lỗi trang)",
        parameters: [{ $ref: "#/components/parameters/Slug" }, { $ref: "#/components/parameters/GuestToken" }],
        responses: {
          "200": { description: "Tên hộ gia đình", content: { "application/json": { schema: { type: "object", required: ["household"], properties: { household: { type: "string" } } } } } },
          "404": { $ref: "#/components/responses/Problem" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      editKey: { type: "apiKey", in: "header", name: "X-Edit-Key", description: "Edit key sau #k= trong link chỉnh sửa" },
      cookieAuth: { type: "apiKey", in: "cookie", name: "sb-access-token", description: "Cookie phiên HttpOnly sau khi đăng nhập" },
      idempotencyKey: { type: "apiKey", in: "header", name: "Idempotency-Key", description: "UUID chống gửi trùng (16–120 ký tự)" },
    },
    parameters: {
      InvitationId: { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      Slug: { name: "slug", in: "path", required: true, schema: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" } },
      GuestId: { name: "guestId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      WishId: { name: "wishId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      GuestToken: { name: "token", in: "path", required: true, schema: { type: "string" } },
    },
    responses: {
      Problem: {
        description: "Lỗi dạng { detail }",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Problem" } } },
      },
    },
    schemas: {
      Problem: { type: "object", required: ["detail"], properties: { detail: { type: "string" } } },
      AuthInput: {
        type: "object",
        required: ["email", "password"],
        properties: { email: { type: "string", format: "email", maxLength: 254 }, password: { type: "string", minLength: 8, maxLength: 72 } },
      },
      AccountUser: { type: "object", required: ["id", "email"], properties: { id: { type: "string" }, email: { type: "string" } } },
      AuthResponse: {
        type: "object",
        required: ["accessToken", "user"],
        properties: { accessToken: { type: "string" }, user: { $ref: "#/components/schemas/AccountUser" } },
      },
      AccountInvitation: {
        type: "object",
        required: ["id", "slug", "templateId", "published", "updatedAt", "groomName", "brideName", "weddingDate", "paletteKey"],
        properties: {
          id: { type: "string" }, slug: { type: "string" }, templateId: { type: "string" },
          published: { type: "boolean" }, updatedAt: { type: "string" },
          groomName: { type: "string" }, brideName: { type: "string" },
          weddingDate: { type: "string" }, paletteKey: { type: "string" },
        },
      },
      ClaimInput: {
        type: "object",
        required: ["id", "key"],
        properties: { id: { type: "string", format: "uuid" }, key: { type: "string", minLength: 20, maxLength: 200 } },
      },
      CreateInvitationInput: {
        type: "object",
        required: ["templateId", "content"],
        properties: { templateId: { type: "string", maxLength: 80 }, content: { type: "object", description: "Đúng contentSchema trong lib/content.ts" } },
      },
      CreatedInvitation: {
        type: "object",
        required: ["id", "slug", "key"],
        properties: { id: { type: "string" }, slug: { type: "string" }, key: { type: "string", description: "Edit key, gắn sau #k=" } },
      },
      InvitationDto: {
        type: "object",
        required: ["id", "slug", "templateId", "content", "published", "publishedAt", "updatedAt"],
        properties: {
          id: { type: "string" }, slug: { type: "string" }, templateId: { type: "string" },
          content: { type: "object" }, published: { type: "boolean" },
          publishedAt: { type: "string", nullable: true }, updatedAt: { type: "string" },
        },
      },
      UpdateInvitationInput: {
        type: "object",
        properties: {
          templateId: { type: "string" }, content: { type: "object" },
          slug: { type: "string" }, published: { type: "boolean" },
        },
      },
      PublicWish: {
        type: "object",
        required: ["id", "name", "message", "createdAt"],
        properties: { id: { type: "string" }, name: { type: "string" }, message: { type: "string" }, createdAt: { type: "string" } },
      },
      PublicInvitationDto: {
        type: "object",
        required: ["id", "slug", "templateId", "content", "wishes"],
        properties: {
          id: { type: "string" }, slug: { type: "string" }, templateId: { type: "string" },
          content: { type: "object" },
          wishes: { type: "array", items: { $ref: "#/components/schemas/PublicWish" } },
        },
      },
      RsvpInput: {
        type: "object",
        required: ["name", "attending", "guests", "note", "answers", "guestLabel", "guestToken", "website"],
        properties: {
          name: { type: "string", maxLength: 80 }, attending: { type: "boolean" },
          guests: { type: "integer", minimum: 0, maximum: 100 }, note: { type: "string", maxLength: 500 },
          answers: { type: "object", additionalProperties: { type: "string", maxLength: 300 }, maxProperties: 3 },
          guestLabel: { type: "string", maxLength: 80 }, guestToken: { type: "string", maxLength: 128 },
          website: { type: "string", maxLength: 200, description: "Honeypot chống bot, luôn để trống" },
        },
      },
      WishInput: {
        type: "object",
        required: ["name", "message", "website"],
        properties: {
          name: { type: "string", maxLength: 80 }, message: { type: "string", maxLength: 500 },
          website: { type: "string", maxLength: 200, description: "Honeypot chống bot, luôn để trống" },
        },
      },
      RsvpRow: {
        type: "object",
        required: ["id", "name", "attending", "guests", "note", "answers", "guestLabel", "createdAt"],
        properties: {
          id: { type: "string" }, name: { type: "string" }, attending: { type: "boolean" },
          guests: { type: "integer" }, note: { type: "string" },
          answers: { type: "object", additionalProperties: { type: "string" } },
          guestLabel: { type: "string" }, createdAt: { type: "string" },
        },
      },
      WishRow: {
        allOf: [
          { $ref: "#/components/schemas/PublicWish" },
          { type: "object", required: ["hidden", "approved"], properties: { hidden: { type: "boolean" }, approved: { type: "boolean" } } },
        ],
      },
      ResponsesDto: {
        type: "object",
        required: ["rsvps", "summary", "wishes"],
        properties: {
          rsvps: { type: "array", items: { $ref: "#/components/schemas/RsvpRow" } },
          summary: {
            type: "object",
            required: ["attending", "declined", "headcount"],
            properties: { attending: { type: "integer" }, declined: { type: "integer" }, headcount: { type: "integer" } },
          },
          wishes: { type: "array", items: { $ref: "#/components/schemas/WishRow" } },
        },
      },
      GuestDto: {
        type: "object",
        required: ["id", "household", "groupName", "tableNo", "phone", "expectedPax", "note", "token", "link", "rsvpStatus", "confirmedPax", "createdAt", "updatedAt"],
        properties: {
          id: { type: "string" }, household: { type: "string" }, groupName: { type: "string" },
          tableNo: { type: "string" }, phone: { type: "string" }, expectedPax: { type: "integer" },
          note: { type: "string" }, token: { type: "string" }, link: { type: "string" },
          rsvpStatus: { type: "string", enum: ["pending", "attending", "declined"] },
          confirmedPax: { type: "integer", nullable: true },
          createdAt: { type: "string" }, updatedAt: { type: "string" },
        },
      },
      GuestInput: {
        type: "object",
        properties: {
          household: { type: "string" }, groupName: { type: "string" }, tableNo: { type: "string" },
          phone: { type: "string" }, expectedPax: { type: "integer" }, note: { type: "string" },
        },
      },
      GuestList: { type: "object", required: ["guests"], properties: { guests: { type: "array", items: { $ref: "#/components/schemas/GuestDto" } } } },
      GuestImportResult: {
        type: "object",
        required: ["created", "errors"],
        properties: {
          created: { type: "integer" },
          errors: { type: "array", items: { type: "object", required: ["index", "message"], properties: { index: { type: "integer" }, message: { type: "string" } } } },
        },
      },
    },
  },
} as const;
