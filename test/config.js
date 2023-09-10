const chains = {
    hardhat: {
        uniswapV2Router02: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        uniswapFactory: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
        usdcAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        wethAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", 
    },
    polygon: {
        uniswapV2Router02: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
        uniswapFactory: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
        usdcAddress: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        wethAddress: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", 
    }
}

module.exports = {
    chains
}

