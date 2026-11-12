import { logOutDeletedUser } from "../../actions";
import {isaacApi} from "./baseApi";
import { onQueryLifecycleEvents } from "./utils";
import i18next from "i18next";

export const accountApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        confirmAccountDeletionRequest: build.mutation<void, void>({
            query: () => ({
                url: `/users/deleteaccount`,
                method: "POST",
                body: {},
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: () => i18next.t("common:account.deletion.errorTitle"),
                successTitle: () => i18next.t("common:account.deletion.successTitle"),
                successMessage: () => i18next.t("common:account.deletion.successMessage"),
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
                errorTitle: () => i18next.t("common:account.deletion.failedTitle"),
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
