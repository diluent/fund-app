import React from 'react'
import { connect, Provider } from 'react-redux'
import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'
import thunk from 'redux-thunk'

/** @module Middleware */

/**
 * Connect a react component with the Redux injecting a state.
 * @param {string|array} name - The name of component.
 * @returns {object} The react component.
 */
export const Connect = function (name) {
    const names = singleOrArrayToArray(name);
    if (!names.length)
        throw new Error('Не указан параметр name = ' + name);

    const mapStateToProps = (state) => [{}, ...names].reduce((obj, el) => ({ ...obj, [el]: state[el] }));
    return connect(mapStateToProps);
}

const CreateStore = function (sagaCollectionListOrSingle, reducerListOrSingle) {
    const sagaCollectionList = singleOrArrayToArray(sagaCollectionListOrSingle);
    const reducerList = singleOrArrayToArray(reducerListOrSingle);
    const sagaList = sagaCollectionList.map(x => x.Sagas.map(s => s()));
    const reducerFromSagasCollectionList = [{}, ...sagaCollectionList].reduce((obj, el) => ({ ...obj, ...el.Reducer }));
    const reducer = [{}, ...reducerList].reduce((obj, el) => ({ ...obj, ...el }));

    if (!sagaCollectionList || sagaCollectionList.length === 0)
        throw new Error('Не верно указан параметр sagaCollection = ' + name);

    const jointReducer = combineReducers({
        ...reducerFromSagasCollectionList,
        ...reducer
    });

    const sagaMiddleware = createSagaMiddleware()
    const composeEnhancers = (!_IS_PROD_ && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;
    const store = createStore(jointReducer, composeEnhancers(
        applyMiddleware(sagaMiddleware, thunk)
    ))
    sagaMiddleware.run(function* () {
        yield sagaList;
    });
    return store;
}

/**
 * Create store based on saga collections and additional reducers.
 * @param {string} name - The name of component.
 * @param {object} The react component.
 * @returns {object} React wrapper component for whole application.
 */
export const StoreProvider = ({sagaCollections, reducers, children}) => {
    const store = CreateStore(sagaCollections, reducers);
    return <Provider store={store}>{children}</Provider>
}

const singleOrArrayToArray = val => {
    if (Array.isArray(val))
        return val;
    if (val)
        return [val];
    return [];
}