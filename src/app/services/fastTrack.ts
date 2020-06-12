export function makeUrl(url: string, queryParams?: { [p: string]: string | undefined }) {
    function valueIsNotUndefined(v: [string, string | undefined]): v is [string, string] {
        return v[1] !== undefined;
    }

    const query = queryParams ? "?" + Object.entries(queryParams)
        .filter(valueIsNotUndefined)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&") : "";
    return url + query;
}
