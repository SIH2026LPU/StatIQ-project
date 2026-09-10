import { NextRequest, NextResponse } from "next/server";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";
import { unitDataClient } from "@/lib/integrations/mospi/unitdataClient";
import { logUnitData } from "@/lib/integrations/mospi/unitdataHttp";
import { logAccess, logDownload } from "@/lib/integrations/mospi/unitdataCache";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ datasetId: string; fileId: string }> },
) {
  const started = Date.now();
  const { datasetId, fileId } = await params;
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const decodedFile = decodeURIComponent(fileId);
  const result = await unitDataClient.downloadFile(datasetId, decodedFile);

  if (!result.ok) {
    await logDownload({
      userId: session.userId,
      datasetId,
      fileId: decodedFile,
      status: result.mode,
      category: result.category,
    });
    await logAccess({
      userId: session.userId,
      role: session.role,
      action: "download_file",
      datasetId,
      fileId: decodedFile,
      status: result.mode,
      category: result.category,
    });
    logUnitData({
      endpoint: "POST /api/microdata/.../download",
      datasetId,
      fileId: decodedFile,
      durationMs: Date.now() - started,
      status: result.mode === "AUTH_REQUIRED" ? 403 : 502,
      category: result.category,
    });
    return NextResponse.json(
      {
        source: result.source,
        mode: result.mode,
        error: result.error,
        category: result.category,
        message: result.mode === "AUTH_REQUIRED" ? result.error : undefined,
      },
      { status: result.mode === "AUTH_REQUIRED" ? 403 : result.mode === "NOT_CONFIGURED" ? 503 : 502 },
    );
  }

  const fileStat = await stat(result.path);
  const stream = createReadStream(result.path);
  const webStream = Readable.toWeb(stream) as ReadableStream;

  await logDownload({
    userId: session.userId,
    datasetId,
    fileId: decodedFile,
    fileName: result.fileName,
    status: "ok",
  });
  await logAccess({
    userId: session.userId,
    role: session.role,
    action: "download_file",
    datasetId,
    fileId: decodedFile,
    status: "ok",
  });
  logUnitData({
    endpoint: "POST /api/microdata/.../download",
    datasetId,
    fileId: decodedFile,
    durationMs: Date.now() - started,
    status: 200,
    category: "LIVE",
  });

  return new NextResponse(webStream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(fileStat.size),
      "Content-Disposition": `attachment; filename="${result.fileName.replace(/"/g, "")}"`,
    },
  });
}
