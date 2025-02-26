import React, { useCallback, useMemo } from 'react';
import { ButtonPressAnimation } from '@/components/animations';
import { Box, Column, Columns, HitSlop, Inline, Text } from '@/design-system';
import { TextColor } from '@/design-system/color/palettes';
import { CoinRowButton } from '@/__swaps__/screens/Swap/components/CoinRowButton';
import { BalancePill } from '@/__swaps__/screens/Swap/components/BalancePill';
import { toggleFavorite, useFavorites } from '@/resources/favorites';
import { StyleSheet } from 'react-native';
import { SwapCoinIcon } from './SwapCoinIcon';
import { ethereumUtils, haptics, showActionSheetWithOptions } from '@/utils';
import { ContextMenuButton, OnPressMenuItemEventObject } from 'react-native-ios-context-menu';
import { IS_ANDROID } from '@/env';
import { startCase } from 'lodash';
import { setClipboard } from '@/hooks/useClipboard';
import { RainbowNetworks } from '@/networks';
import * as i18n from '@/languages';
import { ETH_ADDRESS } from '@/references';
import { trimTrailingZeros } from '@/__swaps__/utils/swaps';
import { ParsedSearchAsset } from '@/__swaps__/types/assets';
import { userAssetsStore } from '@/state/assets/userAssets';
import { SearchAsset } from '@/__swaps__/types/search';
import { ChainId } from '@/__swaps__/types/chains';

interface InputCoinRowProps {
  isTrending?: boolean;
  onPress: (asset: ParsedSearchAsset | null) => void;
  output?: false | undefined;
  uniqueId: string;
}

type PartialAsset = Pick<SearchAsset, 'address' | 'mainnetAddress' | 'chainId' | 'icon_url' | 'name' | 'colors' | 'symbol' | 'uniqueId'>;

interface OutputCoinRowProps extends PartialAsset {
  onPress: () => void;
  output: true;
  isTrending?: boolean;
}

type CoinRowProps = InputCoinRowProps | OutputCoinRowProps;

export const CoinRow = React.memo(function CoinRow({ onPress, output, uniqueId, isTrending, ...assetProps }: CoinRowProps) {
  const { favoritesMetadata } = useFavorites();

  const inputAsset = userAssetsStore(state => (output ? undefined : state.getUserAsset(uniqueId)));
  const outputAsset = output ? (assetProps as PartialAsset) : undefined;

  const asset = output ? outputAsset : inputAsset;
  const { address, chainId, colors, icon_url, mainnetAddress, name, symbol } = asset || {};

  const percentChange = useMemo(() => {
    if (isTrending) {
      const rawChange = Math.random() * 30;
      const isNegative = Math.random() < 0.2;
      const prefix = isNegative ? '-' : '+';
      const color: TextColor = isNegative ? 'red' : 'green';
      const change = `${trimTrailingZeros(Math.abs(rawChange).toFixed(1))}%`;

      return { change, color, prefix };
    }
  }, [isTrending]);

  const isFavorite = useMemo(() => {
    return Object.values(favoritesMetadata).find(fav => {
      if (mainnetAddress?.toLowerCase() === ETH_ADDRESS) {
        return fav.address.toLowerCase() === ETH_ADDRESS;
      }

      return fav.address?.toLowerCase() === address?.toLowerCase();
    });
  }, [favoritesMetadata, address, mainnetAddress]);

  const favoritesIconColor = useMemo(() => {
    return isFavorite ? '#FFCB0F' : undefined;
  }, [isFavorite]);

  const handleToggleFavorite = useCallback(() => {
    // NOTE: It's important to always fetch ETH favorite on mainnet
    if (address) {
      return toggleFavorite(address, mainnetAddress === ETH_ADDRESS ? 1 : chainId);
    }
  }, [address, mainnetAddress, chainId]);

  if (!address || !chainId) return null;

  return (
    <Box>
      <Columns alignVertical="center">
        <Column>
          <ButtonPressAnimation disallowInterruption onPress={output ? onPress : () => onPress(inputAsset || null)} scaleTo={0.95}>
            <HitSlop vertical="10px">
              <Box
                alignItems="center"
                paddingLeft="20px"
                paddingRight={!output ? '20px' : undefined}
                paddingVertical="10px"
                flexDirection="row"
                justifyContent="space-between"
                width="full"
                gap={12}
              >
                <Box flexDirection="row" gap={10} flexShrink={1} justifyContent="center">
                  <SwapCoinIcon
                    iconUrl={icon_url}
                    address={address}
                    mainnetAddress={mainnetAddress}
                    large
                    network={ethereumUtils.getNetworkFromChainId(chainId)}
                    symbol={symbol || ''}
                    color={colors?.primary}
                  />
                  <Box gap={10} flexShrink={1} justifyContent="center">
                    <Text color="label" size="17pt" weight="semibold" numberOfLines={1} ellipsizeMode="tail">
                      {name}
                    </Text>
                    <Inline alignVertical="center" space={{ custom: 5 }} wrap={false}>
                      <Text color="labelTertiary" numberOfLines={1} size="13pt" weight="semibold">
                        {output ? symbol : `${inputAsset?.balance.display}`}
                      </Text>
                      {isTrending && percentChange && (
                        <Inline alignVertical="center" space={{ custom: 1 }} wrap={false}>
                          <Text align="center" color={percentChange.color} size="12pt" weight="bold">
                            {percentChange.prefix}
                          </Text>
                          <Text color={percentChange.color} size="13pt" weight="semibold">
                            {percentChange.change}
                          </Text>
                        </Inline>
                      )}
                    </Inline>
                  </Box>
                </Box>
                {!output && <BalancePill balance={inputAsset?.native?.balance.display ?? ''} />}
              </Box>
            </HitSlop>
          </ButtonPressAnimation>
        </Column>
        {output && (
          <Column width="content">
            <Box paddingLeft="12px" paddingRight="20px">
              <Inline space="8px">
                <InfoButton address={address} chainId={chainId} />
                <CoinRowButton color={favoritesIconColor} onPress={handleToggleFavorite} icon="􀋃" weight="black" />
              </Inline>
            </Box>
          </Column>
        )}
      </Columns>
    </Box>
  );
});

