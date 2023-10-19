export const jsonHelper = {
  parseOrDefault: function <T>(jsonString: string | undefined, defaultResult: T) {
    if (jsonString === undefined) {
      return defaultResult;
    }
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      return defaultResult;
    }
  },
};
