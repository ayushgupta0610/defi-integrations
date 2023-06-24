const config = {
    mumbai: {
        rpcUrl: 'https://rpc-mumbai.maticvigil.com',
        gasStationUrl: 'https://gasstation-testnet.polygon.technology/v2',
    },
    polygon: {
        rpcUrl: 'https://polygon-rpc.com',
        gasStationUrl: 'https://gasstation.polygon.technology/v2',
    },
    goerli: {
        rpcUrl: `https://goerli.infura.io/v3/${process.env.REACT_APP_INFURA_GOERLI_KEY}`,
    },
    ethereum: {
        rpcUrl: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_ETHEREUM_KEY}`,
    }
}

export default config;