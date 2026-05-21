import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    { error: { code: "BAD_REQUEST", message, details } },
    { status: 400 },
  );
}

export function unauthorized(message = "Authentication required") {
  return NextResponse.json(
    { error: { code: "UNAUTHORIZED", message } },
    { status: 401 },
  );
}

export function forbidden(message = "Admin access required") {
  return NextResponse.json(
    { error: { code: "FORBIDDEN", message } },
    { status: 403 },
  );
}

export function notFound(message = "Not found") {
  return NextResponse.json(
    { error: { code: "NOT_FOUND", message } },
    { status: 404 },
  );
}

export function conflict(message: string) {
  return NextResponse.json(
    { error: { code: "CONFLICT", message } },
    { status: 409 },
  );
}

export function internalError(message = "Internal server error") {
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message } },
    { status: 500 },
  );
}

export function fromZodError(err: ZodError) {
  return badRequest("Invalid request body", err.flatten());
}
