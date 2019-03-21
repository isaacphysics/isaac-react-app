import React from "react";

import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";

export const IsaacMultiChoiceQuestion = ({doc: {value, encoding, children, choices}}: any) => {
    return (
        <div>
            <h3>
                <IsaacContentValueOrChildren value={value} encoding={encoding} children={children} />
            </h3>
            <ul>
                {choices.map((choice: any, index: number) =>
                    <li key={index}>
                        <input type="radio" />
                        <label>
                            <IsaacContentValueOrChildren value={choice.value} encoding={encoding} children={[]}/>
                        </label>
                    </li>
                )}
            </ul>
        </div>
    );
};
