import { AppState } from '../types'
import { ActionObject } from '../types'
import { AT } from '../types/ActionTypes'
import { Reducer } from 'redux'

const initialState: AppState = {
    all: [],
    current: null
};

const appsReducer: Reducer<AppState> = (state = initialState, action: ActionObject) => {
    switch (action.type) {
        case AT.LOGOUT:
            return { ...initialState };
        case AT.FETCH_APPLICATIONS_FULFILLED:
            return { ...state, all: action.allBlisApps };
        case AT.CREATE_BLIS_APPLICATION_FULFILLED:
            let newApp = {...action.blisApp, appId: action.blisAppId};
            return { ...state, current: newApp, all: [...state.all, newApp]};
        case AT.SET_CURRENT_BLIS_APP_FULFILLED:
            return { ...state, current: action.currentBLISApp };
        case AT.DELETE_BLIS_APPLICATION_FULFILLED:
            return { ...state, all: state.all.filter(app => app.appId !== action.blisAppGUID) };
        case AT.EDIT_BLIS_APPLICATION_FULFILLED:
            let index: number = 0;
            for (let i = 0; i < state.all.length; i++) {
                if (state.all[i].appId == action.blisApp.appId) {
                    index = i
                }
            }
            let newAll = Object.assign([], state.all);
            newAll[index] = action.blisApp;
            let stateToReturn: AppState = {
                all: newAll,
                current: action.blisApp
            }
            return stateToReturn
        default:
            return state;
    }
}
export default appsReducer;