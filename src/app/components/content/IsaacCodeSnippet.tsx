import {CodeSnippetDTO} from "../../../IsaacApiTypes";
import React, {useEffect, useRef} from "react";
import {Col, Row} from "reactstrap";
import hljs from 'highlight.js/lib/core';
import {highlightJsService, isCS} from "../../services";
import {ScrollShadows} from "../elements/ScrollShadows";
import classNames from "classnames";
import {useExpandContent} from "../elements/markup/portals/Tables";
import {useStatefulElementRef} from "../elements/markup/portals/utils";

interface IsaacCodeProps {
    doc: CodeSnippetDTO;
}

const IsaacCodeSnippet = ({doc}: IsaacCodeProps) => {
    const codeSnippetRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (codeSnippetRef.current) {
            hljs.highlightElement(codeSnippetRef.current);
            highlightJsService.addLineNumbers(codeSnippetRef.current);
        }
    }, [doc]);

    const [scrollPromptRef, updateScrollPromptRef] = useStatefulElementRef<HTMLDivElement>();
    const [expandRef, updateExpandRef] = useStatefulElementRef<HTMLDivElement>();
    const {expandButton, innerClasses, outerClasses} = useExpandContent(doc.expandable ?? false, expandRef);

    return <div ref={updateExpandRef} className={classNames("position-relative code-snippet", outerClasses)}>
        {expandButton}
        <div className={innerClasses}>
            {/* ScrollShadows uses ResizeObserver, which doesn't exist on Safari <= 13 */}
            {isCS && window.ResizeObserver && <ScrollShadows element={scrollPromptRef} />}
            <Row>
                <Col>
                <pre ref={updateScrollPromptRef} className="line-numbers">
                    <code ref={codeSnippetRef} className={doc.disableHighlighting ? 'plaintext' : doc.language}>
                        {doc.code}
                    </code>
                </pre>
                </Col>
            </Row>
            {doc.url && <Row>
                <Col className="text-center mb-2">
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">View on GitHub</a>
                </Col>
            </Row>}
        </div>
    </div>
};
export default IsaacCodeSnippet;