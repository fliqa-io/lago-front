import { gql } from '@apollo/client'
import { useEffect } from 'react'
import { generatePath, useNavigate, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'

import { Avatar, ButtonLink, Chip, Icon, Skeleton, Typography } from '~/components/designSystem'
import { GenericPlaceholder } from '~/components/GenericPlaceholder'
import { addToast } from '~/core/apolloClient'
import { IntegrationsTabsOptionsEnum } from '~/core/constants/tabsOptions'
import { GOCARDLESS_INTEGRATION_DETAILS_ROUTE, INTEGRATIONS_ROUTE } from '~/core/router'
import {
  AddGocardlessProviderDialogFragmentDoc,
  useAddGocardlessApiKeyMutation,
} from '~/generated/graphql'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import Gocardless from '~/public/images/gocardless.svg'
import ErrorImage from '~/public/images/maneki/error.svg'
import { PageHeader, theme } from '~/styles'

gql`
  fragment GocardlessIntegrationOauthCallback on GocardlessProvider {
    id
    name
    code
  }

  mutation addGocardlessApiKey($input: AddGocardlessPaymentProviderInput!) {
    addGocardlessPaymentProvider(input: $input) {
      id
      ...AddGocardlessProviderDialog
      ...GocardlessIntegrationOauthCallback
    }
  }

  ${AddGocardlessProviderDialogFragmentDoc}
`

const GocardlessIntegrationOauthCallback = () => {
  const [searchParams] = useSearchParams()
  const accessCode = searchParams.get('code') || ''
  const code = searchParams.get('lago_code') || ''
  const name = searchParams.get('lago_name') || ''

  const navigate = useNavigate()
  const { translate } = useInternationalization()
  const [addGocardlessApiKey, { loading, error }] = useAddGocardlessApiKeyMutation()

  useEffect(() => {
    const createIntegration = async () => {
      const res = await addGocardlessApiKey({
        variables: {
          input: {
            accessCode,
            code,
            name,
          },
        },
      })

      navigate(
        generatePath(GOCARDLESS_INTEGRATION_DETAILS_ROUTE, {
          integrationId: res.data?.addGocardlessPaymentProvider?.id as string,
          integrationGroup: IntegrationsTabsOptionsEnum.Lago,
        }),
      )
    }

    if (!!code && !!accessCode && !!name) {
      createIntegration()
    } else {
      navigate(
        generatePath(INTEGRATIONS_ROUTE, { integrationGroup: IntegrationsTabsOptionsEnum.Lago }),
      )

      addToast({
        severity: 'danger',
        translateKey: 'text_622f7a3dc32ce100c46a5154',
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <PageHeader.Wrapper withSide>
        <PageHeader.Group>
          <ButtonLink
            disabled={loading}
            to={generatePath(INTEGRATIONS_ROUTE, {
              integrationGroup: IntegrationsTabsOptionsEnum.Lago,
            })}
            type="button"
            buttonProps={{ variant: 'quaternary', icon: 'arrow-left' }}
          />
          {loading ? (
            <Skeleton variant="text" className="w-30" />
          ) : (
            <Typography variant="bodyHl" color="textSecondary">
              {translate('text_634ea0ecc6147de10ddb6625')}
            </Typography>
          )}
        </PageHeader.Group>
      </PageHeader.Wrapper>
      <MainInfos>
        {loading ? (
          <>
            <Skeleton variant="connectorAvatar" size="large" className="mr-4" />
            <div>
              <Skeleton variant="text" className="mb-5 w-50" />
              <Skeleton variant="text" className="w-32" />
            </div>
          </>
        ) : (
          <>
            <Avatar className="mr-4" variant="connector-full" size="large">
              <Gocardless />
            </Avatar>
            <div>
              <Line>
                <Typography variant="headline">
                  {translate('text_634ea0ecc6147de10ddb6625')}
                </Typography>
                <Chip label={translate('text_62b1edddbf5f461ab971270d')} />
              </Line>
              <Typography>{translate('text_62b1edddbf5f461ab971271f')}</Typography>
            </div>
          </>
        )}
      </MainInfos>
      {loading || !error ? (
        <Loader>
          <Icon name="processing" color="info" size="large" animation="spin" />
        </Loader>
      ) : (
        <GenericPlaceholder
          image={<ErrorImage width="136" height="104" />}
          title={translate('text_62bac37900192b773560e82d')}
          subtitle={translate('text_62bac37900192b773560e82f')}
          buttonTitle={translate('text_62bac37900192b773560e831')}
          buttonAction={() =>
            navigate(
              generatePath(INTEGRATIONS_ROUTE, {
                integrationGroup: IntegrationsTabsOptionsEnum.Lago,
              }),
            )
          }
        />
      )}
    </>
  )
}

const MainInfos = styled.div`
  display: flex;
  align-items: center;
  padding: ${theme.spacing(8)} ${theme.spacing(12)};

  ${theme.breakpoints.down('md')} {
    padding: ${theme.spacing(8)} ${theme.spacing(4)};
  }
`

const Line = styled.div`
  display: flex;
  align-items: center;

  > *:first-child {
    margin-right: ${theme.spacing(2)};
  }
`

const Loader = styled.div`
  height: 100%;
  width: 100%;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
`

export default GocardlessIntegrationOauthCallback
