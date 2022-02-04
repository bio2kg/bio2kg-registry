import React, { FunctionComponent } from 'react';
// import { EuiSpacer, EuiText, EuiTitle } from '@elastic/eui';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { gql, useQuery } from '@apollo/client'
import { useState } from 'react'

import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Container, Typography, Tooltip, Chip, Paper, Button, CircularProgress  } from "@mui/material";
import HomeIcon from '@mui/icons-material/FormatListBulleted';

import withApollo from '../../hocs/withApollo'
// import { withSearchkit, withSearchkitRouting } from '@searchkit/client'
// import dynamic from 'next/dynamic'
// const Dataset = dynamic(() => import('../components/index'), { ssr: true })

//  const DynamicDataset = dynamic(
//   () => import('@elastic/eui').then((mod) => Dataset()),
//   { ssr: false, })

const Dataset = () => {
  const theme = useTheme();
  const router = useRouter();


  const useStyles = makeStyles(() => ({
    link: {
      color: theme.palette.primary.dark,
      textDecoration: 'none',
      // color: 'inherit',
      '&:hover': {
        color: theme.palette.primary.main,
        textDecoration: 'none',
      },
    },
    text: {
      paddingBottom: theme.spacing(1),
      // margin: theme.spacing(3, 0),
    },
    paperPadding: {
      padding: theme.spacing(2, 2),
      margin: theme.spacing(2, 0),
    },
    linkButton: {
      textTransform: 'none',
      textDecoration: 'none',
    },
  }))
  const classes = useStyles();


  // `asPath` gives is the path as seen in the browser location bar. The `slug`
  // parameter from this file's name can be found under `router.query.slug`.
  const datasetId = router.asPath.split('/').pop() ?? '';
  // const datasetId = router.asPath.split('/')[router.asPath.split('/').length - 1] ?? '';
  // const datasetId = '3did'

  const title = `${datasetId} - Bio2KG registry`;

  const graphqlQuery = gql`
  query resultSet {
    results (
      query: "${datasetId}"
      ){
      hits {
        items {
          ... on RegistryEntry {
            id
            fields {
              title
              description
              organization
              type
              keywords
              homepage
              yearLastAccessible
              waybackUrl
            
              preferredPrefix
              identifiersPrefix
              altPrefix
              providerBaseUri
              alternativeBaseUri

              
              exampleId
              regex
              providerHtmlUrl
              
              lastUpdated
              lastUpdatedBy
              lastUpdatedByOrcid
            }
            exampleUrl
            orcidUrl
          }
        }
      }
    }
  }
  `
  // const { previousData, data = previousData, loading } = useQuery(graphqlQuery)
  const { previousData, data, loading } = useQuery(graphqlQuery)

  if (loading) {
    return <Container style={{textAlign: 'center', marginTop: theme.spacing(8)}}>
      <CircularProgress style={{marginTop: theme.spacing(10)}} />
    </Container>
  }
  console.log("Got data from the GraphQL endpoint:", data);

  if (!data.results.hits.items[0] || data.results.hits.items[0].id !== datasetId) {
    return <Container style={{marginTop: theme.spacing(8)}}>
      <Typography variant="body1">
        ❌ Dataset not found
      </Typography>
    </Container>
  }

  const displayField = (fieldName: string, fieldValue: any) => {
    if (fieldValue) {
      if (fieldName == 'Identifier Regex') {
        return <Typography variant="body1" className={classes.text}>
          {fieldName}: <code>{fieldValue}</code>
        </Typography>
      }
      return <Typography variant="body1" className={classes.text}>
        {fieldName}: {fieldValue}
      </Typography>
    }
  }
  const getUrlHtml = (urlString: string) => {
    if(/^(?:node[0-9]+)|((https?|ftp):.*)$/.test(urlString)) {
      // Process URIs
      return <a href={urlString} className={classes.link} target="_blank" rel="noopener noreferrer">{urlString}</a>
    } else {
      return urlString
    }
  }

  const datasetFields = data.results.hits.items[0].fields

  let updatedBy: any;

  if (datasetFields.lastUpdatedBy) {
    if (datasetFields.lastUpdatedByOrcid) {
      // updatedBy = updatedBy + ' (' + datasetFields.lastUpdatedByOrcid + ')'
      updatedBy = <a href={'https://orcid.org/' + datasetFields.lastUpdatedByOrcid} className={classes.link} target="_blank" rel="noopener noreferrer">{datasetFields.lastUpdatedBy}</a>
    } else {
      updatedBy = datasetFields.lastUpdatedBy
    }
  } else if (datasetFields.lastUpdatedByOrcid) {
    updatedBy = datasetFields.lastUpdatedByOrcid
  }

  return <>
    <AppBar title="" position='static' style={{backgroundColor: '#fafbfd'}}>
      <Toolbar variant='dense'>
        <Link href="/">
        <a>
          <Tooltip title='Go back to the registry homepage'>
            <Button style={{textTransform: 'none'}}>
              <HomeIcon />&nbsp;Registry
            </Button>
          </Tooltip>
          </a>
        </Link>
      </Toolbar>
    </AppBar>

    <Container style={{marginTop: theme.spacing(6), marginBottom: theme.spacing(6)}}>
      <Head>
        <title>{title}</title>
      </Head>

      <Typography variant="h5" style={{marginBottom: theme.spacing(2)}}>
        <Chip label={data.results.hits.items[0].id} variant="filled" /> {datasetFields.title}
      </Typography>
      { datasetFields.description && 
        <Paper className={classes.paperPadding}>
          ℹ️ {datasetFields.description}
        </Paper>
      }
      { displayField('🗃️ Resource type', datasetFields.type) }
      { displayField('🏷️ Keywords', datasetFields.keywords.join(', ')) }
      { displayField('🥇 Preferred prefix', datasetFields.preferredPrefix) }
      { displayField('🥈 Alternative prefix', datasetFields.altPrefix) }
      { displayField('🔗 Alternative base URI', datasetFields.alternativeBaseUri) }
      { displayField('📋️ Example ID', datasetFields.exampleId) }
      { displayField('🏠️ Website', getUrlHtml(datasetFields.homepage)) }
      { displayField('📶 Identifiers prefix', datasetFields.identifiersPrefix) }
      { displayField('📆 Last updated', datasetFields.lastUpdated) }
      { displayField('👤 Last updated by', updatedBy) }
      { displayField('🏛️ Organization', datasetFields.organization) }
      { displayField('Provider base URI', datasetFields.providerBaseUri) }
      { displayField('Provider HTML URL', datasetFields.providerHtmlUrl) }
      { displayField('Identifier Regex', datasetFields.regex) }
      { displayField('🕰️ Year last accessible', datasetFields.yearLastAccessible) }
      { displayField('🔁 Wayback URL', getUrlHtml(datasetFields.waybackUrl)) }
    </Container>
  </>
  

  // return (
  //   <div>
  //   {/* <EuiPage> */}
  //     <Head>
  //       <title>{title}</title>
  //     </Head>

  //     {/* <EuiPageBody component="div">
  //       <EuiText size="s">
  //         {datasetId}
  //       </EuiText>
  //     </EuiPageBody> */}

  //     <h3>
  //       {datasetId}
  //     </h3>

  //     {/* <EuiTitle>
  //       <h1>Placeholder page for {datasetId}</h1>
  //     </EuiTitle> */}

  //     {/* <EuiSpacer />

  //     <EuiText>
  //       <p>
  //         This is the catch-all component for routes without their own dedicated
  //         page.
  //       </p>
  //     </EuiText>

  //     <EuiSpacer />

  //     <Link href="/">
  //       <a>Go to Home</a>
  //     </Link> */}
  //   {/* </EuiPage> */}
  //   </div>

  // );
  // }

};

// export default Dataset;

//  const DynDataset = dynamic(
//   () => import('@elastic/eui').then((mod) => {

//     Dataset()
//   }),
//   {
//     ssr: false,
//   },
// )

export default withApollo(Dataset)

// export default withApollo(withSearchkit(withSearchkitRouting(Dataset)))