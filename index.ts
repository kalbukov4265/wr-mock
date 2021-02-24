import { setupWorker } from "msw";
import { isEditState, isShowState, store } from "./store";
import { form, buttonGroupEdit, style, buttonGroupMain } from "./components/components";
import { handlers, addRouteNew, checkSavedRouts, deleteRoute, editRoute } from "./handlers";
export const worker = setupWorker(...handlers);

let reqType, reqUrl, reqPayload , reqResponse, reqStatus, reqDelay, editableIndex;
let showHide = false;

function main() {
    window['wrMock'] = {};
    worker.start({
        serviceWorker: {
            url: '/mockServiceWorker.js'
        }
    });

    checkSavedRouts();
    createToDo();
    runStore();
    
    window['wrMock'][deleteItem.name] = deleteItem;
    window['wrMock'][onEditItem.name] = onEditItem;

    document.getElementById("wr-import").onclick = () => importSettings();
    document.getElementById("wr-export").onclick = () => exportSettings();
}

function runStore() {
    renderList();
    btnGroup();
    showHideToggle();
    store.subscribe(() => {
        renderList();
    });
    isEditState.subscribe(() => {
        btnGroup();  
    });
    isShowState.subscribe(() => {
        showHideToggle();
    });
}

function createToDo() {
    const tpl = `
    <style>${style}</style>
    <div id="wr-form-open-btn">http<br>mock</div>
    <div id="wr-mock">
    <div id="wr-mock-hide">x</div>
    ${form()}
    <div id="wr-btn-group"></div>
    <ul id="wr-todos"></ul>
    </div>`;
    const mockForm = document.createElement('div');
    mockForm.id = 'wr-mock-app';
    mockForm.innerHTML = tpl;
    document.body.appendChild(mockForm);
    reqType = (document.getElementById("req-type") as HTMLInputElement);
    reqUrl = (document.getElementById("req-url") as HTMLInputElement);
    reqPayload = (document.getElementById("req-payload") as HTMLInputElement);
    reqResponse = (document.getElementById("req-response") as HTMLInputElement);
    reqStatus = (document.getElementById("req-status") as HTMLInputElement);
    reqDelay = (document.getElementById("req-delay") as HTMLInputElement);
    document.getElementById("wr-form-open-btn").onclick = () => {
        isShowState.dispatch(!isShowState.getState().isOpen ? {type: 'ON_OPEN'} : {type: 'ON_HIDE'})  
    };
    document.getElementById("wr-mock-hide").onclick = () => {
        isShowState.dispatch(!isShowState.getState().isOpen ? {type: 'ON_OPEN'} : {type: 'ON_HIDE'})  
    };
}

function renderList() {    
    let reqType = document.getElementById("wr-todos");
    reqType.innerHTML = "";
     store.getState().todos.forEach((e, i) => {
        reqType.innerHTML += `<li title="${_resolveTitle(e)}">
        <div class="link-data"><b>${e.req.toUpperCase()}</b> | <span>${e.url}</span> | <b>status</b>: ${e.status} </div>
        <div class="link-action">
            <button class="btn edit" onclick="wrMock.${onEditItem.name}(${i})">edit</button>
            <button class="btn delete" onclick="wrMock.${deleteItem.name}(${i})">delete</button>
        </div>
        </li>`;
    });
    if (!store.getState().todos.length) {
        reqType.innerHTML = "<li>Add your endpoints!</li>";
    }
}

function _resolveTitle(e) {
    const title = `
    Method: ${e.req} 
Url: ${e.url}
Response Status: ${e.status}
Response: ${e.response}
    `;
    return title;
}

function addItem() {
    if (!reqUrl.value || !reqResponse.value) {
        alert("You must write something!");
    } else {
        addRouteNew(reqType.value, reqUrl.value, reqResponse.value, reqStatus.value, reqDelay.value, reqPayload.value);
        _defaultFormValue();
    }
}

