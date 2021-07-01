import React from 'react'
import { useState } from 'react'
import { 
  EuiFlexGrid, 
  EuiFlexItem, 
  EuiCard, 
  EuiFlexGroup, 
  EuiTitle, 
  EuiText,
  EuiButtonIcon,
  EuiButton,
  EuiButtonEmpty,
  EuiBadge
} from '@elastic/eui'

export const HitsGrid = ({ data }: any) => {
  const [showDetails, setShowDetails] = useState({})

  const clickDetails = (hit_id: any) => {
    if (showDetails[hit_id]) {
      setShowDetails({...showDetails, [hit_id] : false})
    } else {
      setShowDetails({...showDetails, [hit_id] : true})
    }
  }

  return (
  <EuiFlexGrid gutterSize="s">
    {data?.results.hits.items.map((hit: any) => (
      <EuiFlexItem key={hit.id} grow={1}>
        <EuiCard
          textAlign="left"
          title={<EuiFlexGroup>
            <EuiFlexItem grow={false} >
              <EuiTitle size="xs">
                <h2>{hit.fields.title}</h2>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiBadge color="hollow">{hit.fields.preferredPrefix}</EuiBadge>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty
                // iconType="iInCircle"
                iconType="arrowDown"
                iconSide="right"
                size="xs"
                onClick={() => clickDetails(hit.id)}
                aria-label="See more details">
                details
              </EuiButtonEmpty>
            </EuiFlexItem>
          </EuiFlexGroup>}
          description={hit.fields.description}
          // footer={
          //   <EuiFlexGroup justifyContent="flexStart">
          //     <EuiFlexItem grow={false}>
          //       <EuiButton
          //         iconType="iInCircle"
          //         size="s"
          //         onClick={() => clickDetails(hit.id)}
          //         aria-label="See more details">
          //         More details
          //       </EuiButton>
          //     </EuiFlexItem>
          //   </EuiFlexGroup>
          // }
        >
          {showDetails[hit.id] && 
            <EuiText size="s">
              {hit.fields.organization && <p><i>Organization:</i> {hit.fields.organization}</p>}
              {hit.fields.homepage && 
                <p><i>Website:</i> <a target="_blank" href={hit.fields.homepage}>{hit.fields.homepage}</a></p>
              }
              {hit.fields.keywords && 
                <p><i>Keywords:</i> {hit.fields.keywords.join(', ')}</p>
              }
              {hit.fields.altPrefix &&
                <p><i>Alternative prefixes:</i> {hit.fields.altPrefix.join(', ')}</p>
              }
              {hit.fields.providerBaseUri && 
                <p><i>Provider Base URI:</i> {hit.fields.providerBaseUri} </p>
              }
              {hit.fields.alternativeBaseUri &&
                <p><i>Alternative base URIs:</i> {hit.fields.alternativeBaseUri.join(', ')}</p>
              }
              {hit.fields.exampleId && 
                <p><i>Example Id:</i> {hit.fields.exampleId}</p>
              }
              {hit.fields.regex && 
                <p><i>Identifier Regex:</i> {hit.fields.regex}</p>
              }
              {hit.fields.providerHtmlUrl && 
                <p><i>Example Url:</i> {hit.fields.providerHtmlUrl}</p>
              }              
            </EuiText>
          }
        </EuiCard>
      </EuiFlexItem>
    ))}
  </EuiFlexGrid>
)}

export const HitsList = ({ data }: any) => (
  <>
    {data?.results.hits.items.map((hit: any) => (
      <EuiFlexGroup gutterSize="xl" key={hit.id}>
        <EuiFlexItem>
          <EuiFlexGroup>
            {/* <EuiFlexItem grow={false}>
              <img src={hit.fields.poster} alt="Nature" style={{ height: '150px' }} />
            </EuiFlexItem> */}
            <EuiFlexItem grow={4}>
              <EuiTitle size="xs">
                <h6>{hit.fields.title}</h6>
              </EuiTitle>
              <EuiText grow={false}>
                <p>{hit.fields.preferredPrefix}</p>
              </EuiText>
              <EuiText grow={false}>
                <p>{hit.fields.description}</p>
              </EuiText>
            </EuiFlexItem>
            {/* <EuiFlexItem grow={2}>
              <EuiText grow={false}>
                <ul>
                  <li>
                    <b>ACTORS: </b>
                    {hit.fields.actors.join(', ')}
                  </li>

                  <li>
                    <b>WRITERS: </b>
                    {hit.fields.writers.join(', ')}
                  </li>
                </ul>
              </EuiText>
            </EuiFlexItem> */}
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    ))}
  </>
)
