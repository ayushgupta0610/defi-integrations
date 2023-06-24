//SPDX-License-Identifier: MIT
pragma solidity ^0.6.6;

import "@uniswap/v2-periphery/contracts/libraries/UniswapV2Library.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-periphery/contracts/UniswapV2Router02.sol";
// import "@uniswap/v2-periphery/contracts/libraries/UniswapV2LiquidityMathLibrary.sol";

contract ExampleDapp {
    address public factory;
    UniswapV2Router02 public uniswapV2router02;

    constructor(address _factory, address payable _uniswapV2router02) public {
        factory = _factory;
        uniswapV2router02 = UniswapV2Router02(_uniswapV2router02);
    }

    function pairInfo(
        address tokenA,
        address tokenB
    ) external view returns (uint reserveA, uint reserveB, uint totalSupply) {
        IUniswapV2Pair pair = IUniswapV2Pair(
            UniswapV2Library.pairFor(factory, tokenA, tokenB)
        );
        totalSupply = pair.totalSupply();
        (uint reserves0, uint reserves1, ) = pair.getReserves();
        (reserveA, reserveB) = tokenA == pair.token0()
            ? (reserves0, reserves1)
            : (reserves1, reserves0);
    }

    function swapForETH(
        address tokenToSwapWith,
        uint amountIn,
        uint amountOutMin
    ) external returns (uint[] memory amounts) {
        require(
            IERC20(tokenToSwapWith).transferFrom(
                msg.sender,
                address(this),
                amountIn
            ),
            "ED: transferFrom failed"
        );
        address[] memory path = new address[](2);
        path[0] = tokenToSwapWith;
        path[1] = uniswapV2router02.WETH();
        require(
            IERC20(tokenToSwapWith).approve(factory, amountIn),
            "ED: approve failed"
        );
        return
            uniswapV2router02.swapExactTokensForETH(
                amountIn,
                amountOutMin,
                path,
                msg.sender,
                block.timestamp
            );
    }

    function swapWithETH(
        address tokenToSwapTo,
        uint amountIn,
        uint amountOutMin
    ) external payable returns (uint[] memory amounts) {
        address[] memory path = new address[](2);
        path[0] = uniswapV2router02.WETH();
        path[1] = tokenToSwapTo;
        require(
            IERC20(tokenToSwapTo).approve(factory, amountIn),
            "ED: approve failed"
        );
        return
            uniswapV2router02.swapExactTokensForETH(
                amountIn,
                amountOutMin,
                path,
                msg.sender,
                block.timestamp
            );
    }

    // Would require user's approval on tokenToSwapWith for this contract for atleast amountIn value
    function swap(
        address tokenToSwapWith,
        address tokenToSwapTo,
        uint amountIn,
        uint amountOutMin
    ) external returns (uint[] memory amounts) {
        require(
            IERC20(tokenToSwapWith).transferFrom(
                msg.sender,
                address(this),
                amountIn
            ),
            "ED: transferFrom failed"
        );
        address[] memory path = new address[](2);
        path[0] = tokenToSwapWith;
        path[1] = tokenToSwapTo;
        require(
            IERC20(tokenToSwapWith).approve(factory, amountIn),
            "ED: approve failed"
        );
        return
            uniswapV2router02.swapExactTokensForTokens(
                amountIn,
                amountOutMin,
                path,
                msg.sender,
                block.timestamp
            );
    }
}
