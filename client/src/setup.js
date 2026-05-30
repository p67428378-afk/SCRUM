import '@testing-library/jest-dom';
import Modal from 'react-modal';
global.ResizeObserver = class ResizeObserver { observe(){} unobserve(){} disconnect(){} };
Modal.setAppElement(document.body);
