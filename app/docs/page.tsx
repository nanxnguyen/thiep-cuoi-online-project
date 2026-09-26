"use client";

import SwaggerUI from "swagger-ui-react";
import { apiOpenApiDoc } from "@/lib/api-docs";

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
