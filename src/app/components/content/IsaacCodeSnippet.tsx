import {CodeDTO, CodeSnippetDTO} from "../../../IsaacApiTypes";
import React, {useEffect} from "react";
import {Col, Row} from "reactstrap";
import {Tabs} from "../elements/Tabs";
import {fromPairs} from "lodash";

import hljs from 'highlight.js';

interface IsaacCodeProps {
    doc: CodeSnippetDTO;
}

export const IsaacCodeSnippet = ({doc}: IsaacCodeProps) => {
    useEffect(() => {
        hljs.highlightAll();
    }, [doc]);

    return <div className="tabbed-code mt-2 mb-3">
        <Row>
            <Col className="code-block">
                <pre>
                    <code className={doc.disableHighlighting ? 'plaintext' : doc.language}>
                        {doc.code}
                    </code>
                </pre>
            </Col>
        </Row>
        {doc.url && <Row>
            <Col className="text-center">
                <a href={doc.url} target="_blank" rel="noopener noreferrer">View on GitHub</a>
            </Col>
        </Row>}
    </div>
};
