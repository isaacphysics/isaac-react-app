import React from "react";

// An <a> for the `components` of a <Trans>. Its text comes from the translation, so in the code it is empty,
// which jsx-a11y/anchor-has-content can't see. Rendering children here keeps the rule satisfied without
// disabling it; the output is a plain <a>.
export const TransAnchor = ({ children, ...props }: React.ComponentProps<"a">) => <a {...props}>{children}</a>;
