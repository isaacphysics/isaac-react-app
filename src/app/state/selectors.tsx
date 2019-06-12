import {AppState} from "./reducers";

export const groups = {
    current: (state: AppState) => {
        if (!state) return null;
        if (!state.groups) return null;
        const activeId = state.groups.selectedGroupId;
        if (!activeId) return null;
        return (state.groups.active || []).find(group => group.id == activeId)
            || (state.groups.archived || []).find(group => group.id == activeId)
            || null;
    }
};