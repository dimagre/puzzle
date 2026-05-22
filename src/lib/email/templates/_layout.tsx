import type { ReactNode } from "react";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

const BRAND = {
  primary: "#5B8C5A",
  cream: "#F5F0E8",
  accent: "#D4956A",
  text: "#1A1A1A",
  muted: "#6B6B6B",
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://puzzleshare.ua";

const main = {
  backgroundColor: BRAND.cream,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  margin: 0,
  padding: 0,
  color: BRAND.text,
};

const container = {
  margin: "0 auto",
  padding: "32px 24px",
  maxWidth: "560px",
  backgroundColor: "#FFFFFF",
  borderRadius: "8px",
};

const header = {
  borderBottom: `3px solid ${BRAND.primary}`,
  paddingBottom: "16px",
  marginBottom: "24px",
};

const logo = {
  fontSize: "24px",
  fontWeight: "700" as const,
  color: BRAND.primary,
  margin: 0,
  letterSpacing: "0.5px",
};

const heading = {
  fontSize: "20px",
  fontWeight: "600" as const,
  color: BRAND.text,
  margin: "0 0 16px",
};

const paragraph = {
  fontSize: "15px",
  lineHeight: "24px",
  color: BRAND.text,
  margin: "0 0 16px",
};

const footer = {
  fontSize: "12px",
  color: BRAND.muted,
  marginTop: "32px",
  textAlign: "center" as const,
  lineHeight: "18px",
};

const footerLink = {
  color: BRAND.primary,
  textDecoration: "none" as const,
};

interface EmailLayoutProps {
  preview: string;
  children: ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="uk">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>PuzzleShare</Text>
          </Section>
          {children}
          <Hr style={{ borderColor: BRAND.cream, margin: "24px 0 16px" }} />
          <Text style={footer}>
            PuzzleShare — оренда та обмін пазлів в Україні
            <br />
            <Link href={APP_URL} style={footerLink}>
              {APP_URL.replace(/^https?:\/\//, "")}
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export const emailStyles = {
  heading,
  paragraph,
  button: {
    backgroundColor: BRAND.primary,
    color: "#FFFFFF",
    padding: "12px 20px",
    borderRadius: "6px",
    textDecoration: "none" as const,
    fontWeight: "600" as const,
    display: "inline-block",
  },
  highlight: {
    backgroundColor: BRAND.cream,
    padding: "12px 16px",
    borderRadius: "6px",
    margin: "16px 0",
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    fontSize: "14px",
  },
  accent: {
    color: BRAND.accent,
    fontWeight: "600" as const,
  },
};

export function shortOrderId(orderId: string): string {
  return orderId.slice(0, 8).toUpperCase();
}
