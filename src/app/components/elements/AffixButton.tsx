import React, { ReactNode } from "react";
import { Button, ButtonProps } from "reactstrap";
import { Spacer } from "./Spacer";

export interface AffixButtonProps extends ButtonProps {
    affix: ReactNode;
    affixType?: "prefix" | "postfix";
}

export const AffixButton = (props: AffixButtonProps) => {
    const { affix, affixType, children, ...rest } = props;
    return <Button {...rest}>
        {affixType !== "postfix" && <>
            {affix}
            <Spacer/>
        </>}
        {children}
        {affixType === "postfix" && <>
            <Spacer/>
            {affix}
        </>}
    </Button>;
};
