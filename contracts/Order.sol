//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Order {

    uint8 constant public STATUS_VALID = 1;
    uint8 constant public STATUS_CANCEL = 2;
    uint8 constant public STATUS_SUCCESS = 3;

    IERC20 USDT;
    address owner;

    struct OrderObj {
        uint256 id;
        address creator;
        address token;
        uint256 amount;
        uint256 price;
        uint256 filled;
        uint8 status; //1 valid,2 cancel,3 finish
    }

    OrderObj[] public orderList;

    uint256 orderId;

    constructor(address _usdt) {
        USDT = IERC20(_usdt);
        owner = msg.sender;
        orderId = 0;
    }

    function createOrder(address _token, uint256 _amount, uint256 _price) public {
        OrderObj memory order = OrderObj(
            orderId,
            msg.sender,
            _token,
            _amount,
            _price,
            0,
            1
        );
        orderList.push(order);

        IERC20 token1 = IERC20(_token);
        token1.transferFrom(msg.sender, address(this), _amount);

        orderId ++;
    }

    function cancelOrder(uint256 _orderid) public {
        OrderObj storage order = orderList[_orderid];
        require(msg.sender == order.creator, "Order is not owned by sender");
        require(order.status == STATUS_VALID, "Order status is not valid");
        order.status = STATUS_CANCEL;

        IERC20 token1 = IERC20(order.token);
        token1.transfer(msg.sender,order.amount - order.filled);
    }

    function buy(uint256 _orderid, uint256 buyAmount) public {
        OrderObj storage order = orderList[_orderid];
        require(order.status == STATUS_VALID, "Order status is not valid");
        // require(order.amount - order.filled >= buyAmount, "Order is not valid"); // option #1

        require(order.amount - order.filled > 0, "insufficient token");
        uint256 fillAmount = buyAmount;
        if(order.amount - order.filled < buyAmount) {
            fillAmount = order.amount - order.filled;
        }

        order.filled += fillAmount;
        if(order.amount == order.filled) {
            order.status = STATUS_SUCCESS;
        }

        USDT.transferFrom(msg.sender, order.creator, fillAmount * order.price);
        IERC20(order.token).transfer(msg.sender, fillAmount);

        // order.amount = order.amount - buyAmount;
        // order.filled = order.filled + buyAmount;

        // if( order.amount == 0 ){
        //     order.status = STATUS_SUCCESS;
        // }else{
        //     order.status = STATUS_VALID;
        // }
        
        // orderList[_orderid] = order;

        // USDT.transferFrom(msg.sender,order.creator, buyAmount * order.price);

        // IERC20 token1 = IERC20(order.token);
        // token1.transfer(order.creator,order.amount);
    }

    function getListLength() public view returns (uint256){
        return orderList.length;
    }

    function withdrawUSDT(address _to) public {
        require(owner == msg.sender, 'only contract owner can withdraw assets');
        uint256 balance = USDT.balanceOf(address(this));
        require(balance > 0, 'insufficient fund');
        USDT.transfer(_to, balance);
    }
}
