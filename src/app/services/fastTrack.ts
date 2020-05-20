const fastTrackStates = ['ft_top_ten', 'ft_upper', 'ft_lower'];

export function getFastTrackLevel(tags: string[] | undefined) {
    if (!tags) return;
    for (let state of fastTrackStates) {
        if (tags.indexOf(state) != -1) {
            return state;
        }
    }
}

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
