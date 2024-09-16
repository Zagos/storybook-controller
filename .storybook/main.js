/** @type { import('@storybook/server-webpack5').StorybookConfig } */
const config = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(json|yaml|yml)"],
  addons: [
    "@storybook/addon-webpack5-compiler-swc",
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
  ],
  framework: {
    name: "@storybook/server-webpack5",
    options: {},
  },
  webpackFinal: async (config) => {
    // Añade el loader para Twig
    config.module.rules.push({
      test: /\.twig$/,
      use: [
        {
          loader: 'twig-loader', // Asegúrate de haber instalado twig-loader
          options: {
            // Opciones del loader si es necesario
          },
        },
      ],
    });

    return config;
  },
};

export default config;
