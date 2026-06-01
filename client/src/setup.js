
import '@testing-library/jest-dom';
import Modal from 'react-modal';

global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

if (typeof document !== 'undefined') {
    Modal.setAppElement(document.body);
}
