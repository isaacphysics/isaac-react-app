import {isDefined, KEY, persistence, NOT_FOUND} from "../../../services";
import produce from "immer";
import {
    AppAssignmentProgress,
    AppGroup,
    AppQuizAssignment,
    GroupMembershipDetailDTO,
    NOT_FOUND_TYPE,
    UserProgress
} from "../../../../IsaacAppTypes";
import {
    QuizAssignmentDTO,
    QuizAttemptFeedbackDTO,
    UserGameboardProgressSummaryDTO,
    UserSummaryDTO,
    UserSummaryWithEmailAddressDTO
} from "../../../../IsaacApiTypes";

interface AnonymisationOptions {
    anonymiseGroupNames?: boolean;
    indexOverride?: number;
}
const getAnonymisationOptions = (): AnonymisationOptions => ({anonymiseGroupNames: persistence.load(KEY.ANONYMISE_USERS) === "YES"});

export const anonymiseIfNeededWith = <T>(anonymisationCallback: (nonanonymousData: T, options?: AnonymisationOptions) => T) => (nonanonymousData: T): T =>
    persistence.load(KEY.ANONYMISE_USERS) === "YES" ? anonymisationCallback(nonanonymousData, getAnonymisationOptions()) : nonanonymousData;

export const anonymiseListIfNeededWith = <T>(anonymisationCallback: (nonanonymousData: T, options?: AnonymisationOptions) => T) => (nonanonymousData: T[]): T[] =>
    persistence.load(KEY.ANONYMISE_USERS) === "YES" ? nonanonymousData.map(d => anonymisationCallback(d, getAnonymisationOptions())) : nonanonymousData;

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
    userSummary: (overrideGivenName?: string, overrideFamilyName?: string) => function userSummary<T extends UserSummaryWithEmailAddressDTO>(userSummary: T, anonymisationOptions?: AnonymisationOptions): T {
        return {
            ...userSummary,
            familyName: overrideFamilyName ?? "",
            givenName: overrideGivenName ?? ("Test Student" + (anonymisationOptions?.indexOverride ? ` ${anonymisationOptions.indexOverride + 1}` : "")),
            email: "hidden@test.demo"
        };
    },
    appGroup: (appGroup: AppGroup, anonymisationOptions?: AnonymisationOptions): AppGroup => ({
        ...appGroup,
        ownerSummary: appGroup?.ownerSummary && anonymisationFunctions.userSummary("Group", "Manager 1")(appGroup.ownerSummary),
        additionalManagers: appGroup?.additionalManagers?.map((us, i) => anonymisationFunctions.userSummary("Group", `Manager ${i + 2}`)(us)),
        groupName: anonymisationOptions?.anonymiseGroupNames ? `Demo Group ${appGroup?.id}` : appGroup.groupName,
        members: appGroup?.members?.map((a, i) => anonymisationFunctions.userSummary()(a, {indexOverride: i})),
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
                    user: uf.user && anonymisationFunctions.userSummary()(uf.user, {indexOverride: i})
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
        activeAuthorisations?.map((a, i) => anonymisationFunctions.userSummary("Demo", `Teacher ${i + 1}`)(a, {indexOverride: i})),
    otherUserAuthorisations: (otherUserAuthorisations: UserSummaryDTO[]): UserSummaryDTO[] =>
        otherUserAuthorisations?.map((a, i) => anonymisationFunctions.userSummary()(a, {indexOverride: i})),
    groupMembershipDetail: (groupMembership: GroupMembershipDetailDTO, anonymisationOptions?: AnonymisationOptions): GroupMembershipDetailDTO => ({
        ...groupMembership,
        group: anonymisationFunctions.appGroup(groupMembership.group, anonymisationOptions) ?? {},
    })
}