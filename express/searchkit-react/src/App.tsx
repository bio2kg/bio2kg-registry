import { gql, useQuery } from '@apollo/client'
import { useState } from 'react'
import { HitsList, HitsGrid } from './searchkit/Hits'
import { useSearchkitVariables, useSearchkit, useSearchkitQueryValue } from '@searchkit/client'
import {
  FacetsList,
  Pagination,
  ResetSearchButton,
  SelectedFilters,
} from '@searchkit/elastic-ui'
import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageContentHeader,
  EuiPageContentHeaderSection,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiPageSideBar,
  EuiTitle,
  EuiHorizontalRule,
  EuiFieldSearch,
  EuiButtonEmpty,
  EuiButton,
  EuiContextMenuItem,
  EuiContextMenuPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPopover,
} from '@elastic/eui'
// import { useEffect } from 'react'

const graphqlQuery = gql`
  query resultSet($query: String, $filters: [SKFiltersSet], $page: SKPageInput, $sortBy: String) {
    results(query: $query, filters: $filters) {
      summary {
        total
        appliedFilters {
          id
          identifier
          display
          label
          ... on DateRangeSelectedFilter {
            dateMin
            dateMax
          }
          ... on NumericRangeSelectedFilter {
            min
            max
          }
          ... on ValueSelectedFilter {
            value
          }
        }
        sortOptions {
          id
          label
        }
        query
      }
      hits(page: $page, sortBy: $sortBy) {
        page {
          total
          totalPages
          pageNumber
          from
          size
        }
        sortedBy
        items {
          ... on ResultHit {
            id
            exampleUrl
            highlight {
              title 
              description
            }
            fields {
              preferredPrefix
              altPrefix
              providerBaseUri
              alternativeBaseUri
              title
              description
              type
              keywords
              organization
              homepage
              exampleId
              providerHtmlUrl
              regex
            }
          }
        }
      }
      facets {
        identifier
        type
        label
        display
        entries {
          id
          label
          count
        }
      }
    }
  }
`

const Page = () => {
  const variables = useSearchkitVariables()
  const [query, setQuery] = useSearchkitQueryValue()
  const api = useSearchkit()
  const { previousData, data = previousData, loading } = useQuery(graphqlQuery, {
    variables: variables
  })

  const [ viewType ] = useState('grid')
  const Facets = FacetsList([])

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const onButtonClick = () =>
    setIsPopoverOpen((isPopoverOpen) => !isPopoverOpen);
  const closePopover = () => setIsPopoverOpen(false);

  const getIconType = (size: number) => {
    return size === api.searchState.page.size ? 'check' : 'empty';
  };
  const changePageSize = (size: number) => {
    closePopover();
    api.setPage({ size: size, from: 0 })
    api.search()
  };

  const button = (
    <EuiButtonEmpty
      size="s"
      color="text"
      iconType="arrowDown"
      iconSide="right"
      onClick={onButtonClick}>
      Rows per page: {api.searchState.page.size}
    </EuiButtonEmpty>
  );

  const items = [
    <EuiContextMenuItem
      key="10 rows"
      icon={getIconType(10)}
      onClick={() => {
        changePageSize(10)
      }}>
      10 rows
    </EuiContextMenuItem>,
    <EuiContextMenuItem
      key="20 rows"
      icon={getIconType(20)}
      onClick={() => {
        changePageSize(20)
      }}>
      20 rows
    </EuiContextMenuItem>,
    <EuiContextMenuItem
      key="50 rows"
      icon={getIconType(50)}
      onClick={() => {
        changePageSize(50)
      }}>
      50 rows
    </EuiContextMenuItem>,
    <EuiContextMenuItem
      key="100 rows"
      icon={getIconType(100)}
      onClick={() => {
        changePageSize(100)
      }}>
      100 rows
    </EuiContextMenuItem>,
  ];

  return (
    <EuiPage>
      <EuiPageSideBar>
        {/* Reload search bar onChange */}
        <EuiFieldSearch
          placeholder="Search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            api.setQuery(e.target.value)
            api.search()
          }}
          isLoading={loading}
          onSearch={(value) => {
            setQuery(value)
            api.setQuery(value)
            api.search()
          }}
          isClearable
          aria-label="Search"
        />

        <EuiHorizontalRule margin="m" />
        <Facets data={data?.results} loading={loading} />
      </EuiPageSideBar>
      <EuiPageBody component="div">
        <EuiPageHeader>
          <EuiPageHeaderSection>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiTitle size="s">
                  <h2 style={{whiteSpace: "nowrap"}}>Bio2KG Registry</h2>
                </EuiTitle>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiTitle size="xxxs">
                  <SelectedFilters data={data?.results} loading={loading} />
                </EuiTitle>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPageHeaderSection>
          <EuiPageHeaderSection>
            <ResetSearchButton loading={loading} />
          </EuiPageHeaderSection>
        </EuiPageHeader>

        <EuiPageContent>
          <EuiPageContentHeader>
            <EuiPageContentHeaderSection>
              <EuiTitle size="xs">
                <h2>{data?.results.summary.total} Results</h2>
              </EuiTitle>
            </EuiPageContentHeaderSection>
            <EuiPageContentHeaderSection>
              <EuiFlexGroup>
                {/* Page size */}
                <EuiFlexItem grow={1}>
                  <EuiPopover
                    button={button}
                    isOpen={isPopoverOpen}
                    closePopover={closePopover}>
                    <EuiContextMenuPanel items={items} />
                  </EuiPopover>
                </EuiFlexItem>
                <EuiFlexItem grow={1}>
                  {/* https://elastic.github.io/eui/#/display/icons */}
                  <EuiButton href="/api/graphql" size="s" iconType="graphApp" target="_blank">
                    GraphQL API
                  </EuiButton>
                </EuiFlexItem>
                <EuiFlexItem grow={1}>
                  {/* https://elastic.github.io/eui/#/display/icons */}
                  <EuiButton href="https://elastic.registry.bio2kg.org/_search"
                      size="s" iconType="searchProfilerApp" target="_blank">
                    ElasticSearch API
                  </EuiButton>
                </EuiFlexItem>
                <EuiFlexItem grow={1}>
                  <EuiButton href="https://github.com/bio2kg/bio2kg-registry"
                      size="s" iconType="editorCodeBlock" target="_blank">
                    Source
                  </EuiButton>
                </EuiFlexItem>
                {/* <EuiFlexItem grow={1}>
                  <SortingSelector data={data?.results} loading={loading} />
                </EuiFlexItem> */}
                {/* <EuiFlexItem grow={2}>
                <EuiButtonGroup
                  legend=""
                  options={[
                    {
                      id: `grid`,
                      label: 'Grid'
                    },
                    {
                      id: `list`,
                      label: 'List'
                    }
                  ]}
                  idSelected={viewType}
                  onChange={(id) => setViewType(id)}
                />
                </EuiFlexItem> */}
              </EuiFlexGroup>
            </EuiPageContentHeaderSection>
          </EuiPageContentHeader>
          <EuiPageContentBody>
            {viewType === 'grid' ? <HitsGrid data={data} /> : <HitsList data={data} />}
            <EuiFlexGroup justifyContent="spaceAround">
              <Pagination data={data?.results} />
            </EuiFlexGroup>
          </EuiPageContentBody>
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  )
}

export default Page
