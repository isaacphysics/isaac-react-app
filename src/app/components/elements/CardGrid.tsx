import React from 'react';
import { Container, ContainerProps, Row } from 'reactstrap';
import { below, useDeviceSize } from '../../services';

export const CardGrid = (props: ContainerProps) => {
    const deviceSize = useDeviceSize();
    const width = deviceSize === 'xs' ? 1 : below['md'](deviceSize) ? 2 : 3;
    if (!props.children || !Array.isArray(props.children)) return null;
    const rows = [];

    for (let i = 0; i < Math.ceil(props.children.length / width); i++) {
        rows.push(<Row className={`card-grid-${deviceSize}`}>
            {props.children.slice(i * width, (i + 1) * width)}
        </Row>);
    }

    return <Container {...props}>
        {rows}
    </Container>;
};
