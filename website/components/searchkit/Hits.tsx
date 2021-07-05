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
                {hit.fields.organization && 
                  <div className="eui-displayInline"><i>Organization:</i> {hit.fields.organization}<br/></div>
                }
                {hit.fields.homepage && 
                  <div className="eui-displayInline"><i>Website:</i> <a target="_blank" href={hit.fields.homepage}>{hit.fields.homepage}</a><br/></div>
                }
                {hit.fields.keywords && 
                  <div className="eui-displayInline"><i>Keywords:</i> {hit.fields.keywords.join(', ')}<br/></div>
                }
                {hit.fields.preferredPrefix &&
                  <div className="eui-displayInline"><i>Preferred prefix:</i> {hit.fields.preferredPrefix}<br/></div>
                }                
                {hit.fields.altPrefix &&
                  <div className="eui-displayInline"><i>Alternative prefixes:</i> {hit.fields.altPrefix.join(', ')}<br/></div>
                }
                {hit.fields.providerBaseUri && 
                  <div className="eui-displayInline"><i>Provider Base URI:</i> {hit.fields.providerBaseUri}<br/></div>
                }
                {hit.fields.alternativeBaseUri &&
                  <div className="eui-displayInline"><i>Alternative base URIs:</i> {hit.fields.alternativeBaseUri.join(', ')}<br/></div>
                }
                {hit.fields.regex && 
                  <div className="eui-displayInline"><i>Identifier Regex:</i> {hit.fields.regex}<br/></div>
                }
                {hit.fields.exampleId && hit.exampleUrl &&
                  <div className="eui-displayInline"><i>Example Identifier:</i> <a target="_blank" href={hit.exampleUrl}>{hit.fields.exampleId}</a><br/></div>
                }
                {hit.fields.providerHtmlUrl && 
                  <div className="eui-displayInline"><i>Template Url:</i> {hit.fields.providerHtmlUrl}<br/></div>
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
