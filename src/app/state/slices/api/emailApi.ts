import {isaacApi} from "./baseApi";
import {showSuccessToast} from "../../actions/popups";
import {onQueryLifecycleEvents} from "./utils";
import {EmailUserRoles, TemplateEmail} from "../../../../IsaacAppTypes";
import {EmailTemplateDTO} from "../../../../IsaacApiTypes";
import {authApi} from "../../index";

export const emailApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        verifyEmail: build.mutation<void, {userid: string; token: string}>({
            query: ({userid, token}) => ({
                url: `/users/verifyemail/${userid}/${token}`,
                method: "GET",
            }),
            onQueryStarted: onQueryLifecycleEvents({
                onQuerySuccess: (args, _, {dispatch}) => {
                    dispatch(authApi.endpoints.getCurrentUser.initiate());
                    dispatch(showSuccessToast("Email address verified", "The email address has been verified"));
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
                errorTitle: "Email verification request failed",
                successTitle: "Email verification request succeeded.",
                successMessage: "Please follow the verification link given in the email sent to your address.",
            }),
        }),

        sendAdminEmail: build.mutation<void, {contentId: string; emailType: string; roles: EmailUserRoles}>({
            query: ({contentId, emailType, roles}) => ({
                url: `/email/sendemail/${contentId}/${emailType}`,
                method: "POST",
                body: roles,
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Sending email failed",
                successTitle: "Email sent",
                successMessage: "Email sent to users successfully",
            })
        }),

        sendAdminEmailWithIds: build.mutation<void, {contentId: string; emailType: string; ids: number[]}>({
            query: ({contentId, emailType, ids}) => ({
                url: `/email/sendemailwithuserids/${contentId}/${emailType}`,
                method: "POST",
                body: ids,
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Sending email with ids failed",
                successTitle: "Email sent",
                successMessage: "Email sent to users successfully",
            })
        }),

        sendProvidedEmailWithUserIds: build.mutation<void, {emailTemplate: EmailTemplateDTO; emailType: string; ids: number[]}>({
            query: ({emailTemplate, emailType, ids}) => ({
                url: `/email/sendprovidedemailwithuserids/${emailType}`,
                method: "POST",
                body: {userIds: ids, emailTemplate},
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Sending email with ids failed",
                successTitle: "Email sent",
                successMessage: "Email sent to users successfully",
            })
        }),

        getTemplateEmail: build.query<TemplateEmail, string>({
            query: (contentId) => `/email/viewinbrowser/${contentId}`,
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Failed to get email template",
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
