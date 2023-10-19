import { ContentSummaryDTO, ResultsWrapper } from "../../../IsaacApiTypes";
import { Action } from "../../../IsaacAppTypes";
import { ACTION_TYPE } from "../../services";

type SearchState = { searchResults: ResultsWrapper<ContentSummaryDTO> | null } | null;
export const search = (search: SearchState = null, action: Action) => {
  switch (action.type) {
    case ACTION_TYPE.SEARCH_REQUEST:
      return { ...search, searchResults: null };
    case ACTION_TYPE.SEARCH_RESPONSE_SUCCESS:
      return { ...search, searchResults: action.searchResults };
    default:
      return search;
  }
};
