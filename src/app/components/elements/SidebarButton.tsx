import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AffixButton } from './AffixButton';
import { ButtonProps } from 'reactstrap';
import { selectors, sidebarSlice, useAppDispatch, useAppSelector } from '../../state';
import classNames from 'classnames';

interface SidebarButtonProps extends ButtonProps {
    buttonTitle?: string;
}

export const SidebarButton = ({ buttonTitle, ...rest }: SidebarButtonProps) => {
    const dispatch = useAppDispatch();
    const [sticky, setSticky] = useState(false);
    const mainContentId = useAppSelector(selectors.mainContentId.orDefault);
    const mainContent = document.getElementById(mainContentId);
    const textRef = useRef<HTMLSpanElement>(null);

    const toggleMenu = () => dispatch(sidebarSlice.actions.toggle());

    const isSticky = useCallback(() => {
        setSticky(!!mainContent && window.scrollY >= mainContent.offsetTop);
    }, [mainContent]);

    useEffect(() => {
        window.addEventListener('scroll', isSticky);
        return () => {
            window.removeEventListener('scroll', isSticky);
        };
    }, [isSticky]);

    return <AffixButton 
        {...rest} 
        data-testid="sidebar-toggle" 
        className={classNames("sidebar-toggle", {"stuck": sticky}, rest.className)} 
        color="keyline" 
        onClick={toggleMenu} 
        affix={{
            affix: "icon-sidebar",
            position: "prefix",
            type: "icon",
        }}
        style={{maxWidth: textRef?.current ? `${(!sticky ? textRef.current.clientWidth + 8 : 0) + 59}px` : "max-content"}}
    >
        <span ref={textRef}>{buttonTitle ?? "Search and filter"}</span>
    </AffixButton>;
};
