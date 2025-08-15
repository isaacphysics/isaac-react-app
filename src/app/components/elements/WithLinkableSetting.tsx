import React, {useEffect, useRef} from "react";
import {useLinkableSetting} from "../../services/linkableSetting";
import classnames from "classnames";

export const WithLinkableSetting = (props: React.ComponentProps<"div">) => {
    const {linkedSettingId, setLinkedSettingSeen, clearLinkedSetting} = useLinkableSetting();

    const isLinkedSetting = props.id === linkedSettingId;
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (isLinkedSetting) {
            setLinkedSettingSeen();
            if (ref.current) {
                window.scrollTo({top: ref.current.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth'});
            }
        }
    }, [isLinkedSetting, setLinkedSettingSeen, ref]);

    function handleClick(event: React.MouseEvent<HTMLDivElement>) {
        // If clicked, clear the highlighting as it's likely done its job.
        clearLinkedSetting();
        if (props.onClick) {
            // This ensures we don't mask any other onClick behaviour.
            props.onClick(event);
        }
    }

    return <div {...props} className={classnames(props.className, {"highlight-target": isLinkedSetting})} onClick={handleClick} ref={ref}>
        {props.children}
    </div>;
};
