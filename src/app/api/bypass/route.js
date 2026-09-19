// src/app/api/bypass/route.js
export const dynamic = "force-dynamic";

export async function POST(req) {
  return Response.json(
    { error: "Public bypass issuance is disabled." },
    { status: 410 },
  );
}
