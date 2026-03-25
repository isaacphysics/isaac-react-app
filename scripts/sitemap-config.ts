/**
 * Sitemap Configuration
 *
 * Defines static routes, topic IDs, and sitemap generation settings
 *
 * Environment variable:
 *   ISAAC_ENV      - "production" | "staging" | "local" (default: "local")
 *                    Mirrors the envSpecific() pattern from src/app/services/constants.ts
 *                    but uses a Node-compatible env var instead of document.location.
 *
 * Override individual URLs if needed:
 *   SITE_URL       - overrides the site URL derived from ISAAC_ENV
 *   API_URL        - overrides the API URL derived from ISAAC_ENV
 *   SITEMAP_OUTPUT - output path (default: public/sitemap.xml)
 */

// Mirrors STAGING_URL from src/app/services/constants.ts
const PROD_SITE_URL = "https://isaaccomputerscience.org";
const STAGING_SITE_URL = "https://www.staging.development.isaaccomputerscience.org";

type IsaacEnv = "production" | "staging" | "local";

function detectEnv(): IsaacEnv {
  const env = process.env.ISAAC_ENV;
  if (env === "production") return "production";
  if (env === "staging") return "staging";
  return "local";
}

// Node-compatible equivalent of envSpecific(live, staging, dev) from constants.ts
function envSpecific<L, S, D>(live: L, staging: S, dev: D): L | S | D {
  const env = detectEnv();
  if (env === "staging") return staging;
  if (env === "production") return live;
  return dev;
}

const resolvedSiteUrl =
  process.env.SITE_URL ??
  envSpecific(PROD_SITE_URL, STAGING_SITE_URL, PROD_SITE_URL);

const resolvedApiUrl =
  process.env.API_URL ??
  envSpecific(
    `${PROD_SITE_URL}/api/any/api`,
    `${STAGING_SITE_URL}/api/any/api`,
    "http://localhost:8080/isaac-api/api",
  );

export type ChangeFreq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

export interface SitemapRoute {
  path: string;
  priority: number;
  changefreq: ChangeFreq;
}

export interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq: ChangeFreq;
  priority: number;
}

/**
 * Static routes to include in the sitemap (hardcoded).
 *
 */
export const STATIC_ROUTES: SitemapRoute[] = [
  // Homepage
  { path: "/", priority: 1, changefreq: "daily" },

  // Topic index pages
  { path: "/topics", priority: 0.9, changefreq: "weekly" },
  { path: "/topics/gcse", priority: 0.9, changefreq: "weekly" },
  { path: "/topics/a_level", priority: 0.9, changefreq: "weekly" },

  // Events listing page (individual event pages are excluded — see generate-sitemap.ts)
  { path: "/events", priority: 0.8, changefreq: "daily" },

  // Glossary
  { path: "/glossary", priority: 0.7, changefreq: "monthly" },

  // Student and teacher info pages
  { path: "/students", priority: 0.7, changefreq: "monthly" },
  { path: "/teachers", priority: 0.7, changefreq: "monthly" },

  // Competition page
  { path: "/national-computer-science-competition", priority: 0.7, changefreq: "weekly" },

  // Careers
  { path: "/careers_in_computer_science", priority: 0.6, changefreq: "monthly" },

  // Contact and support
  { path: "/contact", priority: 0.6, changefreq: "monthly" },
  { path: "/support", priority: 0.5, changefreq: "monthly" },

  // Static info pages
  { path: "/about", priority: 0.5, changefreq: "monthly" },
  { path: "/privacy", priority: 0.4, changefreq: "yearly" },
  { path: "/terms", priority: 0.4, changefreq: "yearly" },
  { path: "/cookies", priority: 0.4, changefreq: "yearly" },
  { path: "/accessibility", priority: 0.4, changefreq: "yearly" },
  { path: "/safeguarding", priority: 0.4, changefreq: "yearly" },
  { path: "/teachcomputing", priority: 0.5, changefreq: "monthly" },
  { path: "/gcse_programming_challenges", priority: 0.5, changefreq: "monthly" },

  // Additional pages (added per ticket requirements)
  { path: "/pages/computer_science_journeys_gallery", priority: 0.8, changefreq: "monthly" },
  { path: "/booster_video_binary_conversion_and_addition", priority: 0.8, changefreq: "monthly" },
  { path: "/gcse_teaching_order", priority: 0.8, changefreq: "monthly" },
  { path: "/teaching_order", priority: 0.8, changefreq: "monthly" },
  { path: "/teacher_gcse_revision_page", priority: 0.8, changefreq: "monthly" },
  { path: "/pages/top-tips-alevel", priority: 0.8, changefreq: "monthly" },
  { path: "/pages/hints-and-tips-teaching-gcse", priority: 0.8, changefreq: "monthly" },
  { path: "/pages/tips-for-your-alevel-students", priority: 0.8, changefreq: "monthly" },
  { path: "/pages/questionfinder", priority: 0.8, changefreq: "monthly" },
  { path: "/pages/gcse-events-feb24", priority: 0.8, changefreq: "monthly" },
  { path: "/pages/gameboard-tutorial", priority: 0.8, changefreq: "monthly" },

  // News / announcement pages (also fetched dynamically via news pods — deduplication handles overlaps)
  { path: "/pages/2025_10_competition_last_year", priority: 0.5, changefreq: "monthly" },
  { path: "/pages/2025_08_exam_results", priority: 0.5, changefreq: "monthly" },
];

