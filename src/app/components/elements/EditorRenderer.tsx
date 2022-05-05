import React, {useCallback, useEffect, useState} from "react";
import {Col, Row} from "reactstrap";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {FigureNumberingContext} from "../../../IsaacAppTypes";
import {WithFigureNumbering} from "./WithFigureNumbering";
import {IsaacContent} from "../content/IsaacContent";
import {Provider} from "react-redux";
import {store} from "../../state/store";
import {StaticRouter} from "react-router";

function getType(doc: any) {
    if (!doc) {
        return "generic";
    }
    switch (doc.type) {
        case "isaacQuestionPage":
            return "question";
        case "isaacConceptPage":
            return "concept";
        default:
            return "generic";
    }
}

function EditorListener() {
    // Wait for messages and then put doc from message into IsaacContent
    const [doc, setDoc] = useState();

    const listener = useCallback((message) => {
        const {doc} = message.data;
        if (doc && "type" in doc) {
            setDoc(doc);
        }
    }, [setDoc])

    useEffect(() => {
        window.addEventListener("message", listener);
        const source = window.opener || window.parent;
        if (source) {
            source.postMessage({ready: true}, "*");
        }
        return () => window.removeEventListener("message", listener);
    }, [listener]);

    const type = getType(doc);
    const colClasses = type === "question" ? "question-panel" : "";

    return doc ? <Row className={`${type}-content-container`}>
            <Col md={{[SITE.CS]: {size: 8, offset: 2}, [SITE.PHY]: {size: 12}}[SITE_SUBJECT]} className={`py-4 ${colClasses}`}>
                <FigureNumberingContext.Provider value={{}}>
                    <WithFigureNumbering doc={doc}>
                        <IsaacContent doc={doc}/>
                    </WithFigureNumbering>
                </FigureNumberingContext.Provider>
            </Col>
        </Row>
        : <div>
            <em>Waiting for content...</em>
        </div>;
}

export function EditorRenderer() {
    return <Provider store={store}>
        <StaticRouter location="/">
            <EditorListener/>
        </StaticRouter>
    </Provider>;
}
