import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { Toaster } from "@/components/ui/toaster";
import { serializeProfile } from "@/lib/api/profile-serialize";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      deliveryRegion: true,
      deliveryCity: true,
      deliveryNovaPoshtaWarehouse: true,
    },
  });

  if (!user) {
    redirect("/login?callbackUrl=/checkout");
  }

  const profile = serializeProfile(user);
  const pickupWarehouse =
    process.env.NEXT_PUBLIC_PICKUP_WAREHOUSE_ADDRESS ?? "";
  const pickupSeller = process.env.NEXT_PUBLIC_PICKUP_SELLER_ADDRESS ?? "";

  return (
    <>
      <CheckoutClient
        profile={profile}
        pickupWarehouseAddress={pickupWarehouse}
        pickupSellerAddress={pickupSeller}
      />
      <Toaster />
    </>
  );
}
