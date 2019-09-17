import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../../state/reducers";
import {Question} from "../Question";
import {ContentDTO} from "../../../../IsaacApiTypes";
import {ShowLoading} from "../../handlers/ShowLoading";
import React, {useEffect} from "react";
import {fetchDoc} from "../../../state/actions";
import {DOCUMENT_TYPE} from "../../../services/constants";

interface QuestionModalProps {
    urlQuestionId: string;
}

export const QuestionModal = ({urlQuestionId}: QuestionModalProps) => {
    const dispatch = useDispatch();
    const doc = useSelector((state: AppState) => state && state.doc);

    useEffect(() => {
        dispatch(fetchDoc(DOCUMENT_TYPE.QUESTION, urlQuestionId));
    }, [urlQuestionId]);

    return <ShowLoading until={doc} render={(doc: ContentDTO) =>
        <Question doc={doc} urlQuestionId={urlQuestionId}/>
    }/>
};
