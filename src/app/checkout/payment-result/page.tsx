import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PaymentResultClient } from "@/components/checkout/PaymentResultClient";

export const dynamic = "force-dynamic";

interface PaymentResultPageProps {
  searchParams: { orderId?: string; error?: string };
}

export default async function PaymentResultPage({
  searchParams,
}: PaymentResultPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  const orderId = searchParams.orderId;
  if (!orderId) {
    redirect("/checkout");
  }

  return (
    <PaymentResultClient
      orderId={orderId}
      initialError={searchParams.error}
    />
  );
}
