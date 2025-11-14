import {createApi} from "@reduxjs/toolkit/query/react";
import {
    isaacBaseQuery,
} from "../../index";

// The API slice defines reducers and middleware that need adding to \state\reducers\index.ts
// and \state\store.ts respectively
const isaacApi = createApi({
    tagTypes: ["ContentErrors", "GlossaryTerms", "Gameboard", "AllSetTests", "GroupTests", "AllGameboards", "AllMyAssignments", "SetAssignment", "AllSetAssignments", "GroupAssignments", "AssignmentProgress", "Groups", "GroupMemberships", "MyGroupMemberships", "MisuseStatistics"],
    reducerPath: "isaacApi",
    baseQuery: isaacBaseQuery,
    keepUnusedDataFor: 0,
    endpoints: () => ({
        // Endpoints are injected in other files, e.g. contentApi.ts
    })
});

export {isaacApi};
