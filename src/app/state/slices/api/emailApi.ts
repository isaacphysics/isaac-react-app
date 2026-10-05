import {isaacApi} from "./baseApi";
import {showSuccessToast} from "../../actions/popups";
import {requestCurrentUser} from "../../actions";
import {onQueryLifecycleEvents} from "./utils";
import {EmailUserRoles, TemplateEmail} from "../../../../IsaacAppTypes";
import {EmailTemplateDTO} from "../../../../IsaacApiTypes";
import i18next from "i18next";

export const emailApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        verifyEmail: build.mutation<void, {userid: string; token: string}>({
            query: ({userid, token}) => ({
                url: `/users/verifyemail/${userid}/${token}`,
                method: "POST",
            }),
            onQueryStarted: onQueryLifecycleEvents({
                onQuerySuccess: (args, _, {dispatch}) => {
                    dispatch(requestCurrentUser());
                    dispatch(showSuccessToast(i18next.t("common:auth.emailVerification.successTitle"), i18next.t("common:auth.emailVerification.successMessage")));
                }
            })
        }),

        requestEmailVerification: build.mutation<void, {email: string}>({
            query: ({email}) => ({
                url: `/users/verifyemail`,
                method: "POST",
                body: {email},
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: i18next.t("common:auth.emailVerification.requestErrorTitle"),
                successTitle: i18next.t("common:auth.emailVerification.requestSuccessTitle"),
                successMessage: i18next.t("common:auth.emailVerification.requestSuccessMessage"),
            }),
        }),

        sendAdminEmail: build.mutation<void, {contentId: string; emailType: string; roles: EmailUserRoles}>({
            query: ({contentId, emailType, roles}) => ({
                url: `/email/sendemail/${encodeURIComponent(contentId)}/${emailType}`,
                method: "POST",
                body: roles,
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: i18next.t("common:admin.email.sendErrorTitle"),
                successTitle: i18next.t("common:admin.email.sendSuccessTitle"),
                successMessage: i18next.t("common:admin.email.sendSuccessMessage"),
            })
        }),

        sendAdminEmailWithIds: build.mutation<void, {contentId: string; emailType: string; ids: number[]}>({
            query: ({contentId, emailType, ids}) => ({
                url: `/email/sendemailwithuserids/${encodeURIComponent(contentId)}/${emailType}`,
                method: "POST",
                body: ids,
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: i18next.t("common:admin.email.sendWithIdsErrorTitle"),
                successTitle: i18next.t("common:admin.email.sendSuccessTitle"),
                successMessage: i18next.t("common:admin.email.sendSuccessMessage"),
            })
        }),

        sendProvidedEmailWithUserIds: build.mutation<void, {emailTemplate: EmailTemplateDTO; emailType: string; ids: number[]}>({
            query: ({emailTemplate, emailType, ids}) => ({
                url: `/email/sendprovidedemailwithuserids/${emailType}`,
                method: "POST",
                body: {userIds: ids, emailTemplate},
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: i18next.t("common:admin.email.sendWithIdsErrorTitle"),
                successTitle: i18next.t("common:admin.email.sendSuccessTitle"),
                successMessage: i18next.t("common:admin.email.sendSuccessMessage"),
            })
        }),

        getTemplateEmail: build.query<TemplateEmail, string>({
            query: (contentId) => `/email/viewinbrowser/${encodeURIComponent(contentId)}`,
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: i18next.t("common:admin.email.templateErrorTitle"),
            })
        }),
    })
});

export const {
    useVerifyEmailMutation,
    useRequestEmailVerificationMutation,
    useSendAdminEmailWithIdsMutation,
    useSendProvidedEmailWithUserIdsMutation,
    useLazyGetTemplateEmailQuery
} = emailApi;
