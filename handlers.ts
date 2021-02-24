import { rest } from 'msw';
import { worker } from './index';
import { addTodo, store } from './store';

export let handlers = [];

export function checkSavedRouts() {
  if (localStorage.getItem('WR-ROUTS')) {
    const data: Object = JSON.parse(localStorage.getItem('WR-ROUTS'));
    Object.keys(data).forEach(e => {
      const params = JSON.parse(data[e]);
      store.dispatch(addTodo(params[0], params[1], params[2], params[3], params[4], params[5]));
      handlers.push(
        rest[params[0]](params[1], (req, res, ctx) => {   
          return res(
            ctx.set('Content-Type', 'application/vnd.softswiss.v1+json'),
            ctx.delay(Number(params[4])),
            ctx.status(Number(params[3])),
            ctx.json(_parseResponse(params[2]))
          );
        })
      );
    });
    worker.resetHandlers(...handlers);
  }
}

export function addRouteNew(req: string = 'get', url: string, response: string = '{}', status: string = '200', delay: string = '1000', reqPayload: string = '{}',) {
  const keyUrl = _generateKey(req, url, response, status, delay, reqPayload);
  if (localStorage.getItem('WR-ROUTS')) {
    const data = JSON.parse(localStorage.getItem('WR-ROUTS'));
    data[keyUrl] = JSON.stringify(arguments);
    localStorage.setItem('WR-ROUTS', JSON.stringify(data)); 
  } else {
    localStorage.setItem('WR-ROUTS', JSON.stringify({[keyUrl]: JSON.stringify(arguments)})); 
  }
  store.dispatch(addTodo(req, url, response, status, delay, reqPayload));
  handlers.push(
    rest[req](url, (req, res, ctx) => {   
      return res(
        ctx.set('Content-Type', 'application/vnd.softswiss.v1+json'),
        ctx.delay(Number(delay)),
        ctx.status(Number(status)),
        ctx.json(_parseResponse(response))
      );
    })
  );
  worker.resetHandlers(...handlers);
}

export function deleteRoute(index) {  
  if (localStorage.getItem('WR-ROUTS')) {
    const item = store.getState().todos[index];
    const keyUrl = _generateKey(item.req, item.url, item.response, item.status, item.delay, item.reqPayload);
    const data = JSON.parse(localStorage.getItem('WR-ROUTS'));
    delete data[keyUrl];
    localStorage.setItem('WR-ROUTS', JSON.stringify(data));
  }
  store.dispatch({type: 'DELETE_ITEM', index: index});
  handlers = handlers.filter((e, i) => {
    if (i !== index) {
      return e;
    }
  })
  worker.resetHandlers(...handlers);
}

export function editRoute(index, req: string = 'get', url: string, response: string = '{}', status: string = '200', delay: string = '1000', reqPayload: string = '{}') {
  const newKeyUrl = _generateKey(req, url, response, status, delay, reqPayload);
  const item = store.getState().todos[index];
  const keyUrl = _generateKey(item.req, item.url, item.response, item.status, item.delay, item.reqPayload);
  if (keyUrl === newKeyUrl) {
    return;
  }
  if (localStorage.getItem('WR-ROUTS')) {    
    const data = JSON.parse(localStorage.getItem('WR-ROUTS'));
    delete data[keyUrl];
    const newArguments = [...arguments];
    newArguments.shift();  
    data[newKeyUrl] = JSON.stringify(Object.assign({}, newArguments));
    localStorage.setItem('WR-ROUTS', JSON.stringify(data)); 
  }
  // add new
  store.dispatch(addTodo(req, url, response, status, delay, reqPayload));
  handlers.push(
    rest[req](url, (req, res, ctx) => {   
      return res(
        ctx.set('Content-Type', 'application/vnd.softswiss.v1+json'),
        ctx.delay(Number(delay)),
        ctx.status(Number(status)),
        ctx.json(_parseResponse(response))
      );
    })
  );
  // delete old
  store.dispatch({type: 'DELETE_ITEM', index: index});
  handlers = handlers.filter((e, i) => {
    if (i !== index) {
      return e;
    }
  })
  worker.resetHandlers(...handlers);
}

function _generateKey(req: string = 'get', url: string, response: string = '{}', status: string = '200', delay: string = '1000',  reqPayload: string = '{}') {
  return req + '[[' + url.replace(/\//gi, '-') + ']]' + '[[' + response + ']]' + status + delay + '[[' + reqPayload + ']]';
}

function _parseResponse(response: string) {
  if (response && typeof response === 'string') {
    try {      
      return JSON.parse(response);
    } catch (error) {
      return response;
    }
  }
}