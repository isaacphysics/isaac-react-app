import React, { AnchorHTMLAttributes } from "react";
import { AffixButton } from "./AffixButton";

interface ExternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    asButton?: boolean;
}

export const ExternalLink = ({href, children, asButton, ...rest}: ExternalLinkProps) => {
    return asButton ?
        <AffixButton affix={{type: "icon", affix: {name: "icon-external-link", color: "white"}, position: "suffix"}} tag={({children, className}) => ExternalLink({...rest, href, children, className})}> 
            {children}
        </AffixButton> :
        <a {...rest} href={href} target="_blank" rel="noopener">
            {children}
        </a>;
};
