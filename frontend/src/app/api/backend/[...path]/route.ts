import { NextRequest, NextResponse } from 'next/server';
import { axiosBackendClient } from '@/lib/axios';
import { AxiosError } from "axios";

// Gestion des méthodes HTTP
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(req, await params);
}

// Fonction centrale du proxy
async function handleProxy(req: NextRequest, params: { path: string[] }) {
  const targetUrl = "/" + params.path.join("/");
  console.log("[PROXY]", req.method, targetUrl);

  try {
    const authorization = req.headers.get("authorization") || "";
    const contentType = req.headers.get("content-type") || "application/json";

    const methodsWithBody = ["POST", "PUT", "PATCH", "DELETE"];
    const body = methodsWithBody.includes(req.method)
      ? await req.json().catch(() => undefined)
      : undefined;

    const response = await axiosBackendClient({
      method: req.method,
      url: targetUrl,
      headers: {
        Authorization: authorization,
        "Content-Type": contentType,
      },
      data: body,
      params: Object.fromEntries(req.nextUrl.searchParams),
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      console.error(
        "[PROXY ERROR]",
        JSON.stringify(err.response?.data || err.message)
      );
      return NextResponse.json(
        { error: err.response?.data || err.message },
        { status: err.response?.status || 500 }
      );
    }

    if (err instanceof Error) {
      console.error("[PROXY ERROR]", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    console.error("[PROXY ERROR]", err);
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
