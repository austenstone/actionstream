import { Webhooks } from "@octokit/webhooks";

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || "";

/**
 * Octokit Webhooks instance for signature verification.
 */
export const webhooks = new Webhooks({
  secret: WEBHOOK_SECRET,
});

/**
 * Verify a GitHub webhook signature.
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string
): Promise<boolean> {
  if (!WEBHOOK_SECRET) {
    console.warn("[GitHub] No webhook secret configured — skipping verification");
    return true; // Allow in dev
  }
  return webhooks.verify(payload, signature);
}
