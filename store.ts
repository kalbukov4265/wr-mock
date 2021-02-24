import { combineReducers, createStore } from "redux";

export interface Todo {
  req: string;
  url: string;
  response: string;
  status: string;
  delay: string;
  reqPayload: string;
}

export const todos = (state: Todo[] = [], action) => {
    switch (action.type) {
      case 'ADD_TODO':
        return [
          ...state,
          {
            req: action.req,
            url: action.url,
            response: action.response,
            status: action.status,
            delay: action.delay,
            reqPayload: action.reqPayload,
          }
        ]
      case 'CLEAR_TODO':
        return []
      case 'DELETE_ITEM':
        return [
          ...state.filter((e, i) => {
            if (i !== action.index) {
              return e;
            }
          })
        ]
      default:
        return state
    }
}

export const isEdit = (state: boolean = false, action) => {
  switch (action.type) {
    case 'ON_EDIT':
      return true;
    case 'ON_CANCEL':
      return false;
    default:
      return false
  }
}

export const isOpen = (state: boolean = false, action) => {
  switch (action.type) {
    case 'ON_OPEN':
      return true;
    case 'ON_HIDE':
      return false;
    default:
      return false
  }
}

export const addTodo = (req, url, response, status, delay, reqPayload) => ({
  type: 'ADD_TODO',
  req: req,
  url: url,
  response: response,
  status: status,
  delay: delay,
  reqPayload: reqPayload,
});

export const rootReducer = combineReducers({todos});
export const editReducer = combineReducers({isEdit});
export const showReducer = combineReducers({isOpen});
export const store = createStore(rootReducer);
export const isEditState = createStore(editReducer);
export const isShowState = createStore(showReducer);
