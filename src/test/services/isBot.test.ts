import { isBot } from "../../app/components/navigation/TrackedRoute";

describe("isBot", () => {
  it("should return true for a valid Googlebot user agent", () => {
    const validGoogleBotUserAgent = "compatible; Googlebot/2.1; +http://www.google.com/bot.html";
    expect(isBot(validGoogleBotUserAgent)).toBe(true);
  });

  it("should return true for a valid Bingbot user agent", () => {
    const validBingBotUserAgent = "compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm";
    expect(isBot(validBingBotUserAgent)).toBe(true);
  });

  it("should return false for an invalid user agent", () => {
    const invalidUserAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3";
    expect(isBot(invalidUserAgent)).toBe(false);
  });

  it("should return false for undefined user agent", () => {
    expect(isBot()).toBe(false);
  });
});
