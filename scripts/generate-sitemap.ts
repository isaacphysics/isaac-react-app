#!/usr/bin/env ts-node
/**
 * Sitemap Generator
 *
 * Generates an XML sitemap by:
 * 1. Including static routes from configuration
 * 2. Fetching dynamic content (concepts, questions, events) from the API
 * 3. Generating topic URLs from the topic ID list - needed?
 *
 * Usage:
 *   npm run generate-sitemap
 *
 * Environment variables:
 *   API_URL - API base URL (default: http://localhost:8080/isaac-api/api)
 *   SITE_URL - Site base URL for sitemap (default: https://isaaccomputerscience.org)
 *   SITEMAP_OUTPUT - Output file path (default: public/sitemap.xml)
 * 
 */

import axios, { AxiosInstance } from "axios";
import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";

// Resolve git to its absolute path via /usr/bin/which so we never rely on PATH
const GIT_BIN = execFileSync("/usr/bin/which", ["git"], { encoding: "utf-8" }).trim();
import {
  STATIC_ROUTES,
  TOPIC_IDS,
  HIDDEN_TOPICS,
  EXCLUDED_IDS,
  CONTENT_PRIORITIES,
  API_CONFIG,
  OUTPUT_CONFIG,
  SitemapURL,
} from "./sitemap-config";

// ---------------------------------------------------------------------------
// Content dates — populated by scripts/index-content-dates.ts from the
// content repo's git history. Maps content ID → YYYY-MM-DD of last commit.
// <lastMod> omitted if not generated.
// ---------------------------------------------------------------------------
const CONTENT_DATES_PATH = path.resolve(__dirname, "content-dates.json");
let contentDates: Record<string, string> = {};
if (fs.existsSync(CONTENT_DATES_PATH)) {
  contentDates = JSON.parse(fs.readFileSync(CONTENT_DATES_PATH, "utf-8"));
  console.log(`Loaded content dates for ${Object.keys(contentDates).length} items (${CONTENT_DATES_PATH})`);
} else {
  console.log("No content-dates.json found — lastmod will be omitted for dynamic content");
}

/**
 * Get the date of the last git commit that touched scripts/sitemap-config.ts.
 */
function getConfigFileDate(): string | undefined {
  try {
    const iso = execFileSync(
      GIT_BIN, ["log", "--format=%aI", "-1", "--", "scripts/sitemap-config.ts"],
      { encoding: "utf-8", stdio: ["pipe", "pipe", "ignore"] }
    ).trim();
    return iso ? iso.split("T")[0] : undefined;
  } catch {
    return undefined;
  }
}

interface ContentSummary {
  id?: string;
  title?: string;
  type?: string;
  published?: boolean;
  tags?: string[];
}

interface ResultsWrapper<T> {
  results: T[];
  totalResults: number;
}

interface NewsPod {
  id?: string;
  url?: string;
}

const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
  headers: {
    Accept: "application/json",
  },
});

/**
 * Escape XML special characters (refactor if needed)
 * 
 */
