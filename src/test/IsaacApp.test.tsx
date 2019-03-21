import React from 'react';
import ReactDOM from 'react-dom';
import IsaacApp from '../app/IsaacApp';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<IsaacApp />, div);
  ReactDOM.unmountComponentAtNode(div);
});
