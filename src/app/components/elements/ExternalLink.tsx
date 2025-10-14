import React from "react";

export const ExternalLink = ({href, children, className = ""}: { href: string; children: any; className?: string }) => (
    <a href={href} target="_blank" rel="noopener" className={className}>
        {children}
    </a>
);