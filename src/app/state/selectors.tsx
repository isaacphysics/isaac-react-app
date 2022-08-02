import {AppState} from "./reducers";
import {NOT_FOUND} from "../services/constants";
import {AppGroup, AppQuizAssignment, NOT_FOUND_TYPE, UserProgress} from "../../IsaacAppTypes";
import {KEY, load} from "../services/localStorage";
import {isDefined} from "../services/miscUtils";
import {QuizAssignmentDTO, QuizAttemptFeedbackDTO} from "../../IsaacApiTypes";
import produce from "immer";

export const selectors = {
    groups: {
        current: (state: AppState) => {
            if (!state) return null;
            if (!state.groups) return null;
            if (!state.groups.cache) return null;
            const activeId = state.groups.selectedGroupId;
            if (!activeId) return null;
            return load(KEY.ANONYMISE_USERS) === "YES" ? anonymisationFunctions.appGroup(state.groups.cache[activeId]) : state.groups.cache[activeId];
        },
        active: (state: AppState) => {
            if (!state) return null;
            if (!state.groups) return null;
            if (!state.groups.cache) return null;
            if (!state.groups.active) return null;
            // @ts-ignore - typescript can't pass the non-null inside the map function here
            return state.groups.active.map(groupId => state.groups.cache[groupId]).map(group => load(KEY.ANONYMISE_USERS) === "YES" ? anonymisationFunctions.appGroup(group): group);
        },
        archived: (state: AppState) => {
            if (!state) return null;
            if (!state.groups) return null;
            if (!state.groups.cache) return null;
            if (!state.groups.archived) return null;
            // @ts-ignore - typescript can't pass the non-null inside the map function here
            return state.groups.archived.map(groupId => state.groups.cache[groupId]).map(group => load(KEY.ANONYMISE_USERS) === "YES" ? anonymisationFunctions.appGroup(group) : group);
        },
        groups: (state: AppState) => {
            return {
                active: selectors.groups.active(state),
                archived: selectors.groups.archived(state)
            }
        },
    },

    topic: {
        currentTopic: (state: AppState) => {
            if (!state) return null;
            if (!state.currentTopic) return null;
            if (state.currentTopic === NOT_FOUND) return null;
            return state.currentTopic;
        }
    },

    boards: {
        boards: (state: AppState) => state?.boards ?? null
    },

    doc: {
        get: (state: AppState) => state?.doc || null,
    },

    questions: {
        getQuestions: (state: AppState) => state?.questions?.questions,
        allQuestionsAttempted: (state: AppState) => {
            return !!state && !!state.questions && state.questions.questions.map(q => !!q.currentAttempt).reduce((prev, current) => prev && current);
        },
        anyQuestionPreviouslyAttempted: (state: AppState) => {
            return !!state && !!state.questions && state.questions.questions.map(q => !!q.bestAttempt).reduce((prev, current) => prev || current);
        },
        graphSketcherSpec: (state: AppState) => state?.graphSketcherSpec,
    },

    segue: {
        contentVersion: (state: AppState) => state?.contentVersion || null,
        versionOrUnknown: (state: AppState) => state?.constants?.segueVersion || "unknown",
        environmentOrUnknown: (state: AppState) => state?.constants?.segueEnvironment || "unknown",
    },

    error: {
        general: (state: AppState) => state?.error && state.error.type == "generalError" && state.error.generalError || null,
    },

    user:  {
        orNull: (state: AppState) => state?.user || null,
        progress: (state: AppState) => state?.myProgress,
        snapshot: (state: AppState) => state?.myProgress?.userSnapshot,
        achievementsRecord: (state: AppState) => state?.myProgress?.userSnapshot?.achievementsRecord,
        answeredQuestionsByDate: (state: AppState) => state?.myAnsweredQuestionsByDate
    },

    mainContentId: {
        orDefault: (state: AppState) => state?.mainContentId || "main",
    },

    teacher: {
        userProgress: (state: AppState) => load(KEY.ANONYMISE_USERS) === "YES" ? anonymisationFunctions.userProgress(state?.userProgress) : state?.userProgress,
        userAnsweredQuestionsByDate: (state: AppState) => state?.userAnsweredQuestionsByDate
    },

    admin: {
        userSearch: (state: AppState) => state?.adminUserSearch || null,
        userSchoolLookup: (state: AppState) => state?.userSchoolLookup,
    },
    quizzes: {
        preview: (state: AppState) => {
            const qp = state?.quizPreview;
            return {
                quiz: qp && 'quiz' in qp ? qp.quiz : null,
                error: qp && 'error' in qp ? qp.error : null,
            };
        },
        assignedToMe: (state: AppState) => state?.quizAssignedToMe,
        available: (state: AppState) => state?.quizzes?.quizzes,
        assignments: (state: AppState) => load(KEY.ANONYMISE_USERS) === "YES" ? anonymisationFunctions.assignments(state?.quizAssignments) : augmentWithGroupNameIfInCache(state, state?.quizAssignments),
        /* Retrieves the current users most recent attempt at the current quiz being viewed */
        currentQuizAttempt: (state: AppState) => state?.quizAttempt,
        /* Retrieves the quiz attempt for the current student being looked at (this is used to render /test/attempt/feedback/[group id]/[student id]) */
        currentStudentQuizAttempt: (state: AppState) =>
            state?.studentQuizAttempt && 'studentAttempt' in state?.studentQuizAttempt && load(KEY.ANONYMISE_USERS) === "YES"
                ? anonymisationFunctions.quizAttempt(state?.studentQuizAttempt)
                : state?.studentQuizAttempt,
        assignment: (state: AppState) => load(KEY.ANONYMISE_USERS) === "YES" ? anonymisationFunctions.assignment(state?.quizAssignment) : state?.quizAssignment,
        attemptedFreelyByMe: (state: AppState) => state?.quizAttemptedFreelyByMe,
    },
};

