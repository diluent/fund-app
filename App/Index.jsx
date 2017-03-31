import React from 'react';
import { render } from 'react-dom';
import { Router, Route, IndexRedirect, IndexRoute, browserHistory } from 'react-router';
import { StoreProvider } from 'ozon-ui-common/lib/Middleware';



render((
    <StoreProvider sagaCollections={Actions} reducers={List.Reducer}>
        <Router history={browserHistory}>
            <Route path={`${_ROOT_URL_}/login`} component={AuthForm} />
            <Route path={_ROOT_URL_} component={Layout}>
                <IndexRedirect to='list' />
                <Route path='list' component={List.Component} />
                <Route path='new' component={New} />
                <Route path='edit/:RequestID' component={Edit} />
            </Route>
            <Route path='*' component={Error404} />
        </Router>
    </StoreProvider>
), document.getElementById('AppContainer'));