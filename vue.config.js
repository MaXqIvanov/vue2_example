const deps = require('./package.json').dependencies;
const webpack = require('webpack');
const container = webpack.container;
const { ModuleFederationPlugin } = container;

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const _PRODUCTION_ = process.env.NODE_ENV === 'production';

const SERVICES_URL = process.env.SERVICES_URL || '';
const publicPath = _PRODUCTION_ ? `${SERVICES_URL}/balance` : 'http://localhost:3007';
const proxyTarget = _PRODUCTION_ ? `${SERVICES_URL}/balance` : 'http://localhost:3200';

const shared = Object.keys(deps).reduce((acc, dep) => {
	acc[dep] = {
		import: dep,
		shareKey: dep,
		requiredVersion: deps[dep],
		shareScope: 'default'
	};
	return acc;
}, {});

module.exports = {
	devServer: {
		port: 3007,
		historyApiFallback: true,
		proxy: {
			'/api': {
				target: proxyTarget
			}
		},
		hot: true
	},
	publicPath: publicPath,

	productionSourceMap: process.env.NODE_ENV !== 'production',

	configureWebpack: (config) => {
		const moduleFederationPlugin = new ModuleFederationPlugin({
			name: 'test',
			filename: 'remoteEntry.js',
			exposes: {
				'./App': './src/hostEntry.ts'
			},
			shared
		});

		config.plugins.push(moduleFederationPlugin);
	},

	pluginOptions: {
		webpack: {
			dir: ['./webpack']
		}
	}
};
