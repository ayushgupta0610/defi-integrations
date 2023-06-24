const config = {
    mumbai: {
        rpcUrl: 'https://rpc-mumbai.maticvigil.com',
        gasStationUrl: 'https://gasstation-testnet.polygon.technology/v2',
    },
    polygon: {
        rpcUrl: 'https://polygon-rpc.com',
        gasStationUrl: 'https://gasstation.polygon.technology/v2',
        exampleDappAddress: '0x5426BE9ec8B548dC2CAd1c56dFF082681B8EF377',
        uniswapV2FactoryAddress: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
        uniswapV2Router02Address: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
        usdcAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        maticAddress: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
        usdtAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    },
    goerli: {
        rpcUrl: `https://goerli.infura.io/v3/${process.env.REACT_APP_INFURA_GOERLI_KEY}`,
    },
    ethereum: {
        rpcUrl: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_ETHEREUM_KEY}`,
    }
}

export default config;