/**
 * Topic IDs from TAG_ID enum in constants.ts
 * These map to /topics/:topicName routes
 */
export const TOPIC_IDS: string[] = [
  // Computer networks & systems
  "networking",
  "network_hardware",
  "communication",
  "the_internet",
  "web_technologies",

  "boolean_logic",
  "architecture",
  "memory_and_storage",
  "hardware",
  "software",
  "operating_systems",
  "translators",
  "programming_languages",

  // Cyber security
  "security",
  "social_engineering",
  "malicious_code",

  // Data and information
  "number_representation",
  "text_representation",
  "image_representation",
  "sound_representation",
  "compression",
  "encryption",
  "databases",
  "file_organisation",
  "sql",
  "big_data",

  // Data structures & algorithms
  "searching",
  "sorting",
  "pathfinding",
  "complexity",
  "data_structures",

  // Impacts of digital technology
  "legislation",
  "impacts_of_tech",

  // Math
  "number_systems",
  "functions",

  // Programming fundamentals & paradigms
  "programming_concepts",
  "subroutines",
  "files",
  "recursion",
  "string_handling",
  "ide",

  "object_oriented_programming",
  "functional_programming",
  "event_driven_programming",
  "procedural_programming",

  // Software engineering
  "software_engineering_principles",
  "program_design",
  "testing",
  "software_project",

  // Theory of computation
  "computational_thinking",
  "models_of_computation",
];

/**
 * Hidden topics that should NOT be included in the sitemap.
 * These are marked as hidden: true in tagsCS.ts
 */
export const HIDDEN_TOPICS: string[] = [
  "machine_learning_ai",
  "graphs_for_ai",
  "neural_networks",
  "machine_learning",
  "regression",
  "declarative_programming",
];

/**
 * Content IDs to explicitly exclude from the sitemap.
 * Used to strip test/QA pages that appear in the API but have no SEO value.
 */
export const EXCLUDED_IDS: string[] = [
  // Test concept pages
  "isaac-callout-test-page",
  "audience_test",

  // Test question pages
  "_regression_test_",
  "class_test_jan20_aqa",
  "class_test_jan20_ocr",
  "class_test_nov19_aqa",
  "class_test_nov19_ocr",
];

export const CONTENT_PRIORITIES = {
  topic: { priority: 0.8, changefreq: "weekly" as ChangeFreq },
  concept: { priority: 0.7, changefreq: "monthly" as ChangeFreq },
  question: { priority: 0.7, changefreq: "monthly" as ChangeFreq },
  event: { priority: 0.6, changefreq: "weekly" as ChangeFreq },
  page: { priority: 0.5, changefreq: "monthly" as ChangeFreq },
};


export const API_CONFIG = {
  baseUrl: resolvedApiUrl,
  siteUrl: resolvedSiteUrl,
  timeout: 30000, // Request timeout in milliseconds
  maxRetries: 3, // Max retries for failed requests
  pageLimit: 9999, // Pagination limit for API requests
};

/**
 * Output configuration
 */
export const OUTPUT_CONFIG = {
  // Output path relative to project root
  outputPath: process.env.SITEMAP_OUTPUT || "public/sitemap.xml",
};
