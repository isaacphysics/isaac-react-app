import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AffixButton } from './AffixButton';
import { ButtonProps } from 'reactstrap';
import { sidebarSlice, useAppDispatch } from '../../state';
import classNames from 'classnames';
import { siteSpecific } from '../../services';
import { Spacer } from './Spacer';

interface SidebarButtonProps extends ButtonProps {
    buttonTitle?: string;
    absolute?: boolean; // if true, a 0-width wrapper performs the sticky behaviour, while the button is positioned absolutely; used to position button over the title
}

export const SidebarButton = ({ buttonTitle, absolute, ...rest }: SidebarButtonProps) => {
    const dispatch = useAppDispatch();
    const [sticky, setSticky] = useState(false);
    const elementRef = useRef<HTMLElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);

    const toggleMenu = () => dispatch(sidebarSlice.actions.toggle());

    const isSticky = useCallback(() => {
        setSticky(!!elementRef.current && window.scrollY >= elementRef.current.offsetTop - 36);
    }, [elementRef]);

    useEffect(() => {
        window.addEventListener('scroll', isSticky);
        return () => {
            window.removeEventListener('scroll', isSticky);
        };
    }, [isSticky]);

    const button = siteSpecific(
        <AffixButton 
            {...rest} 
            data-testid="sidebar-toggle" 
            innerRef={absolute ? undefined : elementRef as React.RefObject<HTMLButtonElement>}
            className={classNames("sidebar-toggle no-print", {"sidebar-toggle-top": !absolute, "stuck": sticky}, rest.className)} 
            color="keyline" 
            onClick={toggleMenu} 
            affix={{
                affix: "icon-sidebar",
                position: "prefix",
                type: "icon",
                affixClassName: "icon-inline me-2"
            }}
            style={{maxWidth: textRef?.current ? `${(!sticky ? textRef.current.clientWidth + 8 : 0) + 61}px` : "max-content"}}
        >
            <span ref={textRef}>{buttonTitle ?? "Search and filter"}</span>
        </AffixButton>,
        <button
            {...rest}
            data-testid="sidebar-toggle"
            className={classNames("sidebar-toggle w-100 d-flex no-print", rest.className)}
            onClick={toggleMenu}
        >
            <span ref={textRef}>{buttonTitle}</span>
            <Spacer />
            <i className="icon icon-chevron-right icon-inline-sm" />
        </button>
    );

    return absolute
        ? <div className="sidebar-toggle-top" ref={elementRef as React.RefObject<HTMLDivElement>}>
            {button}
        </div>
        : button;
};
