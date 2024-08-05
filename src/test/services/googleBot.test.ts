import { isGoogleBot } from "../../app/components/navigation/TrackedRoute";

describe("isGoogleBot", () => {
  it("should return true for a valid Googlebot user agent", () => {
    const validUserAgent = "compatible; Googlebot/2.1; +http://www.google.com/bot.html";
    expect(isGoogleBot(validUserAgent)).toBe(true);
  });

  it("should return false for an invalid user agent", () => {
    const invalidUserAgent = "Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bot.html)";
    expect(isGoogleBot(invalidUserAgent)).toBe(false);
  });

  it("should return false for undefined user agent", () => {
    expect(isGoogleBot()).toBe(false);
  });
});
