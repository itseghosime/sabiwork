import { PaymentHistoryScreen } from "@/features/lifecycle/screens";
import { defaultTransactions } from "@/features/lifecycle/service";

export default function PaymentHistoryPage() {
  return <PaymentHistoryScreen initialTransactions={defaultTransactions} />;
}