const InfoButton = ({ address, chainId }: { address: string; chainId: ChainId }) => {
  const network = RainbowNetworks.find(network => network.id === chainId)?.value;

  const handleCopy = useCallback(() => {
    haptics.selection();
    setClipboard(address);
  }, [address]);

  const options = {
    copy: {
      title: i18n.t(i18n.l.exchange.coin_row.copy_contract_address),
      action: handleCopy,
    },
    ...(network
      ? {
          blockExplorer: {
            title: i18n.t(i18n.l.exchange.coin_row.view_on, { blockExplorerName: startCase(ethereumUtils.getBlockExplorer(network)) }),
            action: () => ethereumUtils.openAddressInBlockExplorer(address, network),
          },
        }
      : {}),
  };

  const menuConfig = {
    menuItems: [
      {
        actionKey: 'copyAddress',
        actionTitle: options.copy.title,
        icon: {
          iconType: 'SYSTEM',
          iconValue: 'doc.on.doc',
        },
      },
      ...(network
        ? [
            {
              actionKey: 'blockExplorer',
              actionTitle: options.blockExplorer?.title,
              icon: {
                iconType: 'SYSTEM',
                iconValue: 'link',
              },
            },
          ]
        : []),
    ],
    menuTitle: '',
  };

  const handlePressMenuItem = async ({ nativeEvent: { actionKey } }: OnPressMenuItemEventObject) => {
    if (actionKey === 'copyAddress') {
      options.copy.action();
    } else if (actionKey === 'blockExplorer' && network) {
      options.blockExplorer?.action();
    }
  };

  const onPressAndroid = () =>
    showActionSheetWithOptions(
      {
        options: [options.copy.title, ...(network ? [options.blockExplorer?.title] : [])],
        showSeparators: true,
      },
      (idx: number) => {
        if (idx === 0) {
          options.copy.action();
        }
        if (idx === 1 && network) {
          options.blockExplorer?.action();
        }
      }
    );

  return (
    <ContextMenuButton
      activeOpacity={0}
      // @ts-expect-error Types of property 'menuItems' are incompatible
      menuConfig={menuConfig}
      onPress={IS_ANDROID ? onPressAndroid : undefined}
      isMenuPrimaryAction
      onPressMenuItem={handlePressMenuItem}
      useActionSheetFallback={false}
      wrapNativeComponent={false}
    >
      <CoinRowButton icon="􀅳" outline size="icon 14px" />
    </ContextMenuButton>
  );
};

export const styles = StyleSheet.create({
  solidColorCoinIcon: {
    opacity: 0.4,
  },
});
