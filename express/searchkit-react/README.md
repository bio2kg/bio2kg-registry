### Searchkit React App

## Development

On http://localhost:3000

```bash
yarn
yarn dev
```

You can set the ElasticSearch endpoint with an environment variable:

```bash
export ELASTIC_URL=http://localhost:4000/graphql
```

File structure:

* Most React component are in `src/` folder
* The `index.html` is in `public`

## Production

```bash
yarn build
yarn serve
```