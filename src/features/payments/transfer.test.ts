import { describe, expect, it } from "vitest";
import {
  isNuban,
  maskAccountNumber,
  normalizeTransferStatus,
  payoutIsSettled,
  payoutWasReturned,
} from "./transfer";

describe("isNuban", () => {
  it("accepts ten-digit account numbers", () => {
    expect(isNuban("0123456789")).toBe(true);
  });

  it("rejects the wrong length", () => {
    expect(isNuban("012345678")).toBe(false);
    expect(isNuban("01234567890")).toBe(false);
    expect(isNuban("")).toBe(false);
  });

  it("rejects anything that is not purely numeric", () => {
    expect(isNuban("012345678a")).toBe(false);
    expect(isNuban("01234 5678")).toBe(false);
    expect(isNuban(null)).toBe(false);
    expect(isNuban(1234567890)).toBe(false);
  });
});

describe("maskAccountNumber", () => {
  it("keeps only the last four digits", () => {
    expect(maskAccountNumber("0123456789")).toBe("••••6789");
  });

  it("returns null when there is nothing worth showing", () => {
    expect(maskAccountNumber(null)).toBeNull();
    expect(maskAccountNumber("123")).toBeNull();
  });
});

describe("normalizeTransferStatus", () => {
  it("passes through the statuses the column accepts", () => {
    expect(normalizeTransferStatus("success")).toBe("success");
    expect(normalizeTransferStatus("otp")).toBe("otp");
    expect(normalizeTransferStatus("failed")).toBe("failed");
    expect(normalizeTransferStatus("reversed")).toBe("reversed");
    expect(normalizeTransferStatus("abandoned")).toBe("abandoned");
    expect(normalizeTransferStatus("pending")).toBe("pending");
  });

  it("normalises case and padding", () => {
    expect(normalizeTransferStatus(" SUCCESS ")).toBe("success");
    expect(normalizeTransferStatus("Otp")).toBe("otp");
  });

  it("treats unknown in-flight states as pending", () => {
    expect(normalizeTransferStatus("queued")).toBe("pending");
    expect(normalizeTransferStatus("receiving")).toBe("pending");
    expect(normalizeTransferStatus("")).toBe("pending");
  });

  it("never reports an unrecognised status as settled", () => {
    for (const status of ["successful", "succeeded", "done", "complete", "SUCCESSFUL"]) {
      const normalized = normalizeTransferStatus(status);
      expect(normalized).not.toBe("success");
      expect(payoutIsSettled(normalized)).toBe(false);
    }
  });
});

describe("payoutIsSettled", () => {
  it("is only true once the money has moved", () => {
    expect(payoutIsSettled("success")).toBe(true);
    expect(payoutIsSettled("pending")).toBe(false);
    expect(payoutIsSettled("otp")).toBe(false);
    expect(payoutIsSettled("failed")).toBe(false);
    expect(payoutIsSettled(null)).toBe(false);
  });
});

describe("payoutWasReturned", () => {
  it("covers every state that puts the milestone back to payable", () => {
    expect(payoutWasReturned("failed")).toBe(true);
    expect(payoutWasReturned("reversed")).toBe(true);
    expect(payoutWasReturned("abandoned")).toBe(true);
  });

  it("does not treat in-flight or settled payouts as returned", () => {
    expect(payoutWasReturned("success")).toBe(false);
    expect(payoutWasReturned("pending")).toBe(false);
    expect(payoutWasReturned("otp")).toBe(false);
    expect(payoutWasReturned(null)).toBe(false);
  });
});
