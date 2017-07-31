import { ActionObject } from '../types'
import { LogDialogState } from '../types'
import { LogDialog } from 'blis-models'
import { Reducer } from 'redux'

const initialState: LogDialogState = {
    all: [],
    current: null
};

const logDialogsReducer: Reducer<LogDialogState> =  (state = initialState, action: ActionObject) => {
    switch (action.type) {
        case 'FETCH_LOG_DIALOGS':
            return { ...state, all: action.allLogDialogs };
        case "EMPTY_STATE_PROPERTIES": 
            return {...state, all: []};
        case 'CREATE_LOG_DIALOG':
            return { ...state, all: [...state.all, action.logDialog], current: action.logDialog };
        case 'SET_CURRENT_LOG_DIALOG':
            return { ...state, current: action.currentLogDialog };
        case "TOGGLE_LOG_DIALOG":
            let index: number = 0;
            for (let i = 0; i < state.all.length; i++) {
                if (state.all[i].logDialogId == state.current.logDialogId) {
                    index = i
                }
            }
            if (index == 0) {
                if (action.forward === false) {
                    return { ...state, current: state.all[state.all.length - 1] }
                }
            }
            if (index == state.all.length - 1) {
                if (action.forward === true) {
                    return { ...state, current: state.all[0] }
                }
            }
            let newState: LogDialogState;
            if (action.forward === true) {
                newState = { ...state, current: state.all[index + 1] }
            } else {
                newState = { ...state, current: state.all[index - 1] }
            }
            return newState;
        case 'DELETE_LOG_DIALOG':
        // return [...state, action.payload];
        case 'EDIT_LOG_DIALOG':
        // return [...state, action.payload];
        default:
            return state;
    }
}
export default logDialogsReducer;