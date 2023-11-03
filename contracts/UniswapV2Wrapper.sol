//SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

// import "./IERC20.sol";
import "./UniswapV2/interfaces/IUniswapV2Pair.sol";
import "./UniswapV2/interfaces/IUniswapV2Router02.sol";
import "./UniswapV2/interfaces/IUniswapV2Factory.sol";
import { ReentrancyGuard } from "./Openzeppelin/ReentrancyGuard.sol";
// import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract UniswapV2Wrapper is ReentrancyGuard {
    address public factory;
    IUniswapV2Router02 public uniswapV2router02;
    
    constructor(address _factory, address payable _uniswapV2router02) public {
        factory = _factory;
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
    // path[0] = uniswapV2router02.WETH();
    // path[1] = tokenToSwapTo;
    // No need of approval for tokenToSwapWith as the token to swap with is ETH
    function swapExactETHForTokens(address[] calldata path, uint amountIn, uint amountOutMin) external payable nonReentrant returns (uint[] memory amounts) {
        require(msg.value == amountIn, "ED: insufficient value provided");
        return uniswapV2router02.swapExactETHForTokens{value: amountIn}(amountOutMin, path, msg.sender, block.timestamp);
    }

    // Exact TokenA => TokenB
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
    // path[0] = tokenToSwapWith;
    // path[1] = tokenToSwapTo;
    function swapTokensForExactETH(address[] calldata path, uint amountOut, uint amountInMax) external returns (uint[] memory amounts) {
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountInMax);
        address uniswapV2router02Address = address(uniswapV2router02);
        IERC20(path[0]).approve(uniswapV2router02Address, amountInMax);
        amounts = uniswapV2router02.swapTokensForExactETH(amountOut, amountInMax, path, msg.sender, block.timestamp);
        // Return the remaining amount to the user for both the tokens
        IERC20(path[0]).transfer(msg.sender, amountInMax-amounts[0]);
    }

    // ETH => Exact TokenA
    // path[0] = uniswapV2router02.WETH();
    // path[1] = tokenToSwapTo;
    function swapETHForExactTokens(address[] calldata path, uint amountOut, uint amountInMax) external payable nonReentrant returns (uint[] memory amounts) {
        require(msg.value == amountInMax, "ED: insufficient value provided");
        amounts = uniswapV2router02.swapETHForExactTokens{value: amountInMax}(amountOut, path, msg.sender, block.timestamp);
        // Return the remaining amount to the user for both the tokens
        payable(msg.sender).transfer(amountInMax-amounts[0]);
    }

    // TokenA => Exact TokenB
    // address[] memory path = new address[](2);
    // path[0] = tokenToSwapWith;
    // path[1] = tokenToSwapTo;
    function swapTokensForExactTokens(address[] calldata path, uint amountInMax, uint amountOut) external returns (uint[] memory amounts) {
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountInMax);
        address uniswapV2router02Address = address(uniswapV2router02);
        IERC20(path[0]).approve(uniswapV2router02Address, amountInMax); 
        amounts = uniswapV2router02.swapTokensForExactTokens(amountOut, amountInMax, path, msg.sender, block.timestamp);
        IERC20(path[0]).transfer(msg.sender, amountInMax-amounts[0]);
    }


    function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin) external returns (uint amountA, uint amountB, uint liquidity) {
        IERC20(tokenA).transferFrom(msg.sender, address(this), amountADesired);
        IERC20(tokenB).transferFrom(msg.sender, address(this), amountBDesired);
        IERC20(tokenA).approve(address(uniswapV2router02), amountADesired);
        IERC20(tokenB).approve(address(uniswapV2router02), amountBDesired);
        // The liquidity would have to be in equal amounts of USD
        (amountA, amountB, liquidity) = uniswapV2router02.addLiquidity(
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin,
            msg.sender,
            block.timestamp
        );
        // Return the remaining amount to the user for both the tokens
        IERC20(tokenA).transfer(msg.sender, amountADesired-amountA);
        IERC20(tokenB).transfer(msg.sender, amountBDesired-amountB);
    }

    function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin) external payable nonReentrant returns (uint amountToken, uint amountETH, uint liquidity) {
        require(msg.value == amountETHMin, "ED: insufficient value provided");
        IERC20(token).transferFrom(msg.sender, address(this), amountTokenDesired);
        IERC20(token).approve(address(uniswapV2router02), amountTokenDesired);
        // The liquidity would have to be in equal amounts of USD
        (amountToken, amountETH, liquidity) = uniswapV2router02.addLiquidityETH{ value: amountETHMin }(
            token,
            amountTokenDesired,
            amountTokenMin,
            amountETHMin,
            msg.sender,
            block.timestamp
        );
        // Return the remaining amount to the user for both the tokens
        IERC20(token).transfer(msg.sender, amountTokenDesired-amountToken);
        payable(msg.sender).transfer(msg.value-amountETH);
    }

    function pairInfo(address tokenA, address tokenB) external view returns (uint reserveA, uint reserveB, uint totalSupply) {
        address pairAddress = IUniswapV2Factory(factory).getPair(tokenA, tokenB);
        (uint reserve0, uint reserve1, ) = IUniswapV2Pair(pairAddress).getReserves();
        (reserveA, reserveB) = tokenA == IUniswapV2Pair(pairAddress).token0() ? (reserve0, reserve1) : (reserve1, reserve0);
        totalSupply = IUniswapV2Pair(pairAddress).totalSupply();
    }

    // Also, put some checks if the user what he/she was trying to enter is the amount that is getting cashed out
    // Either the user will provide the value in USD or the no. of tokens for one token. User will not provide the noOfLPTokens -> He/She will provide the value of tokens he'd like to redeem
    function removeLiquidityForAToken(address tokenA, address tokenB, uint noOfLPTokens, uint amountAMin) external returns (uint amountA, uint amountB) {
        // Check if the user would be getting X value / no of tokens | Put require to check for sandwich attack
        // Account for slippage factor in a way
        // TODO: Calculate the min amount of token B that the user would be getting wrt the no. of LP tokens he/she is trying to remove
        uint amountBMin;
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
    function removeLiquidityETH(address token, uint noOfLPTokens, uint amountETHMin) external payable returns (uint amountA, uint amountB) {
        // Check if the user would be getting X value / no of tokens like he expected or there was a sandwich attack that happened
        // Account for slippage factor in a way
        // TODO: Calculate the min amount of token that the user would be getting wrt the no. of LP tokens he/she is trying to remove
        uint amountTokenMin;
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