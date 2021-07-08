// import http from 'http';
import getStream from 'get-stream';
import { useSofa, createSofaRouter, OpenAPI } from 'sofa-api';
// import { gql, useQuery } from '@apollo/client'
// import { makeExecutableSchema } from '@graphql-tools/schema';
import { schema } from './api/graphql'

// TODO: use SOFA for OpenAPI https://github.com/Urigo/SOFA/blob/master/example/index.ts
// Add CORS support: https://github.com/Urigo/SOFA/issues/141


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