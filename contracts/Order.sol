//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Order {

    uint8 constant public STATUS_VALID = 1;
    uint8 constant public STATUS_CANCEL = 2;
    uint8 constant public STATUS_SUCCESS = 3;


    struct OrderObj {
        uint256 id;
        address creator;
        string token;
        uint256 amount;
        uint256 price;
        uint256 filled;
        uint8 status; //1 valid,2 cancel,3 finish
    }

    OrderObj[] public orderList;

    function createOrder(uint256 _id,string memory _token,uint256 _amount,uint256 _price,uint256 _filled) public{
        OrderObj memory order = OrderObj(
            _id,
            msg.sender,
            _token,
            _amount,
            _price,
            _filled,
            1
        );
        orderList.push(order);
    }

    function cancelOrder(uint256 _orderid) public{
        OrderObj memory order = orderList[_orderid];
        require(msg.sender == order.creator,"Order is not owned by sender");
        require(order.status == STATUS_VALID,"Order status is not valid");
        order.status = STATUS_CANCEL;
//        orderList.remove(order);
        delete orderList[_orderid];
    }
    function buy(uint256 _orderid) public{
        OrderObj memory order = orderList[_orderid];
        require(order.status == STATUS_VALID,"Order status is not valid");
        order.status = STATUS_SUCCESS;
        orderList[_orderid] = order;
//        orderList.remove(order);
//        delete orderList[_orderid];
    }

    function getList() public view returns(OrderObj[] memory){
        return orderList;
    }
}
