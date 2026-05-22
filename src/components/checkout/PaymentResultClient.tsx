"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

type PaymentStatusResponse = {
  orderId: string;
  status: "pending" | "success" | "failure";
};

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 30000;

interface PaymentResultClientProps {
  orderId: string;
  initialError?: string;
}

export function PaymentResultClient({ orderId, initialError }: PaymentResultClientProps) {
  const t = useTranslations("checkout.paymentResult");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"pending" | "success" | "failure" | "timeout">(
    initialError ? "failure" : "pending",
  );
  const [error, setError] = useState<string | null>(
    initialError ? t("errorInit") : null,
  );
  const [retryLoading, setRetryLoading] = useState(false);
  const startedAtRef = useRef<number>(Date.now());
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/payments/status?orderId=${encodeURIComponent(orderId)}`,
        { cache: "no-store" },
      );
      if (!res.ok) {
        setError(t("errorLookup"));
        return;
      }
      const body = (await res.json()) as PaymentStatusResponse;
      if (body.status === "success") {
        setStatus("success");
      } else if (body.status === "failure") {
        setStatus("failure");
      } else {
        if (Date.now() - startedAtRef.current > POLL_TIMEOUT_MS) {
          setStatus("timeout");
        }
      }
    } catch {
      setError(t("errorLookup"));
    }
  }, [orderId, t]);

  useEffect(() => {
    if (initialError || status !== "pending") return;
    void poll();
    const id = setInterval(() => {
      void poll();
    }, POLL_INTERVAL_MS);
    intervalRef.current = id;
    return () => clearInterval(id);
  }, [initialError, poll, status]);

  useEffect(() => {
    if (status !== "pending" && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [status]);

  useEffect(() => {
    if (status === "success") {
      router.replace(`/checkout/success?orderId=${encodeURIComponent(orderId)}`);
    }
  }, [status, orderId, router]);

  async function handleRetry() {
    setRetryLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) {
        setError(t("errorInit"));
        setRetryLoading(false);
        return;
      }
      const body = (await res.json()) as { paymentUrl: string };
      window.location.assign(body.paymentUrl);
    } catch {
      setError(t("errorInit"));
      setRetryLoading(false);
    }
  }

  // searchParams is referenced to keep the component reactive to URL changes.
  void searchParams;

  if (status === "success") {
    return (
      <ResultShell title={t("redirecting")} description={t("redirectingDescription")}>
        <Spinner />
      </ResultShell>
    );
  }

  if (status === "failure") {
    return (
      <ResultShell
        title={t("failureTitle")}
        description={error ?? t("failureDescription")}
        emoji="❌"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={handleRetry} disabled={retryLoading}>
            {retryLoading ? t("retrying") : t("retry")}
          </Button>
          <Button asChild variant="outline">
            <Link href="/cart">{t("backToCart")}</Link>
          </Button>
        </div>
      </ResultShell>
    );
  }

  if (status === "timeout") {
    return (
      <ResultShell
        title={t("processingTitle")}
        description={t("processingDescription")}
        emoji="⏳"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/profile">{t("viewOrders")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/catalog">{t("continueBrowsing")}</Link>
          </Button>
        </div>
      </ResultShell>
    );
  }

  return (
    <ResultShell
      title={t("pendingTitle")}
      description={t("pendingDescription")}
    >
      <Spinner />
    </ResultShell>
  );
}

function ResultShell({
  title,
  description,
  emoji,
  children,
}: {
  title: string;
  description: string;
  emoji?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-16">
      <div className="rounded-lg border border-border bg-white p-6 sm:p-8">
        <div className="text-center">
          {emoji ? <p className="text-3xl">{emoji}</p> : null}
          <h1 className="mt-2 text-2xl font-bold text-sage sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center" role="status" aria-live="polite">
      <span className="sr-only">Loading</span>
      <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-sage border-t-transparent" />
    </div>
  );
}
