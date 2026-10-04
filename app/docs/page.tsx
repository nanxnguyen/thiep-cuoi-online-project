"use client";

import dynamic from "next/dynamic";
import { apiOpenApiDoc } from "@/lib/api-docs";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false, loading: () => <p>Đang tải tài liệu API…</p> });

export default function ApiDocsPage() {
  return (
    <main className="section" style={{ paddingBlock: "32px" }}>
      <p className="eyebrow">Tài liệu API</p>
      <h1 style={{ margin: "12px 0" }}>MỘC Wedding API</h1>
      <p className="lede" style={{ marginBottom: "16px" }}>
        Spec JSON: <a href="/api/docs">/api/docs</a>
      </p>
      <SwaggerUI spec={apiOpenApiDoc} persistAuthorization deepLinking />
    </main>
  );
}
