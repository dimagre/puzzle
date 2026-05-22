import type { ReactElement } from "react";
import { Resend } from "resend";

const DEFAULT_FROM = "PuzzleShare <noreply@ukraone.com.ua>";

let cachedClient: Resend | null = null;

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!cachedClient) {
    cachedClient = new Resend(apiKey);
  }
  return cachedClient;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  react: ReactElement;
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const client = getClient();
  if (!client) {
    console.warn(
      `[email] RESEND_API_KEY is not set — skipping send to ${input.to} (${input.subject})`,
    );
    return;
  }

  const from = process.env.EMAIL_FROM ?? DEFAULT_FROM;

  try {
    const result = await client.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      react: input.react,
    });
    if (result.error) {
      console.error(
        `[email] Failed to send "${input.subject}" to ${input.to}:`,
        result.error,
      );
    }
  } catch (err) {
    console.error(
      `[email] Failed to send "${input.subject}" to ${input.to}:`,
      err,
    );
  }
}
