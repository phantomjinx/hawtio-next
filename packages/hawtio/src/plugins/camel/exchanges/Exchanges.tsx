import {
  Card,
} from '@patternfly/react-core'
import React from 'react'
import { BlockedExchanges } from './BlockedExchanges'
import { InflightExchanges } from './InflightExchanges'

export const Exchanges: React.FunctionComponent = () => {

  return (
    <Card isFullHeight>
      <InflightExchanges></InflightExchanges>
      <BlockedExchanges></BlockedExchanges>
    </Card>
  )
}