function augmentWithGroupNameIfInCache(state: AppState, quizAssignments: QuizAssignmentDTO[] | NOT_FOUND_TYPE | null | undefined): AppQuizAssignment[] | NOT_FOUND_TYPE | undefined | null {
    if (!isDefined(quizAssignments) || quizAssignments === NOT_FOUND) {
        return quizAssignments;
    }
    const groupCache = state?.groups?.cache ?? {};
    return quizAssignments.map(assignment => {
        const groupName = groupCache[assignment.groupId as number]?.groupName;
        return {
            ...assignment,
            groupName,
        };
    });
}

const anonymisationFunctions = {
    appGroup: (appGroup: AppGroup): AppGroup => {
        return {
            ...appGroup,
            groupName: `Demo Group ${appGroup.id}`,
            members: appGroup.members?.map((member, i) => {
                return {
                    ...member,
                    familyName: "",
                    givenName: `Test Student ${i + 1}`,
                }
            }),
        }
    },
    assignments: (quizAssignments: QuizAssignmentDTO[] | NOT_FOUND_TYPE | null | undefined) => {
        if (!isDefined(quizAssignments) || quizAssignments === NOT_FOUND) {
            return quizAssignments;
        }
        return quizAssignments.map(assignment => {
            const groupName = `Demo Group ${assignment.groupId}`;
            return {
                // @ts-ignore we know an assignment will be returned from this, since we pass in an assignment
                ...anonymisationFunctions.assignment({assignment: assignment}).assignment,
                groupName,
            } as AppQuizAssignment;
        });
    },
    assignment: (assignmentState: {assignment: QuizAssignmentDTO} | {error: string} | null | undefined) => {
        if (!isDefined(assignmentState) || "error" in assignmentState) {
            return assignmentState;
        }
        return {
            assignment: {
                ...assignmentState.assignment,
                userFeedback: assignmentState.assignment.userFeedback?.map((uf, i) => {
                    return {
                        ...uf,
                        user: {
                            ...uf.user,
                            familyName: "",
                            givenName: `Test Student ${i + 1}`,
                        }
                    }
                }),
                quizAttempt: assignmentState.assignment
            }
        };
    },
    quizAttempt: produce<{ studentAttempt: QuizAttemptFeedbackDTO }>((quizAttempt) => {
        if (quizAttempt.studentAttempt.user) {
            quizAttempt.studentAttempt.user.familyName = "";
            quizAttempt.studentAttempt.user.givenName = "Test Student";
        }
    }),
    userProgress: (userProgress: UserProgress | null | undefined): UserProgress | undefined => (userProgress ? {
        ...userProgress,
        userDetails: {
            ...userProgress?.userDetails,
            familyName: "",
            givenName: "Test Student",
        }
    } : undefined)
}

// Important type checking to avoid an awkward bug
interface SelectorsWithNoPropArgs {
    // It is important that the selectors do not use the component's props to filter the results as they can be
    // out-of-date. In some cases this can lead to zombie children.
    // A full explanation can be found here: https://react-redux.js.org/next/api/hooks#stale-props-and-zombie-children
    // We avoid this problem by forcing the selectors to be simple, accepting only the app state as an argument.
    // Filtering using the props can be safely done later during the component's render on useAppSelector(...)'s result.
    [type: string]: {[name: string]: (state: AppState) => unknown};
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const selectorsWithoutZombies: SelectorsWithNoPropArgs = selectors; // lgtm[js/unused-local-variable] I don't want to lose selectors' type inference
