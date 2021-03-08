import {CodeDTO} from "../../../IsaacApiTypes";
import React, {useEffect} from "react";
import {Col, Row} from "reactstrap";
import {Tabs} from "../elements/Tabs";
import {fromPairs} from "lodash";

import hljs from 'highlight.js';

interface IsaacCodeProps {
    doc: CodeDTO;
}

export const IsaacCode = ({doc}: IsaacCodeProps) => {
    useEffect(() => {
        hljs.highlightAll();
    }, [doc]);


    console.log(doc);

    return <div className="tabbed-code mt-2 mb-3">
        {doc.code && <Tabs>
            {fromPairs(Object.values(doc.code).sort((a, b) => a.title > b.title ? 1 : -1).map(codeSection => {
                // eslint-disable-next-line react/jsx-key
                return [codeSection.title, <React.Fragment>
                    <Row>
                        <Col className="code-block">
                            <pre className="line-numbers">
                                <code className={`${codeSection.title}`}>
                                    {codeSection?.children[0].value}
                                </code>
                            </pre>
                        </Col>
                    </Row>
                    {codeSection?.children[1]?.value && <Row>
                        <Col className="align-self-center text-center">
                            <a href={codeSection?.children[1]?.value} target="_blank" rel="noopener noreferrer">{codeSection.title} source</a>
                        </Col>
                    </Row>}
                </React.Fragment>]
            }))}
        </Tabs>

        }
    </div>
};
