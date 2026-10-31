import { PaymentReceiptScreen } from "@/features/payments/screens";
import { paymentsDemoService } from "@/features/payments/service";

export default async function PaymentReceiptPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const receipt = await paymentsDemoService.getReceipt(ref);
  return <PaymentReceiptScreen receipt={receipt} />;
}
