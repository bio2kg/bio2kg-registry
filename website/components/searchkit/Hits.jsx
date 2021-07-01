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

export const HitsGrid = ({ data }) => {
  const [showDetails, setShowDetails] = useState({})

  const clickDetails = (hit_id) => {
    if (showDetails[hit_id]) {
      setShowDetails({...showDetails, [hit_id] : false})
    } else {
      setShowDetails({...showDetails, [hit_id] : true})
    }
  }

  return (
  <EuiFlexGrid gutterSize="s">
    {data?.results.hits.items.map((hit) => (
      <EuiFlexItem key={hit.id} grow={1}>
        <EuiCard
          grow={true}
          textAlign="left"
          title={<EuiFlexGroup>
            <EuiFlexItem grow={false} >
              <EuiTitle size="xs">
                <h2>{hit.fields.title}</h2>
              </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiBadge color="hollow">{hit.fields.preferredprefix}</EuiBadge>
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
              {/* <p></p> */}
              <i>Organization:</i> {hit.fields.organization}
              {hit.fields.keywords && 
                <p><i>Keywords:</i> {hit.fields.keywords.join(', ')} </p>
              }
            </EuiText>
          }
        </EuiCard>
      </EuiFlexItem>
    ))}
  </EuiFlexGrid>
)}

export const HitsList = ({ data }) => (
  <>
    {data?.results.hits.items.map((hit) => (
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
                <p>{hit.fields.preferredprefix}</p>
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
