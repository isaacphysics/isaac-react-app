import {http, HttpResponse, JsonBodyType} from "msw";
import {
    buildMockUserSummary,
    mockAssignmentsGroup2,
    mockAssignmentsGroup6, mockFragment,
    mockGroups,
    mockMyAssignments,
    mockNewsPods, buildMockPage,
    mockQuizAssignments, mockSchool,
    mockSetAssignments,
    mockUser,
    mockUserAuthSettings,
    mockUserPreferences,
    mockRegressionTestQuestions,
    mockQuestionFinderResults,
    mockConceptPage,
    mockRubrics,
    mockAttempts,
    mockPreviews,
    mockConceptsResults,
    mockProgress,
    mockLLMMarkedRegressionTestQuestion,
    mockLLMMarkedValidationResponse,
    mockSearchResults,
    mockGameboards
} from "./data";
import {API_PATH} from "../app/services";
import {produce} from "immer";
import {School} from "../IsaacAppTypes";
import { errorResponses } from "../test/test-factory";

export const handlers = [
    http.get(API_PATH + "/content/units", () => {
        return HttpResponse.json(["m", "cm", "mm"], {
            status: 200,
        });
    }),

    http.get(API_PATH + "/gameboards/user_gameboards", ({request}) => {
        const url = new URL(request.url);
        const startIndexStr = url.searchParams.get("start_index");
        const startIndex = (startIndexStr && parseInt(startIndexStr)) || 0;
        const limitStr = url.searchParams.get("limit");
        const limit = (limitStr && parseInt(limitStr)) || mockGameboards.totalResults;

        const limitedGameboards = produce(mockGameboards, g => {
            if (startIndex === 0 && limitStr === "ALL") return g;
            g.results = g.results.slice(startIndex, Math.min(startIndex + limit, mockGameboards.totalResults));
            g.totalNotStarted = g.results.length;
        });

        return HttpResponse.json(limitedGameboards, {
            status: 200,
        });
    }),
    
    http.get(API_PATH + "/groups", ({request}) => {
        const url = new URL(request.url);
        const archived = url.searchParams.get("archived_groups_only") === "true";
        const groups = mockGroups.filter(g => g.archived === archived);
        return HttpResponse.json(groups, {
            status: 200,
        });
    }),
    http.get(API_PATH + "/groups/:groupId/membership", () => {
        // TODO could get members from mock data if groupId refers to a known mock group
        return HttpResponse.json([], {
            status: 200,
        });
    }),
    http.get(API_PATH + "/assignments", () => {
        return HttpResponse.json(mockMyAssignments, {
            status: 200,
        });
    }),
    http.get(API_PATH + "/quiz/assignments", () => {
        return HttpResponse.json(mockQuizAssignments, {
            status: 200,
        });
    }),
    http.get(API_PATH + "/quiz/assigned", () => {
        return HttpResponse.json([], {
            status: 200,
        });
    }),
    http.get(API_PATH + "/quiz/:quizId/rubric", ({ params }) => {
        const quizId = params.quizId as string;
        if (quizId in mockRubrics) {
            return HttpResponse.json(mockRubrics[quizId], { status: 200 });
        }
        return HttpResponse.json(errorResponses.testUnavailable404,  { status: 404 });
    }),
    http.get(API_PATH + "/quiz/:quizId/preview", ({ params }) => {
        const quizId = params.quizId as string;
        if (quizId in mockPreviews) {
            return HttpResponse.json(mockPreviews[quizId], { status: 200 });
        }
        return HttpResponse.json(errorResponses.testUnavailable404,  { status: 404 });
    }),
    http.post(API_PATH + "/quiz/attempt/:quizId/log", () => {
        return HttpResponse.json(null, { status: 204 });
    }),
    http.post(API_PATH + "/quiz/:quizId/attempt", ({ params }) => {
        const quizId = params.quizId as string;
        if (quizId in mockAttempts) {
            return HttpResponse.json(mockAttempts[quizId], { status: 200 });
        }
        return HttpResponse.json(errorResponses.testUnavailable404,  { status: 404 });
    }),
    http.get(API_PATH + "/assignments/assign/:assignmentId", ({params}) => {
        const {assignmentId: _assignmentId} = params;
        const assignmentId = parseInt(_assignmentId as string);
        const assignments = mockSetAssignments.filter(a => a.id === assignmentId);
        if (assignments.length === 1) {
            return HttpResponse.json(assignments[0]);
        }
        // FIXME this is probably the wrong format for errors
        return HttpResponse.json({error: `Assignment with id ${_assignmentId} not found.`}, {
            status: 404,
        });
    }),
    http.get(API_PATH + "/assignments/assign/:assignmentId/progress", ({params}) => {
        const {assignmentId: _assignmentId} = params;
        const assignmentId = parseInt(_assignmentId as string);
        if (assignmentId in mockProgress) {
            return HttpResponse.json(mockProgress[assignmentId as keyof typeof mockProgress]);
        }
        return HttpResponse.json({error: `Assignment progress for assignment ${_assignmentId} not found.`}, {
            status: 404,
        });
    }),
    http.get(API_PATH + "/assignments/assign", ({request}) => {
        const url = new URL(request.url);
        const groupIdStr = url.searchParams.get("group");
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
        return HttpResponse.json(setAssignments, {
            status: 200,
        });
    }),
    http.get(API_PATH + "/users/current_user", () => {

        return HttpResponse.json(mockUser, {
            status: 200,
        });
    }),
    http.post(API_PATH + "/auth/logout", () => {
        return HttpResponse.json(null, {
            status: 200,
        });
    }),
    http.get(API_PATH + "/users/user_preferences", () => {
        return HttpResponse.json(mockUserPreferences, {
            status: 200,
        });
    }),
    http.get(API_PATH + "/users/current_user/snapshot", () => {
        return HttpResponse.json({
            dailyStreakRecord: {currentStreak: 0, largestStreak: 0, currentActivity: 0},
            weeklyStreakRecord: {currentStreak: 0, currentActivity: 0, largestWeeklyStreak: 0}
        }, {
            status: 200,
        });
    }),
    http.get(API_PATH + "/auth/user_authentication_settings", () => {
        return HttpResponse.json(mockUserAuthSettings, {
            status: 200,
        });
    }),
    http.get(API_PATH + "/info/segue_environment", () => {
        return HttpResponse.json({segueEnvironment: "DEV"}, {
            status: 200,
        });
    }),
    http.get(API_PATH + "/notifications", () => {
        return HttpResponse.json([], {
            status: 200,
        });
    }),
    http.get(API_PATH + "/pages/pods/:tag/0", ({request, params}) => {
        const {tag} = params;
        const podsFilteredByTag = produce(mockNewsPods, pods => {
            pods.results = pods.results.filter(p => p.tags.includes(tag as string));
            pods.totalResults = pods.results.length;
        });
        return HttpResponse.json(podsFilteredByTag, {
            status: 200,
        });
    }),
    http.get(API_PATH + "/pages/fragments/:fragmentId", ({params}) => {
        const {fragmentId} = params;
        return HttpResponse.json(mockFragment(fragmentId as string), {
            status: 200,
        });
    }),
    http.get(API_PATH + "/pages/questions/_regression_test_", () => {
        return HttpResponse.json(mockRegressionTestQuestions, {
            status: 200,
        });
    }),
    http.get(API_PATH + "/pages/questions/_llm_marked_regression_test_", () => {
        return HttpResponse.json(mockLLMMarkedRegressionTestQuestion, {
            status: 200,
        });
    }),
    http.get(API_PATH + "/questions/isaacLLMFreeTextQuestion/can_attempt", () => {
        return HttpResponse.json({"remainingAttempts": 30}, { 
            status: 200, 
        });
    }),
    http.post(API_PATH + "/questions/_regression_test_llm_/answer", () => {
        return HttpResponse.json(mockLLMMarkedValidationResponse, { 
            status: 200, 
        });
    }),
    http.get(API_PATH + "/pages/questions", () => {
        return HttpResponse.json(mockQuestionFinderResults, {
            status: 200,
        });
    }),
    http.get(API_PATH + "/pages/concepts", () => {
        return HttpResponse.json(mockConceptsResults, {
            status: 200,
        });
    }),
    http.get(API_PATH + "/pages/concepts/_mock_concept_page_", () => {
        return HttpResponse.json(mockConceptPage, {
            status: 200,
        });
    }),
    http.get(API_PATH + "/pages/:pageId", ({params}) => {
        const {pageId} = params;

        return HttpResponse.json(buildMockPage(pageId as string), {
            status: 200,
        });
    }),
    http.get(API_PATH + "/glossary/terms", () => {
        return HttpResponse.json({results: [], totalResults: 0}, {
            status: 200,
        });
    }),
    http.post(API_PATH + "/log", async ({request}) => {
        const json = await request.json();
        console.info("Log event: ", json);
        return HttpResponse.json(null, {status: 200,}
        );
    }),
    http.get(API_PATH + "/user-alerts", () => {
        return HttpResponse.json({}, {
            status: 200,
        });
    }),
    http.get(API_PATH + "/events", () => {
        return HttpResponse.json({results: [], totalResults: 0}, {
            status: 200,
        });
    }),
    http.get(API_PATH + "/search", () => {
        return HttpResponse.json(mockSearchResults, {
            status: 200,
        });
    }),
    http.get(API_PATH + "/users/school_lookup", ({request}) => {
        // TODO should we actually be using query params here?
        const url = new URL(request.url);
        const user_ids = url.searchParams.get("user_ids");
        // Turn into map from user id to school
        const schools: {[userId: number]: School} = (user_ids as string).split(",").reduce((acc: any, userId: string) => {
            acc[userId] = mockSchool;
            return acc;
        }, {});
        return HttpResponse.json(schools, {
            status: 200,
        });
    }),
    http.get(API_PATH + "/users/resetpassword/:token", ({params}) => {
        const {token} = params;
        return HttpResponse.json({token}, {
            status: 200,
        });
    }),
];

