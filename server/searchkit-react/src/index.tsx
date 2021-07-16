import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import '@elastic/eui/dist/eui_theme_light.css'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { SearchkitProvider, SearchkitClient } from '@searchkit/client'
import App from './App';
// import './index.css';

// const GRAPHQL_URL = process.env.GRAPHQL_URL || 'https://registry.bio2kg.org/graphql'
const GRAPHQL_URL = process.env.GRAPHQL_URL || '/graphql'
// Env not working, use this to switch in full dev:
// const GRAPHQL_URL = process.env.GRAPHQL_URL || 'http://localhost:4000/graphql'

const client = new ApolloClient({
  uri: GRAPHQL_URL,
  cache: new InMemoryCache()
});

console.log(GRAPHQL_URL);

const skClient = new SearchkitClient()

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client} >
      <SearchkitProvider client={skClient}>
        <Router>
          <Switch>
            <Route path="/">
              <App />
            </Route>
          </Switch>
        </Router>
      </SearchkitProvider>
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
