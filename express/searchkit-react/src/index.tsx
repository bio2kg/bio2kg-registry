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

let GRAPHQL_URL = 'https://registry.bio2kg.org/api/graphql'
if (process.env.GRAPHQL_URL) {
  // Get URL provided via environment variable
  GRAPHQL_URL = process.env.GRAPHQL_URL
  console.log("Using GraphQL endpoint: " + GRAPHQL_URL)
}

const client = new ApolloClient({
  uri: GRAPHQL_URL,
  cache: new InMemoryCache()
});

const skClient = new SearchkitClient()

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client} >
      <SearchkitProvider client={skClient}>
        <Router>
          <Switch>
            {/* <Route path="/custom">
              <CustomApp />
            </Route> */}
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
