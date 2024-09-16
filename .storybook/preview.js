/** @type { import('@storybook/server').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    server: {
      url: `https://lasmonadasdeelsa.ddev.site/storybook/components`,
    },
  },
};

export default preview;
