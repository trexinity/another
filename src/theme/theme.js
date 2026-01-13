import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      primary: '#E50914',
      secondary: '#B20710',
      dark: '#141414',
      cardBg: '#1f1f1f',
      textGray: '#808080',
      hover: '#2f2f2f',
    },
  },
  styles: {
    global: {
      body: {
        bg: '#141414',
        color: 'white',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'md',
      },
      variants: {
        primary: {
          bg: 'brand.primary',
          color: 'white',
          _hover: {
            bg: 'brand.secondary',
            transform: 'scale(1.05)',
          },
          transition: 'all 0.2s',
        },
        secondary: {
          bg: 'rgba(255,255,255,0.2)',
          color: 'white',
          backdropFilter: 'blur(10px)',
          _hover: {
            bg: 'rgba(255,255,255,0.3)',
          },
        },
      },
    },
  },
});

