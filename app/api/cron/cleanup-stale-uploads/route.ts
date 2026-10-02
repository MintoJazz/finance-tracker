import { NextResponse } from "next/server";
import { StorageFactory } from "@/modules/storage/infra/factories/storage.factory";

export async function POST(request: Request) {
  // Verificação opcional de chave de autorização do cron
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const useCase = StorageFactory.makeCleanupStaleUploads();
  const result = await useCase.execute();

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result.data, { status: 200 });
}

export async function GET(request: Request) {
  return POST(request);
}
