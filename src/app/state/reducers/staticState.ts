import {IsaacPodDTO} from "../../../IsaacApiTypes";
import {Action} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services/constants";

type NewsState = {news: IsaacPodDTO[]} | null;
export const news = (news: NewsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.NEWS_RESPONSE_SUCCESS:
            return {news: Array.from(action.theNews)};
        default:
            return news;
    }
};