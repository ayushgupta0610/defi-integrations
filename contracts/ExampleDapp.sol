//SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "./IERC20.sol";
import "./UniswapV2/interfaces/IUniswapV2Pair.sol";
import "./UniswapV2/interfaces/IUniswapV2Router02.sol";
import "./UniswapV2/interfaces/IUniswapV2Factory.sol";

contract ExampleDapp {
    address public factory;
    IUniswapV2Router02 public uniswapV2router02;
    
    constructor(address _factory, address payable _uniswapV2router02) public {
        factory = _factory;
        // uniswapV2router02Address = _uniswapV2router02;
        uniswapV2router02 = IUniswapV2Router02(_uniswapV2router02);
    }

    function pairInfo(address tokenA, address tokenB) external view returns (uint reserveA, uint reserveB, uint totalSupply) {
        address _pair = IUniswapV2Factory(factory).getPair(tokenA, tokenB);
        IUniswapV2Pair pair = IUniswapV2Pair(_pair);
        totalSupply = pair.totalSupply();
        (uint reserves0, uint reserves1,) = pair.getReserves();
        (reserveA, reserveB) = tokenA == pair.token0() ? (reserves0, reserves1) : (reserves1, reserves0);
    }

    // Exact TokenA => ETH
    // Would require user's approval on tokenToSwapWith for this contract for atleast amountIn value
    function swapExactTokensForETH(address tokenToSwapWith, uint amountIn, uint amountOutMin) external returns (uint[] memory amounts) {
        require(IERC20(tokenToSwapWith).transferFrom(msg.sender, address(this), amountIn), "ED: transferFrom failed");
        address[] memory path = new address[](2);
        path[0] = tokenToSwapWith;
        path[1] = uniswapV2router02.WETH();
        address uniswapV2router02Address = address(uniswapV2router02);
        require(IERC20(tokenToSwapWith).approve(uniswapV2router02Address, amountIn), "ED: approve failed");
        return uniswapV2router02.swapExactTokensForETH(amountIn, amountOutMin, path, msg.sender, block.timestamp);
    } 

    //  Exact ETH => TokenA
    // No need of approval for tokenToSwapWith as the token to swap with is ETH
    function swapExactETHForTokens(address tokenToSwapTo, uint amountIn, uint amountOutMin) external payable returns (uint[] memory amounts) {
        address[] memory path = new address[](2);
        path[0] = uniswapV2router02.WETH();
        path[1] = tokenToSwapTo;
        return uniswapV2router02.swapExactETHForTokens{value: amountIn}(amountOutMin, path, msg.sender, block.timestamp);
    }

    // Exact TokenA => TokenB
    // Would require user's approval on tokenToSwapWith for this contract for atleast amountIn value
    function swapExactTokensForTokens(address tokenToSwapWith, address tokenToSwapTo, uint amountIn, uint amountOutMin) external returns (uint[] memory amounts) {
        require(IERC20(tokenToSwapWith).transferFrom(msg.sender, address(this), amountIn), "ED: transferFrom failed");
        address[] memory path = new address[](2);
        path[0] = tokenToSwapWith;
        path[1] = tokenToSwapTo;
        address uniswapV2router02Address = address(uniswapV2router02);
        require(IERC20(tokenToSwapWith).approve(uniswapV2router02Address, amountIn), "ED: approve failed");
        return uniswapV2router02.swapExactTokensForTokens(amountIn, amountOutMin, path, msg.sender, block.timestamp);
    }

    // TokenA => Exact ETH
    function swapTokensForExactETH(address tokenToSwapWith, uint amountOut, uint amountInMax) external returns (uint[] memory amounts) {
        require(IERC20(tokenToSwapWith).transferFrom(msg.sender, address(this), amountInMax), "ED: transferFrom failed");
        address[] memory path = new address[](2);
        path[0] = tokenToSwapWith;
        path[1] = uniswapV2router02.WETH();
        address uniswapV2router02Address = address(uniswapV2router02);
        require(IERC20(tokenToSwapWith).approve(uniswapV2router02Address, amountInMax), "ED: approve failed");
        return uniswapV2router02.swapTokensForExactETH(amountOut, amountInMax, path, msg.sender, block.timestamp);
    }

    // ETH => Exact TokenA
    function swapETHForExactTokens(address tokenToSwapTo, uint amountOut, uint amountInMax) external payable returns (uint[] memory amounts) {
        address[] memory path = new address[](2);
        path[0] = uniswapV2router02.WETH();
        path[1] = tokenToSwapTo;
        return uniswapV2router02.swapETHForExactTokens{value: amountInMax}(amountOut, path, msg.sender, block.timestamp);
    }

    // TokenA => Exact TokenB
    function swapTokensForExactTokens(address tokenToSwapWith, address tokenToSwapTo, uint amountInMax, uint amountOut) external returns (uint[] memory amounts) {
        require(IERC20(tokenToSwapWith).transferFrom(msg.sender, address(this), amountInMax), "ED: transferFrom failed");
        address[] memory path = new address[](2);
        path[0] = tokenToSwapWith;
        path[1] = tokenToSwapTo;
        address uniswapV2router02Address = address(uniswapV2router02);
        require(IERC20(tokenToSwapWith).approve(uniswapV2router02Address, amountInMax), "ED: approve failed"); 
        return uniswapV2router02.swapTokensForExactTokens(amountOut, amountInMax, path, msg.sender, block.timestamp);
    }


}