function escapeXml(str: string): string {
  return str
    .replaceAll('&', "&amp;")
    .replaceAll('<', "&lt;")
    .replaceAll('>', "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll('\'', "&apos;");
}

/**
 * Retry wrapper for API calls
 * Not exepected to fail but solves a headache :)
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = API_CONFIG.maxRetries,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.log(`  Retrying... (${retries} attempts remaining)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * STATIC ROUTES
 * 
 */
function getStaticUrls(): SitemapURL[] {
  const lastmod = getConfigFileDate();

  return STATIC_ROUTES.map((route) => ({
    loc: `${API_CONFIG.siteUrl}${route.path}`,
    lastmod,
    changefreq: route.changefreq,
    priority: route.priority,
  }));
}

/**
 * TOPIC PAGES
 * 
 */
function getTopicUrls(): SitemapURL[] {
  const { priority, changefreq } = CONTENT_PRIORITIES.topic;

  // Filter out hidden topics
  const visibleTopics = TOPIC_IDS.filter((topicId) => !HIDDEN_TOPICS.includes(topicId));

  return visibleTopics.map((topicId) => ({
    loc: `${API_CONFIG.siteUrl}/topics/${topicId}`,
    lastmod: contentDates[topicId], // git date from content repo, or undefined
    changefreq,
    priority,
  }));
}

/**
 * CONCEPTS
 * 
 */
async function getConceptUrls(): Promise<SitemapURL[]> {
  console.log("Fetching concepts...");

  try {
    const response = await withRetry(() =>
      api.get<ResultsWrapper<ContentSummary>>("/pages/concepts", {
        params: { limit: API_CONFIG.pageLimit },
      })
    );

    const concepts = response.data.results || [];
    console.log(`  Found ${concepts.length} concepts`);

    const { priority, changefreq } = CONTENT_PRIORITIES.concept;

    return concepts
      .filter((concept) => concept.id && concept.published !== false && !EXCLUDED_IDS.includes(concept.id))
      .map((concept) => ({
        loc: `${API_CONFIG.siteUrl}/concepts/${concept.id}`,
        lastmod: contentDates[concept.id!], // git date from content repo, or undefined
        changefreq,
        priority,
      }));
  } catch (error) {
    console.error("  Error fetching concepts:", (error as Error).message);
    return [];
  }
}

/**
 * QUESTIONS
 * 
 */
async function getQuestionUrls(): Promise<SitemapURL[]> {
  console.log("Fetching questions...");

  try {
    const response = await withRetry(() =>
      api.get<ResultsWrapper<ContentSummary>>("/pages/questions/", {
        params: { limit: API_CONFIG.pageLimit },
      })
    );

    const questions = response.data.results || [];
    console.log(`  Found ${questions.length} questions`);

    const { priority, changefreq } = CONTENT_PRIORITIES.question;

    return questions
      .filter((question) => question.id && question.published !== false && !EXCLUDED_IDS.includes(question.id))
      .map((question) => ({
        loc: `${API_CONFIG.siteUrl}/questions/${question.id}`,
        lastmod: contentDates[question.id!], // git date from content repo, or undefined
        changefreq,
        priority,
      }));
  } catch (error) {
    console.error("  Error fetching questions:", (error as Error).message);
    return [];
  }
}

/**
 * NEWS PAGES
 * Fetches news pods from the API and extracts their target URLs.
 * Individual event pages are intentionally excluded.
 */
async function getNewsPageUrls(): Promise<SitemapURL[]> {
  console.log("Fetching news pages...");

  try {
    const response = await withRetry(() =>
      api.get<{ results: NewsPod[]; totalResults: number }>("/pages/pods/news", {
        params: { limit: API_CONFIG.pageLimit },
      })
    );

    const pods = response.data.results || [];
    console.log(`  Found ${pods.length} news pods`);

    const { priority, changefreq } = CONTENT_PRIORITIES.page;

    return pods
      .filter((pod) => pod.url?.startsWith("/"))
      .map((pod) => {
        // Extract the page ID from the URL path (e.g. "/pages/2025_08_exam_results" → "2025_08_exam_results")
        const pageId = pod.url!.split("/").pop();
        return {
          loc: `${API_CONFIG.siteUrl}${pod.url}`,
          lastmod: pageId ? contentDates[pageId] : undefined,
          changefreq,
          priority,
        };
      });
  } catch (error) {
    console.error("  Error fetching news pages:", (error as Error).message);
    return [];
  }
}

/**
 * Generate XML sitemap from URL list
 */
function generateXml(urls: SitemapURL[]): string {
  const urlEntries = urls
    .map((url) => {
      const lastmod = url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : "";
      return `  <url>
    <loc>${escapeXml(url.loc)}</loc>${lastmod}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority.toFixed(1)}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;
}

/**
 * Remove duplicate URLs (keep highest priority)
 */
function deduplicateUrls(urls: SitemapURL[]): SitemapURL[] {
  const urlMap = new Map<string, SitemapURL>();

  for (const url of urls) {
    const existing = urlMap.get(url.loc);
    if (!existing || url.priority > existing.priority) {
      urlMap.set(url.loc, url);
    }
  }

  return Array.from(urlMap.values());
}

/**
 * Sort URLs by priority (descending) then alphabetically
 * 
 */
function sortUrls(urls: SitemapURL[]): SitemapURL[] {
  return urls.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return a.loc.localeCompare(b.loc);
  });
}

/**
 * GENERATE SITEMAP
 * 
 */
async function generateSitemap(): Promise<void> {
  console.log("=== Isaac Computer Science Sitemap Generator ===\n");
  console.log(`API URL: ${API_CONFIG.baseUrl}`);
  console.log(`Site URL: ${API_CONFIG.siteUrl}`);
  console.log(`Output: ${OUTPUT_CONFIG.outputPath}\n`);

  const allUrls: SitemapURL[] = [];

  // Add STATIC
  console.log("Adding static routes...");
  const staticUrls = getStaticUrls();
  console.log(`  Added ${staticUrls.length} static URLs`);
  allUrls.push(...staticUrls);

  // Add TOPICS
  console.log("Adding topic URLs...");
  const topicUrls = getTopicUrls();
  console.log(`  Added ${topicUrls.length} topic URLs`);
  allUrls.push(...topicUrls);

  // Add DYNAMIC
  const conceptUrls = await getConceptUrls();
  allUrls.push(...conceptUrls);

  const questionUrls = await getQuestionUrls();
  allUrls.push(...questionUrls);

  // Individual event pages are excluded pending a separate un-indexing piece of work
  const newsPageUrls = await getNewsPageUrls();
  allUrls.push(...newsPageUrls);

  // Deduplicate and sort
  console.log("\nProcessing URLs...");
  const uniqueUrls = deduplicateUrls(allUrls);
  const sortedUrls = sortUrls(uniqueUrls);
  console.log(`  Total unique URLs: ${sortedUrls.length}`);

  // Generate XML
  console.log("\nGenerating XML...");
  const xml = generateXml(sortedUrls);

  // Write to file
  const outputPath = path.resolve(process.cwd(), OUTPUT_CONFIG.outputPath);
  const outputDir = path.dirname(outputPath);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, xml, "utf-8");
  console.log(`\nSitemap written to: ${outputPath}`);
  console.log(`File size: ${(xml.length / 1024).toFixed(2)} KB`);

  // Summary
  console.log("\n=== Summary ===");
  console.log(`Static routes: ${staticUrls.length}`);
  console.log(`Topics: ${topicUrls.length}`);
  console.log(`Concepts: ${conceptUrls.length}`);
  console.log(`Questions: ${questionUrls.length}`);
  console.log(`News pages: ${newsPageUrls.length}`);
  console.log(`Total URLs: ${sortedUrls.length}`);
  console.log("\nDone!");
}

// Run the generator
generateSitemap().catch((error) => { // NOSONAR typescript:S7785 — top-level await not supported in CommonJS (ts-node)
  console.error("\nFatal error:", error.message);
  process.exit(1);
});
