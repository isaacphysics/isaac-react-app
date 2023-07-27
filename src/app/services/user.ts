import {history, isDefined} from "./";
import {LoggedInUser, PotentialUser, School, UserPreferencesDTO, ValidationUser} from "../../IsaacAppTypes";
import {AuthenticationProvider, UserContext, UserRole} from "../../IsaacApiTypes";
import {Immutable} from "immer";
import {
    mutationSucceeded,
    showErrorToast,
    showSuccessToast,
    useAppDispatch,
    useLazyGetProviderRedirectQuery,
    useUpdateUserMutation
} from "../state";

export function isLoggedIn(user?: Immutable<PotentialUser> | null): user is Immutable<LoggedInUser> {
    return user ? user.loggedIn : false;
}

export function isStudent(user?: {readonly role?: UserRole, readonly loggedIn?: boolean} | null): boolean {
    return isDefined(user) && (user.role === "STUDENT") && (user.loggedIn ?? true);
}

export function isTutor(user?: {readonly role?: UserRole, readonly loggedIn?: boolean} | null): boolean {
    return isDefined(user) && (user.role === "TUTOR") && (user.loggedIn ?? true);
}

export function isTutorOrAbove(user?: {readonly role?: UserRole, readonly loggedIn?: boolean} | null): boolean {
    return isDefined(user) && (user.role !== "STUDENT") && (user.loggedIn ?? true);
}

export function isTeacherOrAbove(user?: {readonly role?: UserRole, readonly loggedIn?: boolean} | null): boolean {
    return isDefined(user) && (user.role !== "STUDENT") && (user.role !== "TUTOR") && (user.loggedIn ?? true);
}

export function isAdmin(user?: {readonly role?: UserRole, readonly loggedIn?: boolean} | null): boolean {
    return isDefined(user) && (user.role === "ADMIN") && (user.loggedIn ?? true);
}

export function isEventManager(user?: {readonly role?: UserRole, readonly loggedIn?: boolean} | null): boolean {
    return isDefined(user) && (user.role === "EVENT_MANAGER") && (user.loggedIn ?? true);
}

export function isStaff(user?: {readonly role?: UserRole, readonly loggedIn?: boolean} | null): boolean {
    return isDefined(user) && (user.role === "ADMIN" || user.role === "EVENT_MANAGER" || user.role === "CONTENT_EDITOR") && (user.loggedIn ?? true);
}

export function isEventLeader(user?: {readonly role?: UserRole, readonly loggedIn?: boolean} | null): boolean {
    return isDefined(user) && (user.role === "EVENT_LEADER") && (user.loggedIn ?? true);
}

export function isEventLeaderOrStaff(user?: {readonly role?: UserRole, readonly loggedIn?: boolean} | null): boolean {
    return isEventLeader(user) || isStaff(user);
}

export function isAdminOrEventManager(user?: {readonly role?: UserRole, readonly loggedIn?: boolean} | null): boolean {
    return isAdmin(user) || isEventManager(user);
}

export const roleRequirements: Record<UserRole, (u: {readonly role?: UserRole, readonly loggedIn?: boolean} | null) => boolean> = {
    "STUDENT": isStudent,
    "TUTOR": isTutorOrAbove,
    "TEACHER": isTeacherOrAbove,
    "EVENT_LEADER": isEventLeaderOrStaff,
    "CONTENT_EDITOR": isStaff,
    "EVENT_MANAGER": isEventManager,
    "ADMIN": isAdmin
};

export function extractTeacherName(teacher: {readonly givenName?: string; readonly familyName?: string} | null | undefined): string | null {
    if (null == teacher) {
        return null;
    }
    return (teacher.givenName ? teacher.givenName.charAt(0) + ". " : "") + teacher.familyName;
}

export function schoolNameWithPostcode(schoolResult: School): string | undefined {
    let schoolName = schoolResult.name;
    if (schoolResult.postcode) {
        schoolName += ", " + schoolResult.postcode
    }
    return schoolName;
}

export const useProviderLogin = (provider: AuthenticationProvider, isSignup = false) => {
    const [getProviderRedirectUrl] = useLazyGetProviderRedirectQuery();
    return () => {
        getProviderRedirectUrl({provider, isSignup}).then(response => {
            if (response.isSuccess) {
                window.location.assign(response.data);
            }
        });
    };
};

export const useUserUpdate = () => {
    const dispatch = useAppDispatch();
    const [updateUser, queryStatus] = useUpdateUserMutation();
    const updateUserWithUI = async (
        updatedUser: Immutable<ValidationUser>,
        updatedUserPreferences: UserPreferencesDTO,
        userContexts: UserContext[] | undefined,
        passwordCurrent: string | null,
        currentUser: Immutable<PotentialUser>,
        redirect: boolean
    ) => {
        if (currentUser.loggedIn && currentUser.id === updatedUser.id) {
            if (currentUser.loggedIn && currentUser.email !== updatedUser.email) {
                const emailChangeConfirmed = window.confirm(
                    "You have edited your email address. Your current address will continue to work until you verify your " +
                    "new address by following the verification link sent to it via email. Continue?"
                );
                if (!emailChangeConfirmed) {
                    dispatch(showErrorToast("Account settings not updated", "Your account settings update was cancelled."));
                    return;
                }
            }
        }
        const editingOtherUser = currentUser.loggedIn && currentUser.id !== updatedUser.id;
        const response = await updateUser({
            registeredUser: updatedUser,
            userPreferences: updatedUserPreferences,
            passwordCurrent,
            registeredUserContexts: userContexts
        });
        if (mutationSucceeded(response)) {
            dispatch(showSuccessToast(
                "Account settings updated",
                editingOtherUser
                    ? "The user's account settings were updated successfully."
                    : "Your account settings have been updated successfully."
            ));
            if (editingOtherUser && redirect) {
                history.push("/");
            }
        }
        return response;
    };
    // Return the embellished function and the queryStatus object so that the caller can use the params object to check
    // the status of the mutation
    return {
        updateUser: updateUserWithUI,
        queryStatus
    };
};
