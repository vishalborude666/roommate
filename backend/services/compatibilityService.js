import CompatibilityScore from "../models/CompatibilityScore.js";

const CLAUDE_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";

/**
 * Builds the LLM prompt exactly per the brief's guidance:
 * "Given this room listing: <listing> and this tenant profile: <profile>,
 *  compute a compatibility score from 0 to 100 based on budget and location match.
 *  Return JSON: { score: number, explanation: string }"
 */
function buildPrompt(listing, profile) {
  const listingSummary = {
    title: listing.title,
    location: listing.location,
    rent: listing.rent,
    availableFrom: listing.availableFrom,
    roomType: listing.roomType,
    furnishing: listing.furnishing,
  };

  const profileSummary = {
    preferredLocations: profile.preferredLocations,
    budgetMin: profile.budgetMin,
    budgetMax: profile.budgetMax,
    moveInDate: profile.moveInDate,
    roomTypePreference: profile.roomTypePreference,
    lifestyle: profile.lifestyle,
  };

  return `Given this room listing: ${JSON.stringify(listingSummary)} and this tenant profile: ${JSON.stringify(
    profileSummary
  )}, compute a compatibility score from 0 to 100 based on budget and location match (also factor in room type and move-in date proximity if relevant). Return ONLY valid JSON with no markdown formatting, no code fences, and no preamble, in exactly this shape: { "score": number, "explanation": string }. The explanation should be one or two sentences.`;
}

/**
 * Rule-based fallback used when the LLM is unavailable or returns an
 * unparseable response. Weighted: budget overlap (60%), location match (30%),
 * room-type match (10%).
 */
function ruleBasedScore(listing, profile) {
  let score = 0;
  const reasons = [];

  // Budget overlap (60 points max)
  if (listing.rent >= profile.budgetMin && listing.rent <= profile.budgetMax) {
    score += 60;
    reasons.push("rent fits comfortably within the tenant's budget");
  } else {
    const nearestBound = listing.rent < profile.budgetMin ? profile.budgetMin : profile.budgetMax;
    const diff = Math.abs(listing.rent - nearestBound);
    const tolerance = nearestBound * 0.2; // 20% tolerance band
    if (diff <= tolerance) {
      const partial = 60 * (1 - diff / tolerance);
      score += Math.max(partial, 0);
      reasons.push("rent is close to the tenant's budget range");
    } else {
      reasons.push("rent is significantly outside the tenant's budget range");
    }
  }

  // Location match (30 points max)
  const listingLoc = listing.location.toLowerCase();
  const locMatch = (profile.preferredLocations || []).some(
    (loc) => listingLoc.includes(loc.toLowerCase()) || loc.toLowerCase().includes(listingLoc)
  );
  if (locMatch) {
    score += 30;
    reasons.push("location matches one of the tenant's preferred areas");
  } else {
    reasons.push("location is not among the tenant's stated preferences");
  }

  // Room type (10 points max)
  if (profile.roomTypePreference === "any" || profile.roomTypePreference === listing.roomType) {
    score += 10;
    reasons.push("room type matches preference");
  }

  score = Math.round(Math.min(Math.max(score, 0), 100));
  const explanation = `Rule-based estimate: ${reasons.join("; ")}.`;
  return { score, explanation };
}

async function callClaude(prompt) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(CLAUDE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Claude API responded with status ${response.status}`);
    }

    const data = await response.json();
    const textBlock = data.content?.find((c) => c.type === "text");
    if (!textBlock) throw new Error("No text content in Claude response");

    const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (
      typeof parsed.score !== "number" ||
      parsed.score < 0 ||
      parsed.score > 100 ||
      typeof parsed.explanation !== "string"
    ) {
      throw new Error("Malformed score payload from LLM");
    }

    return { score: Math.round(parsed.score), explanation: parsed.explanation };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Gets (or computes+caches) the compatibility score for a tenant-listing pair.
 * Score is stored in DB and only recomputed if forceRefresh is true
 * (e.g. tenant profile or listing was edited).
 */
export async function getOrCreateCompatibilityScore(tenantId, profile, listing, { forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const existing = await CompatibilityScore.findOne({ tenant: tenantId, listing: listing._id });
    if (existing) return existing;
  }

  const prompt = buildPrompt(listing, profile);
  let result;
  let source;

  try {
    result = await callClaude(prompt);
    source = "llm";
  } catch (err) {
    console.warn(`LLM compatibility scoring failed (${err.message}); falling back to rule-based scoring.`);
    result = ruleBasedScore(listing, profile);
    source = "rule-based";
  }

  const saved = await CompatibilityScore.findOneAndUpdate(
    { tenant: tenantId, listing: listing._id },
    { tenant: tenantId, listing: listing._id, score: result.score, explanation: result.explanation, source },
    { upsert: true, new: true }
  );

  return saved;
}

export { ruleBasedScore, buildPrompt };
