/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    /** Disable the `X-Powered-By: Next.js` response header. */
    poweredByHeader: false,

    /**
     * Set custom `process.env.SOMETHING` values to use in the application.
     * @see https://nextjs.org/docs/api-reference/next.config.js/environment-variables
     */
    // env: {
    //     ELASTIC_URL: elasticUrl,
    //     GRAPHQL_URL: graphqlUrl,
    // },

}

module.exports = nextConfig


/**
 * Enhances the Next config with the ability to:
 * - Analyze the webpack bundle
 * - Load images from JavaScript.
 * - Load SCSS files from JavaScript.
 */
// const withBundleAnalyzer = require('@next/bundle-analyzer');
// module.exports = withBundleAnalyzer({
//     enabled: process.env.ANALYZE === 'true',
// })(nextConfig);
