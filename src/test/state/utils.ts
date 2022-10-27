type APIActionStatus = "fulfilled" | "pending" | "rejected";
type APIActionMethod = "query" | "mutation";
export function createMockAPIAction<T, R>(endpointName: string, method: APIActionMethod, status: APIActionStatus, payload: T, originalArgs: R) {
    return {
        payload,
        type: `isaacApi/execute${method === "query" ? "Query" : "Mutation"}/${status}`,
        meta: {
            arg: {
                type: method,
                originalArgs,
                endpointName,

                // Query specific
                queryCacheKey: `${endpointName}(${JSON.stringify(originalArgs)})`,
                subscribe: false,
                forceRefetch: false,
                subscriptionOptions: {},

                // Mutation specific
                track: false,
                fixedCacheKey: `${endpointName}(${JSON.stringify(originalArgs)})`,
            },
            requestId: `${endpointName}-dummy-request-id`,
            requestStatus: status,
            fulfilledTimeStamp: Date.now(),
            baseQueryMeta: {},
        }
    }
}