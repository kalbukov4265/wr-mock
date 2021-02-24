const styles = require('!raw-loader!./style.css').default;
const formComponent = require('!raw-loader!./form.html').default;
const mainBtnGroupComponent = require('!raw-loader!./mainBtnGroup.html').default;
const editBtnGroupComponent = require('!raw-loader!./editBtnGroup.html').default;

export const form = () => `${formComponent}`;
export const buttonGroupMain = () => `${mainBtnGroupComponent}`;
export const buttonGroupEdit = () => `${editBtnGroupComponent}`;
export const style = `${styles}`;