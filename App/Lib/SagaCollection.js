import { takeEvery, put, take } from 'redux-saga/effects'

/** @module Middleware */

/**
 * Saga effect for syncronous callштп asyncronous saga and retrieving result.
 * @param {string} type
 * @param {object} params
 * @returns {object} Failure ofr successful response.
 */
export const callSync = function* (type, params) {
    if(!type)
        throw new Error('Не указан тип операции');
    yield put({ type, ...params });
    return yield take([`${type}_SUCCESS`, `${type}_FAILURE`]);
}

export class SagaCollection {

    /**
     * SagaCollection
     * @param {string} componentName
     * @param {object} defaultState
     */
    constructor(componentName, defaultState) {
        this['componentName'] = componentName;
        this['defaultState'] = defaultState;
        this['sagas'] = [];
        this['sagaWatchers'] = [];
        this['types'] = {};
        this['mapAction'] = {};
    }

    /**
     * @return {string} Имя компонента
     */
    get ComponentName() {
        return this['componentName'];
    }

    /**
     * @return {array} Список зарегистрированных саг
     */
    get Sagas() {
        return this['sagaWatchers'];
    }

    // get Types() {
    //     return this['types'];
    // }

    /**
     * @return {object} reducer - Возвращает объект с одной функцией { [componentName]: (state, action) => { ... } }
     */
    get Reducer() {
        return {
            [this['componentName']]: (state = this['defaultState'], action) => {
                const t = this['types'][action.type];
                if (!t) return state;
                const newAction = t.mapAction ? t.mapAction(action) : action;
                const { type, ...actionData } = newAction;
                const result = { ...state, ...actionData };
                return result;
            }
        }
    }

    /**
     * Регистрация саги
     * @param {string} type - Уникальное имя, используется как action type
     * @param {object} param 
     * @param {function} param.mapAction - преобразование экшена перед обработкой редюсером
     * @param {object} param.saga - Функция генератор, срабатывающая на экшен. 
     *                              ВНИМАНИЕ! Обязательно внутри вызвать экшен TYPE_FAILURE или TYPE_SUCCESS как результат.
     *                              В this биндится необходимое внутреннее состояние саги и всей коллекции: { TYPE, TYPE_SUCCESS, TYPE_FAILURE, componentName, sagas }
     */
    add(type, { mapAction, saga}) {
        const watch = true;
        this._addType(type, mapAction, saga);
        saga && this._addSaga(type, watch, saga);
        return this;
    }

    _addType(type, mapAction = () => ({}), saga) {
        if (this['types'][type])
            throw new Error('Тип ' + type + ' уже был объявлен');//todo ошибки между коллекциями
        this['types'][type] = { mapAction };
        if (saga) {
            this['types'][type + '_SUCCESS'] = {};
            this['types'][type + '_FAILURE'] = {};
            this['types'][type + '_ALTER'] = {};
        }
    }

    _addSaga(type, watch, saga) {
        const params = {
            TYPE: type,
            TYPE_SUCCESS: type + '_SUCCESS',
            TYPE_FAILURE: type + '_FAILURE',
            TYPE_ALTER: type + '_ALTER',
            defaultState: this['defaultState'],
            componentName: this['componentName'],
            sagas: this['sagas']
        }
        saga = saga.bind(params);
        this['sagas'][type] = saga;

        if (watch)
            this['sagaWatchers'].push(function* () {
                yield takeEvery(type, saga);
            })
    }
}