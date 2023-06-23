import { Bullseye, Page, Spinner, Text, TextContent, TextVariants } from '@patternfly/react-core'
import React from 'react'

export const HawtioLoading: React.FunctionComponent = () => (
  <Page>
    <Bullseye>
      <div style={{ justifyContent: 'center' }}>
        <Spinner diameter='60px' isSVG aria-label='Loading Hawtio' />

        <TextContent>
          <Text className={'--pf-global--Color--200'} component={TextVariants.h3}>
            Loading ...
          </Text>
        </TextContent>
      </div>
    </Bullseye>
  </Page>
)
