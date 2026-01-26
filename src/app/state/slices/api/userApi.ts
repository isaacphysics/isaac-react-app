import {isaacApi} from "./baseApi";
import {onQueryLifecycleEvents} from "./utils";
import {TOTPSharedSecretDTO, UserContext} from "../../../../IsaacApiTypes";
import {Immutable} from "immer";
import {PotentialUser, UserPreferencesDTO, ValidationUser} from "../../../../IsaacAppTypes";
import {showToast} from "../../actions/popups";
import {isFirstLoginInPersistence, isTeacherOrAbove, KEY, navigateComponentless, persistence} from "../../../services";
import {questionsApi} from "./questionsApi";
import {continueToAfterAuthPath, requestCurrentUser} from "../../actions";

export const userApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        // === Account MFA ===

        setupAccountMFA: build.mutation<void, {sharedSecret: string, mfaVerificationCode: string}>({
            query: ({sharedSecret, mfaVerificationCode}) => ({
                url: "/users/current_user/mfa",
                method: "POST",
                body: {sharedSecret, mfaVerificationCode}
            }),
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: "2FA Configured",
                successMessage: "You have enabled 2FA on your account!",
                errorTitle: "Failed to setup 2FA on account."
            })
        }),

        disableAccountMFA: build.mutation<void, number>({
            query: (userId) => ({
                url: `/users/${userId}/mfa`,
                method: "DELETE"
            }),
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: "2FA Disabled",
                successMessage: "You have disabled 2FA on this account!",
                errorTitle: "Failed to disable 2FA on account."
            })
        }),

        newMFASecret: build.mutation<TOTPSharedSecretDTO, void>({
            query: () => ({
                url: "/users/current_user/mfa/new_secret",
                method: "GET",
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Failed to get 2FA secret"
            })
        }),

        upgradeToTeacherAccount: build.mutation({
            query: () => ({
                url: "/users/current_user/upgrade/TEACHER",
                method: "POST"
            }),
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: "Account upgraded",
                successMessage: "You have upgraded to a teacher account!",
                errorTitle: "Failed to upgrade account",
            }),
        }),

        verifyPasswordReset: build.query<void, string | null>({
            query: (token) => ({
                url: `/users/resetpassword/${token}`,
                method: "GET"
            })
        }),

        handlePasswordReset: build.mutation<void, { token: string; password: string }>({
            query: (params) => ({
                url: `/users/resetpassword/${params.token}`,
                method: "POST",
                body: {password: params.password}
            }),
            onQueryStarted: onQueryLifecycleEvents({
                successTitle: "Password reset successful",
                successMessage: "Your password has been updated successfully.",
                errorTitle: "Failed to reset password"
            })
        }),

        createNew: build.mutation<void, {
            newUser: Immutable<ValidationUser>,
            newUserPreferences: UserPreferencesDTO,
            newUserContexts: UserContext[] | undefined,
            passwordCurrent: string | null,
        }>(
            {
                query: ({
                    newUser,
                    newUserPreferences,
                    newUserContexts,
                    passwordCurrent
                }) => ({
                    url: "/users",
                    method: "POST",
                    body: {
                        registeredUser: newUser,
                        userPreferences: newUserPreferences,
                        passwordCurrent,
                        registeredUserContexts: newUserContexts
                    }
                }),
                async onQueryStarted( args , {queryFulfilled, dispatch} ) {
                    try {
                        const { newUser } = args;

                        await queryFulfilled;
                        await dispatch(requestCurrentUser());

                        if (isTeacherOrAbove(newUser)) {
                            // Redirect to email verification page
                            void navigateComponentless('/verifyemail');
                        } else {
                            void navigateComponentless('/register/connect');
                        }
                    } catch {
                        // No-op - components may perform their own error handling using the hook
                    }
                }
            }
        ),

        updateCurrent: build.mutation<void, {
            updatedUser: Immutable<ValidationUser>;
            userPreferences: UserPreferencesDTO;
            registeredUserContexts?: UserContext[];
            passwordCurrent: string | null;
            currentUser: Immutable<PotentialUser>;
            redirect: boolean;
        }>(
            {
                query: ({
                    updatedUser,
                    userPreferences,
                    passwordCurrent,
                    registeredUserContexts
                }) => ({
                    url: "/users",
                    method: "POST",
                    body: {
                        registeredUser: updatedUser,
                        userPreferences,
                        passwordCurrent,
                        registeredUserContexts
                    }
                }),
                async onQueryStarted( args , { dispatch, queryFulfilled } ) {
                    const { currentUser, updatedUser, redirect } = args;
                    const editingOtherUser = currentUser.loggedIn && currentUser.id != updatedUser.id;

                    try {

                        await queryFulfilled;
                        await dispatch(requestCurrentUser());

                        if (!editingOtherUser) {
                            // Invalidate tagged caches that are dependent on the current user's settings
                            dispatch(questionsApi.util.invalidateTags(['CanAttemptQuestionType']));
                        }

                        const isFirstLogin = isFirstLoginInPersistence() || false;

                        if (isFirstLogin) {
                            persistence.session.remove(KEY.FIRST_LOGIN);
                            if (redirect) {
                                continueToAfterAuthPath({...currentUser, loggedIn: true});
                            }
                        } else if (!editingOtherUser) {
                            dispatch(showToast({
                                title: "Account settings updated",
                                body: "Your account settings were updated successfully.",
                                color: "success",
                                timeout: 5000,
                                closable: false,
                            }));
                        } else if (editingOtherUser) {
                            if (redirect) {
                                void navigateComponentless('/');
                            }
                            dispatch(showToast({
                                title: "Account settings updated",
                                body: "The user's account settings were updated successfully.",
                                color: "success",
                                timeout: 5000,
                                closable: false,
                            }));
                        }
                    } catch {
                        dispatch(showToast({
                            title: "Account settings not updated",
                            body: `Unable to update ${editingOtherUser ? "the user's" : "your"} account settings.`,
                            color: "danger",
                            timeout: 5000,
                            closable: false,
                        }));
                    }
                }
            }
        )
    })
});

export const {
    useSetupAccountMFAMutation,
    useDisableAccountMFAMutation,
    useNewMFASecretMutation,
    useUpgradeToTeacherAccountMutation,
    useVerifyPasswordResetQuery,
    useHandlePasswordResetMutation,
    useUpdateCurrentMutation,
    useCreateNewMutation,
} = userApi;
