import { extendTheme } from '@chakra-ui/react';

// Your custom streaming platform theme
const customTheme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      // Your brand colors (you can change these!)
      primary: '#E50914',      // Main red color
      primaryDark: '#B20710',  // Darker red for hover effects
      background: '#141414',   // Dark background
      cardBg: '#2F2F2F',      // Cards and input backgrounds
      text: '#FFFFFF',        // White text
      textGray: '#808080',    // Gray text for secondary info
    },
  },
  styles: {
    global: {
      body: {
        bg: 'brand.background',
        color: 'brand.text',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      },
      '*::selection': {
        bg: 'brand.primary',
        color: 'brand.text',
      },
    },
  },
  components: {
    Button: {
      variants: {
        primary: {
          bg: 'brand.primary',
          color: 'white',
          _hover: {
            bg: 'brand.primaryDark',
            transform: 'scale(1.05)',
          },
          _active: {
            transform: 'scale(0.98)',
          },
          transition: 'all 0.2s',
        },
      },
    },
  },
});

export default customTheme;
