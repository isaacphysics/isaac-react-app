import React, {useCallback, useEffect, useState} from "react";
import {Col, Row} from "reactstrap";
import {EDITOR_ORIGIN, SITE_TITLE, siteSpecific} from "../../services";
import {FigureNumberingContext} from "../../../IsaacAppTypes";
import {WithFigureNumbering} from "./WithFigureNumbering";
import {IsaacContent} from "../content/IsaacContent";
import {Provider} from "react-redux";
import {fetchGlossaryTerms, store, useAppDispatch} from "../../state";
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
    const dispatch = useAppDispatch();

    // Fetch glossary terms so they can be rendered
    useEffect(() => {
        dispatch(fetchGlossaryTerms());
    }, [dispatch]);

    const listener = useCallback((event: MessageEvent) => {
        if (!event.origin?.includes("localhost") && event.origin !== EDITOR_ORIGIN) {
            console.warn("Ignoring message from unexpected origin (" + event.origin + ")!")
            return;
        }
        const {doc} = event.data;
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
            <Col md={siteSpecific({size: 12}, {size: 8, offset: 2})} className={`py-4 ${colClasses}`}>
                <FigureNumberingContext.Provider value={{}}>
                    <WithFigureNumbering doc={doc}>
                        <IsaacContent doc={doc}/>
                    </WithFigureNumbering>
                </FigureNumberingContext.Provider>
            </Col>
        </Row>
        : <div>
            <em>Waiting for {SITE_TITLE} content...</em>
        </div>;
}

export function EditorRenderer() {
    return <Provider store={store}>
        <StaticRouter location="/">
            <EditorListener/>
        </StaticRouter>
    </Provider>;
}
