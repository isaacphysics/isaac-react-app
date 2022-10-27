import {rest} from "msw";
import {
    mockAssignmentsGroup2,
    mockAssignmentsGroup6, mockFragment,
    mockGameboards,
    mockGroups,
    mockMyAssignments,
    mockNewsPods,
    mockQuizAssignments,
    mockSetAssignments,
    mockUser,
    mockUserAuthSettings,
    mockUserPreferences
} from "./data";
import {API_PATH} from "../app/services";
import produce from "immer";

export const handlers = [
    rest.get(API_PATH + "/gameboards/user_gameboards", (req, res, ctx) => {
        const startIndexStr = req.url.searchParams.get("start_index");
        const startIndex = (startIndexStr && parseInt(startIndexStr)) || 0;
        const limitStr = req.url.searchParams.get("limit");
        const limit = (limitStr && parseInt(limitStr)) || mockGameboards.totalResults;

        const limitedGameboards = produce(mockGameboards, g => {
            if (startIndex === 0 && limitStr === "ALL") return g;
            g.results = g.results.slice(startIndex, Math.min(startIndex + limit, mockGameboards.totalResults));
            g.totalNotStarted = g.results.length;
            g.totalResults = g.results.length;
        });

        return res(
            ctx.status(200),
            ctx.json(limitedGameboards)
        )
    }),
    rest.get(API_PATH + "/groups", (req, res, ctx) => {
        const archived = req.url.searchParams.get("archived_groups_only") === "true";
        const groups = mockGroups.filter(g => g.archived === archived);
        return res(
            ctx.status(200),
            ctx.json(groups)
        );
    }),
    rest.get(API_PATH + "/groups/:groupId/membership", (req, res, ctx) => {
        // TODO could get members from mock data if groupId refers to a known mock group
        return res(
            ctx.status(200),
            ctx.json([])
        );
    }),
    rest.get(API_PATH + "/assignments", (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(mockMyAssignments)
        );
    }),
    rest.get(API_PATH + "/quiz/assignments", (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(mockQuizAssignments)
        );
    }),
    rest.get(API_PATH + "/assignments/assign/:assignmentId", (req, res, ctx) => {
        const {assignmentId: _assignmentId} = req.params;
        const assignmentId = parseInt(_assignmentId as string);
        // FIXME augment the returned assignment like in the API
        const assignments = mockSetAssignments.filter(a => a.id === assignmentId);
        if (assignments.length === 1) {
            return res(ctx.json(assignments[0]));
        }
        return res(
            ctx.status(404),
            ctx.json({error: `Assignment with id ${_assignmentId} not found.`})  // FIXME this is probably the wrong format for errors
        );
    }),
    rest.get(API_PATH + "/assignments/assign", (req, res, ctx) => {
        const groupIdStr = req.url.searchParams.get("group");
        const groupId = groupIdStr && parseInt(groupIdStr) || undefined;

        let setAssignments;
        switch (groupId) {
            case 2:
                setAssignments = mockAssignmentsGroup2;
                break;
            case 6:
                setAssignments = mockAssignmentsGroup6;
                break;
            default:
                setAssignments = mockSetAssignments;
        }
        return res(
            ctx.status(200),
            ctx.json(setAssignments)
        );
    }),
    rest.get(API_PATH + "/users/current_user", (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(mockUser)
        );
    }),
    rest.post(API_PATH + "/auth/logout", (req, res, ctx) => {
        return res(ctx.status(200));
    }),
    rest.get(API_PATH + "/users/user_preferences", (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(mockUserPreferences)
        );
    }),
    rest.get(API_PATH + "/users/current_user/snapshot", (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                dailyStreakRecord: {currentStreak: 0, largestStreak: 0, currentActivity: 0},
                weeklyStreakRecord: {currentStreak: 0, currentActivity: 0, largestWeeklyStreak: 0}
            })
        );
    }),
    rest.get(API_PATH + "/auth/user_authentication_settings", (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(mockUserAuthSettings)
        );
    }),
    rest.get(API_PATH + "/info/segue_environment", (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({segueEnvironment: "DEV"})
        );
    }),
    rest.get(API_PATH + "/notifications", (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json([])
        );
    }),
    rest.get(API_PATH + "/pages/pods/:tag", (req, res, ctx) => {
        const {tag} = req.params;
        const podsFilteredByTag = produce(mockNewsPods, pods => {
            pods.results = pods.results.filter(p => p.tags.includes(tag as string))
            pods.totalResults = pods.results.length;
        });
        return res(
            ctx.status(200),
            ctx.json(podsFilteredByTag)
        );
    }),
    rest.get(API_PATH + "/pages/fragments/:fragmentId", (req, res, ctx) => {
        const {fragmentId} = req.params;
        return res(
            ctx.status(200),
            ctx.json(mockFragment(fragmentId as string))
        );
    }),
    rest.get(API_PATH + "/glossary/terms", (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                results: [],
                totalResults: 0
            })
        );
    }),
    rest.post(API_PATH + "/log", async (req, res, ctx) => {
        const json = await req.json();
        console.info("Log event: ", json);
        return res(
            ctx.status(200)
        );
    }),
    rest.get(API_PATH + "/user-alerts", (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({})
        );
    }),
    rest.get(API_PATH + "/events", (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({results: [], totalResults: 0})
        );
    })
];
