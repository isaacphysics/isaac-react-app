import {KEY, load} from "../../../services/localStorage";
import produce from "immer";
import {
    AppAssignmentProgress,
    AppGroup,
    AppQuizAssignment, GroupMembershipDetailDTO,
    NOT_FOUND_TYPE,
    UserProgress
} from "../../../../IsaacAppTypes";
import {
    QuizAssignmentDTO, QuizAttemptFeedbackDTO, QuizUserFeedbackDTO,
    UserGameboardProgressSummaryDTO, UserSummaryDTO,
    UserSummaryWithEmailAddressDTO
} from "../../../../IsaacApiTypes";
import {isDefined} from "../../../services/miscUtils";
import {NOT_FOUND} from "../../../services/constants";

export const anonymiseIfNeededWith = <T>(anonymisationCallback: (nonanonymousData: T) => T) => (nonanonymousData: T) =>
    load(KEY.ANONYMISE_USERS) === "YES" ? anonymisationCallback(nonanonymousData) : nonanonymousData;

export const anonymisationFunctions = {
    progressState: produce<AppAssignmentProgress[]>((progress) => {
        progress.forEach((userProgress, i) => {
            if (userProgress.user) {
                userProgress.user.familyName = "";
                userProgress.user.givenName = `Test Student ${i + 1}`;
            }
        });
    }),
    groupProgress: produce<UserGameboardProgressSummaryDTO[]>((groupProgress) => {
        groupProgress.forEach((up, i) => {
            if (up.user) {
                up.user.familyName = "";
                up.user.givenName = `Test Student ${i + 1}`;
            }
        });
    }),
    userSummary: (overrideGivenName?: string, overrideFamilyName?: string) => function userSummary<T extends UserSummaryWithEmailAddressDTO>(userSummary: T, index?: number): T {
        return {
            ...userSummary,
            familyName: overrideFamilyName ?? "",
            givenName: overrideGivenName ?? ("Test Student" + (index ? ` ${index + 1}` : "")),
            email: "hidden@test.demo"
        };
    },
    appGroup: (appGroup: AppGroup): AppGroup => ({
        ...appGroup,
        ownerSummary: appGroup?.ownerSummary && anonymisationFunctions.userSummary("Group", "Manager 1")(appGroup.ownerSummary),
        additionalManagers: appGroup?.additionalManagers?.map((us, i) => anonymisationFunctions.userSummary("Group", `Manager ${i + 2}`)(us)),
        groupName: `Demo Group ${appGroup?.id}`,
        members: appGroup?.members?.map(anonymisationFunctions.userSummary())
    }),
    assignments: (quizAssignments: QuizAssignmentDTO[] | NOT_FOUND_TYPE | null) => {
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
    assignment: (assignmentState: {assignment: QuizAssignmentDTO} | {error: string}): {assignment: QuizAssignmentDTO} | {error: string} => {
        if ("error" in assignmentState) {
            return assignmentState;
        }
        return {
            assignment: {
                ...assignmentState.assignment,
                userFeedback: assignmentState.assignment.userFeedback?.map((uf, i) => ({
                    ...uf,
                    user: uf.user && anonymisationFunctions.userSummary()(uf.user, i)
                })),
            },
        };
    },
    quizAttempt: produce<{ studentAttempt: QuizAttemptFeedbackDTO }>((quizAttempt) => {
        if (quizAttempt.studentAttempt.user) {
            quizAttempt.studentAttempt.user.familyName = "";
            quizAttempt.studentAttempt.user.givenName = "Test Student";
        }
    }),
    userProgress: (userProgress: UserProgress): UserProgress => userProgress && {
        ...userProgress,
        userDetails: userProgress?.userDetails && anonymisationFunctions.userSummary()(userProgress?.userDetails)
    },
    activeAuthorisations: (activeAuthorisations: UserSummaryWithEmailAddressDTO[]): UserSummaryWithEmailAddressDTO[] =>
        activeAuthorisations?.map((a, i) => anonymisationFunctions.userSummary("Demo", `Teacher ${i + 1}`)(a)),
    otherUserAuthorisations: (otherUserAuthorisations: UserSummaryDTO[]): UserSummaryDTO[] =>
        otherUserAuthorisations?.map(anonymisationFunctions.userSummary()),
    groupMemberships: (groupMemberships: GroupMembershipDetailDTO[]): GroupMembershipDetailDTO[] =>
        groupMemberships.map(g => ({
            ...g,
            group: anonymisationFunctions.appGroup(g.group) ?? {},
        }))
}