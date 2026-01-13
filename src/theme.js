import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'system',
    useSystemColorMode: true,
  },

  fonts: {
    logo: `'CustomLogo', sans-serif`,
    heading: `'HeadingFont', -apple-system, BlinkMacSystemFont, sans-serif`,
    body: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif`,
  },

  // Perfect letter spacing & line heights
  letterSpacings: {
    logo: '-0.02em',
    heading: '-0.015em',
    body: 'normal',
  },

  lineHeights: {
    logo: 1,
    heading: 1.2,
    body: 1.6,
  },

  styles: {
    global: (props) => {
      const isDark = props.colorMode === 'dark';
      return {
        body: {
          bg: isDark ? '#000' : '#fff',
          color: isDark ? '#fff' : '#000',
          overflowX: 'hidden',
        },
        'h1, h2, h3, h4, h5, h6': {
          letterSpacing: 'heading',
          lineHeight: 'heading',
        },
        a: { color: 'inherit', textDecoration: 'none' },
        '::selection': { bg: isDark ? 'whiteAlpha.300' : 'blackAlpha.200' },
        '*:focus-visible': {
          outline: `2px solid ${isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'}`,
          outlineOffset: '3px',
        },
      };
    },
  },

  colors: {
    brand: {
      black: '#000',
      white: '#fff',
    },
  },

  components: {
    Button: {
      baseStyle: {
        fontWeight: '700',
        borderRadius: '8px',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        letterSpacing: '0.3px',
      },
      variants: {
        solid: (props) => ({
          bg: props.colorMode === 'dark' ? 'white' : 'black',
          color: props.colorMode === 'dark' ? 'black' : 'white',
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: props.colorMode === 'dark' ? '0 8px 24px rgba(255,255,255,0.25)' : '0 8px 24px rgba(0,0,0,0.25)',
          },
          _active: { transform: 'translateY(0)' },
        }),
        ghost: (props) => ({
          color: props.colorMode === 'dark' ? 'whiteAlpha.800' : 'blackAlpha.800',
          _hover: {
            bg: props.colorMode === 'dark' ? 'whiteAlpha.100' : 'blackAlpha.100',
          },
        }),
        outline: (props) => ({
          borderColor: props.colorMode === 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400',
          color: props.colorMode === 'dark' ? 'white' : 'black',
          _hover: {
            bg: props.colorMode === 'dark' ? 'whiteAlpha.100' : 'blackAlpha.100',
            borderColor: props.colorMode === 'dark' ? 'white' : 'black',
          },
        }),
      },
    },

    Heading: {
      baseStyle: {
        fontFamily: 'heading',
        letterSpacing: 'heading',
        lineHeight: 'heading',
        fontWeight: '900',
      },
    },

    Text: {
      baseStyle: {
        letterSpacing: 'body',
        lineHeight: 'body',
      },
    },

    Input: {
      variants: {
        filled: (props) => ({
          field: {
            bg: props.colorMode === 'dark' ? 'whiteAlpha.100' : 'blackAlpha.50',
            borderWidth: '1px',
            borderColor: props.colorMode === 'dark' ? 'whiteAlpha.200' : 'blackAlpha.200',
            _hover: {
              bg: props.colorMode === 'dark' ? 'whiteAlpha.150' : 'blackAlpha.100',
              borderColor: props.colorMode === 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400',
            },
            _focus: {
              bg: props.colorMode === 'dark' ? 'whiteAlpha.100' : 'blackAlpha.50',
              borderColor: props.colorMode === 'dark' ? 'white' : 'black',
            },
          },
        }),
      },
      defaultProps: { variant: 'filled' },
    },

    Menu: {
      baseStyle: (props) => ({
        list: {
          bg: props.colorMode === 'dark' ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderColor: props.colorMode === 'dark' ? 'whiteAlpha.200' : 'blackAlpha.200',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        },
        item: {
          bg: 'transparent',
          _hover: { bg: props.colorMode === 'dark' ? 'whiteAlpha.100' : 'blackAlpha.100' },
          _focus: { bg: props.colorMode === 'dark' ? 'whiteAlpha.100' : 'blackAlpha.100' },
        },
      }),
    },

    Modal: {
      baseStyle: (props) => ({
        dialog: {
          bg: props.colorMode === 'dark' ? '#000' : '#fff',
          borderWidth: '1px',
          borderColor: props.colorMode === 'dark' ? 'whiteAlpha.200' : 'blackAlpha.200',
        },
        overlay: {
          backdropFilter: 'blur(8px)',
        },
      }),
    },
  },
});

export default theme;
