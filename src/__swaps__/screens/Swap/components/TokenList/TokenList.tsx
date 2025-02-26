import React from 'react';
import Animated, { SharedValue, useAnimatedProps } from 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import { Separator, Stack } from '@/design-system';
import { useDimensions } from '@/hooks';
import { EXPANDED_INPUT_HEIGHT, FOCUSED_INPUT_HEIGHT } from '@/__swaps__/screens/Swap/constants';
import { SearchInput } from '@/__swaps__/screens/Swap/components/SearchInput';
import { TokenToSellList } from '@/__swaps__/screens/Swap/components/TokenList/TokenToSellList';
import { TokenToBuyList } from '@/__swaps__/screens/Swap/components/TokenList/TokenToBuyList';
import { useSwapContext } from '@/__swaps__/screens/Swap/providers/swap-provider';
import { ExtendedAnimatedAssetWithColors } from '@/__swaps__/types/assets';

export const TokenList = ({
  asset,
  handleExitSearchWorklet,
  handleFocusSearchWorklet,
  output,
}: {
  asset: SharedValue<ExtendedAnimatedAssetWithColors | null>;
  handleExitSearchWorklet: () => void;
  handleFocusSearchWorklet: () => void;
  output: boolean;
}) => {
  const { inputProgress, outputProgress } = useSwapContext();
  const { width: deviceWidth } = useDimensions();

  const animatedProps = useAnimatedProps(() => {
    const isFocused = output ? outputProgress.value === 2 : inputProgress.value === 2;

    return {
      contentContainerStyle: {
        paddingBottom: isFocused ? EXPANDED_INPUT_HEIGHT - FOCUSED_INPUT_HEIGHT + 20 : 20,
        paddingTop: 20,
      },
    };
  });

  return (
    <Stack>
      <Stack space="20px">
        <SearchInput
          asset={asset}
          handleExitSearchWorklet={handleExitSearchWorklet}
          handleFocusSearchWorklet={handleFocusSearchWorklet}
          output={output}
        />
        <Separator color="separatorTertiary" thickness={1} />
      </Stack>
      <Animated.ScrollView
        animatedProps={animatedProps}
        showsVerticalScrollIndicator={false}
        style={{
          alignSelf: 'center',
          height: EXPANDED_INPUT_HEIGHT - 77,
          width: deviceWidth - 24,
        }}
      >
        {!output && <TokenToSellList />}
        {output && <TokenToBuyList />}
      </Animated.ScrollView>
    </Stack>
  );
};

export const styles = StyleSheet.create({
  textIconGlow: {
    padding: 16,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});