function clearAll() {
    const confirmDelete = confirm("Delete all endpoints?");
    if (confirmDelete) {
        store.dispatch({type: 'CLEAR_TODO'});
        if (localStorage.getItem('WR-ROUTS')) {
            localStorage.setItem('WR-ROUTS', '{}');
        }
    }
}

function deleteItem(index) {    
    deleteRoute(index);
}

function editItem() {
    if (!reqUrl.value || !reqResponse.value) {
        alert("You must write something!");
    } else {
        editRoute(editableIndex, reqType.value, reqUrl.value, reqResponse.value, reqStatus.value, reqDelay.value, reqPayload.value);
        isEditState.dispatch({type: 'ON_CANCEL'});
        editableIndex = null;
        _defaultFormValue();
    }
}

function onEditItem(index) {
    isEditState.dispatch({type: 'ON_EDIT'});
    editableIndex = index;
    const item = store.getState().todos[index];
    reqType.value = item.req;
    reqUrl.value = item.url;
    reqResponse.value = item.response;
    reqStatus.value = item.status;
    reqDelay.value = item.delay;
    reqPayload.value = item.reqPayload;
}

function cancelEditItem() {
    isEditState.dispatch({type: 'ON_CANCEL'});
    editableIndex = null;
    _defaultFormValue();
}

function btnGroup() {    
    if (isEditState.getState().isEdit) {
        document.getElementById("wr-btn-group").innerHTML = buttonGroupEdit();
        document.getElementById("wr-save").onclick = () => editItem();
        document.getElementById("wr-cancel").onclick = () => cancelEditItem();
    } else {
        document.getElementById("wr-btn-group").innerHTML = buttonGroupMain();
        document.getElementById("wr-save").onclick = () => addItem();
        document.getElementById("wr-clear").onclick = () => clearAll();
    }
}

function _defaultFormValue() {
    reqType.value = 'get';
    reqUrl.value = '';
    reqResponse.value = '';
    reqStatus.value = '200';
    reqDelay.value = '1000';
    reqPayload.value = '';
}

function exportSettings() {
    if (localStorage.getItem('WR-ROUTS') && store.getState().todos.length) {
        const data = _encode(JSON.stringify(JSON.parse(localStorage.getItem('WR-ROUTS')), null, 4));        
        const blob = new Blob( [ data ], {
            type: 'application/octet-stream'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        const date = new Date()
        link.setAttribute('download', `mockEndpoints${'-' + date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear()}.json`);
        const event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
        link.dispatchEvent(event);
    } else {
        alert("Nothing to export!");
    }
}

function importSettings() {
    const inputFile = document.getElementById('wr-import-file') as HTMLInputElement;
    inputFile.click();
    inputFile.addEventListener('change', (e) => {
        const targetFile = e.target as HTMLInputElement;
    	const files = targetFile.files;
        const reader = new FileReader();        
        reader.onload = (e) => {
            try {
                store.dispatch({type: 'CLEAR_TODO'});
                if (localStorage.getItem('WR-ROUTS')) {
                    localStorage.setItem('WR-ROUTS', '{}');
                }
                const result = e.target.result as string;
                localStorage.setItem('WR-ROUTS', result);
                checkSavedRouts();
            } catch (ex) {
                alert('ex when trying to parse json = ' + ex);
            }
        }
        reader.readAsText(files[0]);  
    }, false);
}

function _encode(s) {
    var out = [];
    for ( var i = 0; i < s.length; i++ ) {
        out[i] = s.charCodeAt(i);
    }
    return new Uint8Array(out);
}

function showHideToggle() {    
    if (isShowState.getState().isOpen) {
        document.getElementById("wr-form-open-btn").style.display = 'none';
        document.getElementById("wr-mock").classList.add('show');
        document.getElementById("wr-mock").classList.remove('hide');
    } else {
        document.getElementById("wr-form-open-btn").style.display = 'flex';
        document.getElementById("wr-mock").classList.add('hide');
        document.getElementById("wr-mock").classList.remove('show');
    }
}

main();
