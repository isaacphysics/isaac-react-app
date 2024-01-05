import React, {useEffect} from "react"

interface AlertInterface {
    title: string,
    body: string
}

export const Alert = ({title, body} : AlertInterface) => {

    useEffect(() => {
        window.scrollTo(0, 0)
    }, []);

    {/*todo: this is taken straight from the RPF design system - reconcile with ReactStrap Alert*/}
    return <div className="rpf-alert rpf-alert--warning">
        <span className="rpf-alert__icon material-symbols-sharp"></span>
        <div className="rpf-alert__body">
            <p className="rpf-alert__title font-weight-bold">{title}</p>
            <p className="my-1">
                {body}
            </p>
        </div>
    </div>
}