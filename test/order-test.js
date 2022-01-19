const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Order", function () {
    it("Test Order", async function () {
        const Order = await ethers.getContractFactory("Order");
        const order = await Order.deploy();
        await order.deployed();


        order.createOrder(0,'tokenName',100,50,10);
        order.createOrder(1,'tokenName2',200,50,20);
        order.createOrder(2,'tokenName3',300,50,30);
        order.createOrder(3,'tokenName4',400,50,40);


        let list = await order.getList();
        console.log("===list===",list);

        order.buy(0);

        let list2 = await order.getList();
        console.log("===after buy===",list2);

        order.cancelOrder(2);

        let list3 = await order.getList();
        console.log("===after cancel===",list3);

    });
});
