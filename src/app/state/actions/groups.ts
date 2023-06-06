import {AppGroup} from "../../../IsaacAppTypes";
import {openActiveModal} from "./../index";
import {
    additionalManagerSelfRemovalModal,
    groupInvitationModal,
    groupEmailModal, groupManagersModal
} from "../../components/elements/modals/GroupsModalCreators";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {createAsyncThunk} from "@reduxjs/toolkit";

export const showGroupEmailModal = createAsyncThunk<void, number[]>(
    "groups/modals/email",
    async (userIds, {dispatch}) => {
        dispatch(openActiveModal(groupEmailModal(userIds)));
    }
);

export const showGroupInvitationModal = createAsyncThunk<void, {group: AppGroup; user: RegisteredUserDTO; firstTime: boolean; backToCreateGroup?: () => void}>(
    "groups/modals/invitation",
    async ({group, user, firstTime, backToCreateGroup}, {dispatch}) => {
        dispatch(openActiveModal(groupInvitationModal(group, user, firstTime, backToCreateGroup)));
    }
);

export const showAdditionalManagerSelfRemovalModal = createAsyncThunk<void, {group: AppGroup; user: RegisteredUserDTO}>(
    "groups/modals/additionalManagerSelfRemoval",
    async ({group, user}, {dispatch}) => {
        dispatch(openActiveModal(additionalManagerSelfRemovalModal(group, user)));
    }
);

export const showGroupManagersModal = createAsyncThunk<void, {group: AppGroup; user: RegisteredUserDTO}>(
    "groups/modals/managers",
    async ({group, user}, {dispatch}) => {
        dispatch(openActiveModal(groupManagersModal(group, user)));
    }
);