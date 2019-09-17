import React from "react";
import {Col, Row} from "reactstrap";
import {AnonUserExamBoardPicker} from "./inputs/AnonUserExamBoardPicker";
import {WithFigureNumbering} from "./WithFigureNumbering";
import {IsaacContent} from "../content/IsaacContent";
import {NavigationLinks} from "./NavigationLinks";
import {RelatedContent} from "./RelatedContent";
import {ContentDTO} from "../../../IsaacApiTypes";
import {useNavigation} from "../../services/navigation";

interface QuestionPageProps {
    doc: ContentDTO;
    urlQuestionId: string;
}

export const Question = ({doc, urlQuestionId}: QuestionPageProps) => {
    const navigation = useNavigation(urlQuestionId);

    return <Row>
        <Col md={{size: 8, offset: 2}} className="py-4 question-panel">
            <AnonUserExamBoardPicker className="text-right"/>
            <WithFigureNumbering doc={doc}>
                <IsaacContent doc={doc}/>
            </WithFigureNumbering>

            {/* Superseded notice */}

            <p className="text-muted">{doc.attribution}</p>

            <NavigationLinks navigation={navigation}/>

            {doc.relatedContent && <RelatedContent content={doc.relatedContent} parentPage={doc}/>}
        </Col>
    </Row>
};