// --- Extra handler builder functions ---

export const handlerThatReturns = (options?: {data?: any, status?: number}) => jest.fn(() => {
    if (!options?.data) {
        return HttpResponse.json(null, {
            status: (options?.status ?? 200)
        });
    }
    return HttpResponse.json(options.data, {
        status: (options?.status ?? 200)
    });
});
export const buildAuthTokenHandler = (newGroup: any, token: string) => jest.fn(() => {
    return HttpResponse.json({
        token,
        ownerUserId: newGroup.ownerId,
        groupId: newGroup.id
    }, {
        status: 200,
    });
});
export const buildNewManagerHandler = (groupToAddManagerTo: any, newManager: any) => jest.fn(() => {
    return HttpResponse.json({
        ...groupToAddManagerTo,
        additionalManagers: [...(groupToAddManagerTo.additionalManagers || []), buildMockUserSummary(newManager, true)]
    }, {
        status: 200,
    });
});
export const buildGroupHandler = (groups?: any[]) => jest.fn(({request}) => {
    const url = new URL(request.url);
    const archived = url.searchParams.get("archived_groups_only") === "true";
    const filteredGroups = (groups ?? mockGroups).filter(g => g.archived === archived);
    return HttpResponse.json(filteredGroups, {
        status: 200,
    });
});
export const buildFunctionHandler = <T extends string, V extends JsonBodyType>(path: string, keys: T[], fn: (p: Record<T, string>) => V) => {
    return http.get(API_PATH + path, async ({ request }) => {
        const params = keys.reduce(
            (acc, key) => Object.assign(acc, {[key]: new URL(request.url).searchParams.get(key)}),
            {} as Record<T, string>
        );
        return HttpResponse.json(fn(params), { status: 200, });
    });
};
export const buildPostHandler = <T, V extends JsonBodyType>(path: string, fn: (p: T) => V) => {
    return http.post(API_PATH + path, async ({ request }) => {
        const body = await request.json() as T;
        return HttpResponse.json(fn(body), { status: 200, });
    });
};
