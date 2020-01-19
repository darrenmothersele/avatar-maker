const purgeCss = require('@fullhuman/postcss-purgecss')({
  // Specify the paths to all of the template files in your project
  content: [
    './src/**/*.html',
    './src/**/*.ts',
  ],

  // Include any special characters you're using in this regular expression
  defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
});

module.exports = config => {
  return {
    ...config,
    module: {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test   : /\.css$/,
          loader : 'postcss-loader',
          options: {
            ident  : 'postcss',
            syntax: 'postcss-scss',
            plugins: () => [
              require('postcss-easy-import'),
              require('tailwindcss'),
              require('autoprefixer'),
              ...config.mode === 'production'
                ? [
                  purgeCss,
                  require('postcss-discard-comments')({ removeAll: true })
                ]
                : []
            ]
          }
        }
      ]
    }
  }
};
