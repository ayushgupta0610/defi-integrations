//SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

// import "./IERC20.sol";
import "./UniswapV2/interfaces/IUniswapV2Pair.sol";
import "./UniswapV2/interfaces/IUniswapV2Router02.sol";
import "./UniswapV2/interfaces/IUniswapV2Factory.sol";

contract UniswapV2Wrapper {
    address public factory;
    IUniswapV2Router02 public uniswapV2router02;
    
    constructor(address _factory, address payable _uniswapV2router02) public {
        factory = _factory;
        // uniswapV2router02Address = _uniswapV2router02;
        uniswapV2router02 = IUniswapV2Router02(_uniswapV2router02);
    }

    // Exact TokenA => ETH
    // path[0] = tokenToSwapWith;
    // path[1] = uniswapV2router02.WETH();
    // Would require user's approval on path[0] for this contract for amountIn value
    function swapExactTokensForETH(address[] calldata path, uint amountIn, uint amountOutMin) external returns (uint[] memory amounts) {
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        address uniswapV2router02Address = address(uniswapV2router02);
        IERC20(path[0]).approve(uniswapV2router02Address, amountIn);
        return uniswapV2router02.swapExactTokensForETH(amountIn, amountOutMin, path, msg.sender, block.timestamp);
    } 

    // Exact ETH => TokenA
    // address[] memory path = new address[](2);
    // path[0] = uniswapV2router02.WETH();
    // path[1] = tokenToSwapTo;
    // No need of approval for tokenToSwapWith as the token to swap with is ETH
    function swapExactETHForTokens(address[] calldata path, uint amountIn, uint amountOutMin) external payable returns (uint[] memory amounts) {
        require(msg.value == amountIn, "ED: insufficient value provided");
        return uniswapV2router02.swapExactETHForTokens{value: amountIn}(amountOutMin, path, msg.sender, block.timestamp);
    }

    // Exact TokenA => TokenB
    // address[] memory path = new address[](2);
    // path[0] = tokenToSwapWith;
    // path[1] = tokenToSwapTo;
    // Would require user's approval on path[0] for this contract for amountIn value
    function swapExactTokensForTokens(address[] calldata path, uint amountIn, uint amountOutMin) external returns (uint[] memory amounts) {
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        address uniswapV2router02Address = address(uniswapV2router02);
        IERC20(path[0]).approve(uniswapV2router02Address, amountIn);
        return uniswapV2router02.swapExactTokensForTokens(amountIn, amountOutMin, path, msg.sender, block.timestamp);
    }

    // TokenA => Exact ETH
    // address[] memory path = new address[](2);
    // path[0] = tokenToSwapWith;
    // path[1] = tokenToSwapTo;
    function swapTokensForExactETH(address[] calldata path, uint amountOut, uint amountInMax) external returns (uint[] memory amounts) {
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountInMax);
        address uniswapV2router02Address = address(uniswapV2router02);
        IERC20(path[0]).approve(uniswapV2router02Address, amountInMax);
        return uniswapV2router02.swapTokensForExactETH(amountOut, amountInMax, path, msg.sender, block.timestamp);
    }

    // ETH => Exact TokenA
    // address[] memory path = new address[](2);
    // path[0] = uniswapV2router02.WETH();
    // path[1] = tokenToSwapTo;
    function swapETHForExactTokens(address[] calldata path, uint amountOut, uint amountInMax) external payable returns (uint[] memory amounts) {
        require(msg.value == amountInMax, "ED: insufficient value provided");
        return uniswapV2router02.swapETHForExactTokens{value: amountInMax}(amountOut, path, msg.sender, block.timestamp);
    }

    // TokenA => Exact TokenB
    // address[] memory path = new address[](2);
    // path[0] = tokenToSwapWith;
    // path[1] = tokenToSwapTo;
    function swapTokensForExactTokens(address[] calldata path, uint amountInMax, uint amountOut) external returns (uint[] memory amounts) {
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountInMax);
        address uniswapV2router02Address = address(uniswapV2router02);
        IERC20(path[0]).approve(uniswapV2router02Address, amountInMax); 
        return uniswapV2router02.swapTokensForExactTokens(amountOut, amountInMax, path, msg.sender, block.timestamp);
    }


    function addLiquidity(address tokenToSwapWith, address tokenToSwapTo, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin) external returns (uint amountA, uint amountB, uint liquidity) {
        IERC20(tokenToSwapWith).transferFrom(msg.sender, address(this), amountADesired);
        IERC20(tokenToSwapTo).transferFrom(msg.sender, address(this), amountBDesired);
        IERC20(tokenToSwapWith).approve(address(uniswapV2router02), amountADesired);
        IERC20(tokenToSwapTo).approve(address(uniswapV2router02), amountBDesired);
        // The liquidity would have to be in equal amounts of USD
        return uniswapV2router02.addLiquidity(
            tokenToSwapWith,
            tokenToSwapTo,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin,
            msg.sender,
            block.timestamp
        );
    }

    function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin) external payable returns (uint amountToken, uint amountETH, uint liquidity) {
        require(msg.value == amountETHMin, "ED: insufficient value provided");
        IERC20(token).transferFrom(msg.sender, address(this), amountTokenDesired);
        IERC20(token).approve(address(uniswapV2router02), amountTokenDesired);
        // The liquidity would have to be in equal amounts of USD
        return uniswapV2router02.addLiquidityETH(
            token,
            amountTokenDesired,
            amountTokenMin,
            amountETHMin,
            msg.sender,
            block.timestamp
        );
    }

    // TODO : User will not provide the noOfLPTokens -> He/She will provide the value of tokens he'd like to redeem
    // Also, put some checks if the user what he/she was trying to enter is the amount that is getting cashed out
    // Either the user will provide the value in USD or the no. of tokens for one token
    function removeLiquidity(address tokenA, address tokenB, uint noOfLPTokens, uint amountAMin, uint amountBMin) external returns (uint amountA, uint amountB) {
        // Check if the user would be getting X value / no of tokens like he expected or there was a sandwich attack that happened
        // Account for slippage factor in a way
        return uniswapV2router02.removeLiquidity(
            tokenA,
            tokenB,
            noOfLPTokens,
            amountAMin,
            amountBMin,
            msg.sender,
            block.timestamp
        );
    }

    // Also, put some checks if the user what he/she was trying to enter is the amount that is getting cashed out
    // Either the user will provide the value in USD or the no. of tokens for one token
    function removeLiquidityETH(address token, uint noOfLPTokens, uint amountTokenMin, uint amountETHMin) external payable returns (uint amountA, uint amountB) {
        // Check if the user would be getting X value / no of tokens like he expected or there was a sandwich attack that happened
        // Account for slippage factor in a way
        return uniswapV2router02.removeLiquidityETH(
            token,
            noOfLPTokens,
            amountTokenMin,
            amountETHMin,
            payable(msg.sender),
            block.timestamp
        );
    }
}