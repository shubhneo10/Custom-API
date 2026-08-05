import { NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";

const logger = createLogger("credit-score");

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
  logger.info("request received");

  const body = await request.json();
  logger.info("parsed request body", body);

  const { current_balance, credit_limit, account_opened, dispute_count } = body;
  logger.info("destructured inputs", {
    current_balance,
    credit_limit,
    account_opened,
    dispute_count,
  });

  if (
    typeof current_balance !== "number" ||
    typeof credit_limit !== "number" ||
    typeof dispute_count !== "number" ||
    typeof account_opened !== "string"
  ) {
    logger.warn("validation failed: incorrect input types", body);
    return NextResponse.json(
      {
        error:
          "current_balance, credit_limit, dispute_count must be numbers and account_opened must be a date string (YYYY-MM-DD)",
      },
      { status: 400 }
    );
  }
  logger.info("input types valid");

  if (credit_limit <= 0) {
    logger.warn("validation failed: credit_limit <= 0", { credit_limit });
    return NextResponse.json(
      { error: "credit_limit must be greater than 0" },
      { status: 400 }
    );
  }
  logger.info("credit_limit valid", { credit_limit });

  if (dispute_count < 0) {
    logger.warn("validation failed: dispute_count < 0", { dispute_count });
    return NextResponse.json(
      { error: "dispute_count cannot be negative" },
      { status: 400 }
    );
  }
  logger.info("dispute_count valid", { dispute_count });

  const accountOpenedDate = new Date(account_opened);
  if (Number.isNaN(accountOpenedDate.getTime())) {
    logger.warn("validation failed: invalid account_opened date", { account_opened });
    return NextResponse.json(
      { error: "account_opened is not a valid date" },
      { status: 400 }
    );
  }
  logger.info("account_opened parsed", { accountOpenedDate: accountOpenedDate.toISOString() });

  const asOf = new Date();
  logger.info("as_of date (today)", { asOf: asOf.toISOString() });

  const utilizationPct = (current_balance / credit_limit) * 100;
  logger.info("utilization_pct calculated", { utilizationPct });

  const tenureYears =
    (asOf.getTime() - accountOpenedDate.getTime()) / MS_PER_DAY / DAYS_PER_YEAR;
  logger.info("tenure_years calculated", { tenureYears });

  const utilizationPoints = getUtilizationPoints(utilizationPct);
  logger.info("utilization_points calculated", { utilizationPoints });

  const tenurePoints = getTenurePoints(tenureYears);
  logger.info("tenure_points calculated", { tenurePoints });

  const disputePoints = getDisputePoints(dispute_count);
  logger.info("dispute_points calculated", { disputePoints });

  const score = utilizationPoints + tenurePoints + disputePoints;
  logger.info("final score calculated", { score });

  const band = getBand(score);
  logger.info("final band determined", { band });

  const response = { score, band };
  logger.info("sending response", response);

  return NextResponse.json(response);
}
