const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Order", async function () {
    it("Test Order", async function () {
        const Order = await ethers.getContractFactory("Order");
        const order = await Order.deploy();
        await order.deployed();
        console.log("order address=====", order.address);

        const TokenContract = await ethers.getContractFactory("TokenERC20");
        const token = await TokenContract.deploy("Wendy's First Token", "WFT");
        await token.deployed();
        console.log("addressValue=====", token.address);
    
    
        const USDTTokenContract = await ethers.getContractFactory("TokenERC20");
        const USDTtoken = await USDTTokenContract.deploy("USDT Token", "USDT");
        await USDTtoken.deployed();
        console.log("USDT addressValue=====", USDTtoken.address);


        token.approve(order.address,100)
        order.createOrder(0,token.address,100,50);


        token.approve(order.address,200)
        order.createOrder(1,token.address,200,50);

        token.approve(order.address,300)
        order.createOrder(2,token.address,300,50);

        token.approve(order.address,400)
        order.createOrder(3,token.address,400,50);

        let listLen = await order.getListLength();
        console.log("===listlen===",listLen);

        // for(let i =0;i<4;i++){
        //     console.log("order--",i,await order.orderList(i));
        // }

     

        console.log("===orderList --0 --===",   await order.orderList(0));

        USDTtoken.approve(order.address, 500)
        order.buy(0,USDTtoken.address,10);
        console.log("===orderList --0 --===",   await order.orderList(0));

        console.log("=====================================================")

        console.log("===orderList --2 --===",   await order.orderList(2));
        order.cancelOrder(2);
        console.log("===orderList --2 --===",   await order.orderList(2));


    });
});
