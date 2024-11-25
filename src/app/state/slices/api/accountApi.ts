import { logOutDeletedUser } from "../../actions";
import {isaacApi} from "./baseApi";
import { onQueryLifecycleEvents } from "./utils";

export const accountApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        confirmAccountDeletionRequest: build.mutation<void, void>({
            query: () => ({
                url: `/users/deleteaccount`,
                method: "POST",
                body: {},
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Account deletion request failed.",
                successTitle: "Account deletion request sent.",
                successMessage: "An email has been sent to you with instructions on how to confirm your account deletion.",
            }),
        }),
        deleteAccount: build.mutation<void, {token: string, deletionReason: string}>({
            query: ({token, deletionReason}) => ({
                url: `/users/deleteaccount?token=${token}`,
                method: "DELETE",
                body: {
                    reason: deletionReason,
                },
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Account deletion failed.",
                onQuerySuccess: (_arg, _data, {getState: _getState, dispatch}) => {
                    dispatch(logOutDeletedUser());
                }
            }),
        }),
    }),
});

export const {
    useConfirmAccountDeletionRequestMutation,
    useDeleteAccountMutation,
} = accountApi;
