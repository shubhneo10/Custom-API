import { NextResponse } from "next/server";

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DAYS_PER_YEAR = 365.25;

function getUtilizationPoints(utilizationPct: number): number {
  if (utilizationPct <= 30) return 40;
  if (utilizationPct <= 50) return 30;
  if (utilizationPct <= 70) return 20;
  if (utilizationPct <= 90) return 10;
  return 0;
}

function getTenurePoints(tenureYears: number): number {
  if (tenureYears >= 5) return 35;
  if (tenureYears >= 3) return 28;
  if (tenureYears >= 1) return 21;
  return 10;
}

function getDisputePoints(disputeCount: number): number {
  return Math.max(0, 25 - disputeCount * 10);
}

function getBand(score: number): string {
  if (score >= 75) return "Strong";
  if (score >= 50) return "Medium";
  return "Low";
}

export async function POST(request: Request) {
  const body = await request.json();
  const { current_balance, credit_limit, account_opened, dispute_count } = body;

  if (
    typeof current_balance !== "number" ||
    typeof credit_limit !== "number" ||
    typeof dispute_count !== "number" ||
    typeof account_opened !== "string"
  ) {
    return NextResponse.json(
      {
        error:
          "current_balance, credit_limit, dispute_count must be numbers and account_opened must be a date string (YYYY-MM-DD)",
      },
      { status: 400 }
    );
  }

  if (credit_limit <= 0) {
    return NextResponse.json(
      { error: "credit_limit must be greater than 0" },
      { status: 400 }
    );
  }

  if (dispute_count < 0) {
    return NextResponse.json(
      { error: "dispute_count cannot be negative" },
      { status: 400 }
    );
  }

  const accountOpenedDate = new Date(account_opened);
  if (Number.isNaN(accountOpenedDate.getTime())) {
    return NextResponse.json(
      { error: "account_opened is not a valid date" },
      { status: 400 }
    );
  }

  const asOf = new Date();

  const utilizationPct = (current_balance / credit_limit) * 100;
  const tenureYears =
    (asOf.getTime() - accountOpenedDate.getTime()) / MS_PER_DAY / DAYS_PER_YEAR;

  const utilizationPoints = getUtilizationPoints(utilizationPct);
  const tenurePoints = getTenurePoints(tenureYears);
  const disputePoints = getDisputePoints(dispute_count);

  const score = utilizationPoints + tenurePoints + disputePoints;
  const band = getBand(score);

  return NextResponse.json({ score, band });
}
