import React from 'react';
import { Path, SvgProps } from 'react-native-svg';
import Svg from '../Svg';

export function Ratio({ color, ...props }: SvgProps) {
  return (
    <Svg viewBox="0 0 165 155" fill="none" {...props}>
      <Path
        fill={color}
        fillRule="evenodd"
        d="m96.754 18.837-78.216 59.43c-4.27 3.244-3.788 10.115.888 12.657h.001l82.873 45.018c5.951 3.235 13.1 2.76 18.627-1.236l.001-.001 15.434-11.168.002-.001 4.442-3.213.002-.001c7.154-5.179 9.726-15.044 6.12-23.352l-.087-.188-32.664-73.173c-3.124-6.997-11.479-9.286-17.423-4.772ZM87.65 5.434C101.51-5.095 121.004.242 128.29 16.564l32.565 72.95c.035.073.07.147.103.222 7.002 15.681 2.194 34.414-11.338 44.207l-.002.001-4.442 3.213-.002.001-15.433 11.168-.002.001c-10.251 7.414-23.521 8.301-34.572 2.294h-.002l-82.87-45.018C-2.756 97.426-4.317 75.309 9.43 64.864l78.218-59.43Z"
        clipRule="evenodd"
      />
    </Svg>
  );
}