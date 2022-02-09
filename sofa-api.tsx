import { createSofaRouter, OpenAPI } from 'sofa-api';
import { schema } from './api/graphql'
// import getStream from 'get-stream';

// const openApi = OpenAPI({
//   schema,
//   info: {
//     title: 'Bio2KG Registry API',
//     description: 'RESTful API to access a registry of datasets of relevance to the life sciences. The registry contains dataset metadata, and assigns namespaces, identifier patterns, and URL templates for link outs.',
//     version: '3.0.0',
//   },
// });

// See https://github.com/Urigo/SOFA

const invokeSofa = createSofaRouter({
  basePath: '/  ',
  schema,
  // onRoute(info) {
  //   openApi.addRoute(info, {
  //     basePath: '/api',
  //   });
  // },
});

const handleSofa = async (req: any, res: any) => {
  try {
    // const response = await invokeSofa({
    //   method: req.method,
    //   url: req.url,
    //   body: JSON.parse(await getStream(req)),
    //   contextValue: {
    //     req
    //   },
    // });
    // return response
    console.log("No SOFA")
  } catch (error) {
    console.log("Error with SOFA")
  }
};

export default handleSofa