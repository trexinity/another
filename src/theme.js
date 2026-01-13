import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  fonts: {
    logo: `'CustomLogo', sans-serif`,
    heading: `'HeadingFont', 'Ember', -apple-system, sans-serif`,
    body: `'Amazon Ember', -apple-system, BlinkMacSystemFont, sans-serif`,
  },
  colors: {
    prime: {
      blue: '#00A8E1',
      gold: '#FFB800',
      darkBg: '#0F171E',
      cardBg: '#1A242F',
      hover: '#232F3E',
    },
    brand: {
      50: '#f7fafc',
      100: '#edf2f7',
      200: '#e2e8f0',
      300: '#cbd5e0',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#171923',
    },
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? '#0F171E' : 'white',
        color: props.colorMode === 'dark' ? 'white' : 'black',
        overflowX: 'hidden',
      },
      '*::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '*::-webkit-scrollbar-track': {
        bg: 'transparent',
      },
      '*::-webkit-scrollbar-thumb': {
        bg: '#232F3E',
        borderRadius: '10px',
      },
      '*::-webkit-scrollbar-thumb:hover': {
        bg: '#37475A',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: '4px',
        transition: 'all 0.2s',
      },
      variants: {
        prime: {
          bg: '#00A8E1',
          color: 'white',
          _hover: {
            bg: '#0095C8',
            transform: 'scale(1.02)',
          },
        },
        primeGold: {
          bg: '#FFB800',
          color: '#0F171E',
          _hover: {
            bg: '#E6A600',
            transform: 'scale(1.02)',
          },
        },
        ghost: {
          _hover: {
            bg: 'whiteAlpha.100',
          },
        },
      },
    },
  },
});

export default theme;
