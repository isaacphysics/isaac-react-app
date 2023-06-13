import {isaacApi} from "./baseApi";
import {showSuccessToast} from "../../actions/popups";
import {requestCurrentUser} from "../../actions";
import {onQueryLifecycleEvents} from "./utils";

// verify: (params: {userid: string | null; token: string | null}): AxiosPromise => {
//     return endpoint.get(`/users/verifyemail/${params.userid}/${params.token}`);
// },
// getTemplateEmail: (contentid: string): AxiosPromise<AppTypes.TemplateEmail> => {
//     return endpoint.get(`/email/viewinbrowser/${contentid}`);
// },
// sendAdminEmail: (contentid: string, emailType: string, roles: EmailUserRoles): AxiosPromise => {
//     return endpoint.post(`/email/sendemail/${contentid}/${emailType}`, roles);
// },
// sendAdminEmailWithIds: (contentid: string, emailType: string, ids: number[]): AxiosPromise => {
//     return endpoint.post(`/email/sendemailwithuserids/${contentid}/${emailType}`, ids);
// },
// sendProvidedEmailWithUserIds: (emailTemplate: EmailTemplateDTO, emailType: string, ids: number[]): AxiosPromise => {
//     return endpoint.post(`/email/sendprovidedemailwithuserids/${emailType}`, {userIds: ids, emailTemplate: emailTemplate});
// },
// requestEmailVerification(params: {email: string}) {
//     return endpoint.post(`/users/verifyemail`, params);
// },

export const emailApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        verifyEmail: build.mutation<void, {userid: string; token: string}>({
            query: ({userid, token}) => ({
                url: `/users/verifyemail/${userid}/${token}`,
            }),
            onQueryStarted: onQueryLifecycleEvents({
                onQueryStart: (args, {dispatch}) => {
                    dispatch(requestCurrentUser());
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
    })
});

export const {
    useVerifyEmailMutation,
    useRequestEmailVerificationMutation,
} = emailApi;