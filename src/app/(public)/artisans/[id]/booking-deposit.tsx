"use client";
import Link from "next/link";
export function BookingDeposit({ customerWorkspace = false }: {
  artisanId: string; artisanName: string; amountKobo: number; paymentsEnabled: boolean;
  initialEmail?: string; customerWorkspace?: boolean;
}) {
  return <div className="pa-booking-form">
    <p>Agree the scope and price in a quote first. Accepting a quote creates your booking; pay its 50% deposit from the booking page.</p>
    <Link className="button button-primary" href={customerWorkspace ? "/requests/new" : "/login"}>Request a quote before paying</Link>
  </div>;
}
