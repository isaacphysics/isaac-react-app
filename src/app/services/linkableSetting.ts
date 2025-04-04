import {linkableSettingSlice, useAppDispatch, useAppSelector} from "../state";

export const useLinkableSetting = () => {

    const dispatch = useAppDispatch();

    function setLinkedSetting(targetId: string) {
        dispatch(linkableSettingSlice.actions.setTarget(targetId));
    }

    function setLinkedSettingSeen() {
        dispatch(linkableSettingSlice.actions.setSeen());
    }

    function clearLinkedSetting() {
        dispatch(linkableSettingSlice.actions.setTarget(null));
    }

    const linkedSettingId = useAppSelector(state => state?.linkableSetting?.target);

    return {setLinkedSetting, setLinkedSettingSeen, clearLinkedSetting, linkedSettingId};
};