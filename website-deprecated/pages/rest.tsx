// import http from 'http';
import getStream from 'get-stream';
import { useSofa, createSofaRouter, OpenAPI } from 'sofa-api';
// import { gql, useQuery } from '@apollo/client'
// import { makeExecutableSchema } from '@graphql-tools/schema';
import { schema } from './api/graphql'

// TODO: use SOFA for OpenAPI https://github.com/Urigo/SOFA/blob/master/example/index.ts
// Add CORS support: https://github.com/Urigo/SOFA/issues/141

// A solution for sofa would be to use express + React app
// SearchKit with Express: https://github.com/searchkit/searchkit/blob/next/examples/with-express/index.js
// Apollo Express with Sofa: https://github.com/maapteh/graphql-modules-app/blob/master/packages/server/src/server.ts
// Sofa official example: https://github.com/Urigo/SOFA/blob/master/example/index.ts
// React with express: https://levelup.gitconnected.com/how-to-render-react-app-using-express-server-in-node-js-a428ec4dfe2b
// SearchKit with React: https://github.com/searchkit/searchkit/tree/next/examples/create-react-app
// Example to serve React with Express: https://github.com/myogeshchavan97/express-static-serve/
// Article to serve React with Express: https://medium.com/@lowewenzel/serving-express-with-a-react-single-page-app-within-the-same-application-c168f1c44201

const invokeSofa = createSofaRouter({
  basePath: '/rest',
  schema,
  // onRoute(info) {
  //   openApi.addRoute(info, {
  //     basePath: '/api',
  //   });
  // },
});

const handleSofa = async (req: any, res: any) => {
  try {
    const response = await invokeSofa({
      method: req.method,
      url: req.url,
      body: JSON.parse(await getStream(req)),
      contextValue: {
        req
      },
    });
    // if (response) {
    //   const headers = {
    //     'Content-Type': 'application/json',
    //   };
    //   if (response.statusMessage) {
    //     res.writeHead(response.status, response.statusMessage, headers);
    //   } else {
    //     res.writeHead(response.status, headers);
    //   }
    //   if (response.type === 'result') {
    //     res.end(JSON.stringify(response.body));
    //   }
    //   if (response.type === 'error') {
    //     res.end(JSON.stringify(response.error));
    //   }
    // } else {
    //   res.writeHead(404);
    //   res.end();
    // }
    return response
  } catch (error) {
    console.log("Error with SOFA")
    // res.writeHead(500);
    // res.end(JSON.stringify(error));
  }
};

export default handleSofa