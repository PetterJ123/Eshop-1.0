// Here be routes througout the app

"use strict";

const express = require('express');
const router = express.Router();
const index = require("../src/index.js");
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });

router.get('/eshop/index', async (req, res) => {
    res.render('../views/index');
});

// Route for category page where all categories are displayed
router.get('/eshop/category', async (req, res) => {
    let data = [];

    data.res = await index.showCategories();

    res.render('../views/category', data);
});

// Route to show all orders over all customers
router.get("/eshop/orders", async (req, res) => {
    let data = [];

    data.res = await index.allOrders();

    console.info(data.res[0]);

    res.render("../views/orders", data);
});

// Route for showing all customers
router.get("/eshop/customers", async (req, res) => {
    let data = [];

    data.res = await index.showCustomers();

    res.render('../views/customers', data);
});

router.get("/eshop/customer/:knr/ordered_products/:onr", async (req, res) => {
    let knr = req.params.knr;
    let onr = req.params.onr;
    let data = [];

    data.res = await index.showOrderProducts(onr, knr);

    res.render("../views/orderedProducts", data);
});

// Route for showing a specific customer's orders
// @param delmsg : is the message that will be prompted when user deletes an order
router.get("/eshop/customer/:knr/customer_orders", async (req, res) => {
    let knr = req.params.knr;
    let delmsg = `Do you really want to delete this order?
    It will also remove all products in this order! This can't be undone!`;

    let data = {
        kundnum: knr,
        dmsg: delmsg
    };

    data.res = await index.customerSpecOrders(knr);

    res.render("../views/customerOrders", data);
});

// Route for creating a new order if a customer is not connected to any orders
router.post("/eshop/customer/create_order", urlencodedParser, async (req, res) => {
    console.info(JSON.stringify(req.body, null, 4));
    let knr = req.body.cro;

    await index.createOrder(knr);

    res.redirect("back");
});


// Route for deleting an order, also deletes all product rows connected to the order
router.post("/eshop/customer/delete_order", urlencodedParser, async (req, res) => {
    console.info(JSON.stringify(req.body, null, 4));
    let onr = req.body.delor;

    await index.deleteOrder(onr);

    res.redirect("back");
});

// Route for showing products that can be added to an order
router.get("/eshop/customer/:knr/customer_orders/:onr/add", async (req, res) => {
    let onr = req.params.onr;
    let knr = req.params.knr;
    let data = {
        ordernum: onr,
        kundnum: knr
    };

    data.res = await index.productsToAdd();
    data.ordnr = await index.productRows(onr);

    res.render("../views/productToAdd", data);
});

// Route for form submitting products to an order
router.post("/eshop/customer/add_to_order", urlencodedParser, async (req, res) => {
    console.info(JSON.stringify(req.body, null, 4));

    let prdnr = req.body.prdnr;
    let onr = req.body.ordnr;
    let knr = req.body.knr;
    let icount = req.body.count;

    await index.addToOrder(onr, prdnr, knr, icount);

    res.redirect("back");
});

// Route for deleting products from an order
router.post("/eshop/customer/order/delete", urlencodedParser, async (req, res) => {
    console.info(JSON.stringify(req.body, null, 4));
    let pnr = req.body.submitDel;

    await index.deleteFromOrder(pnr);

    res.redirect("back");
});

router.post("/eshop/customer/submit_order", urlencodedParser, async (req, res) => {
    console.info(JSON.stringify(req.body, null, 4));
    let onr = req.body.submitOrder;

    await index.submitOrder(onr);

    res.redirect("back");
});

// Route for about page using GET
router.get("/eshop/about", async (req, res) => {
    res.render("../views/about");
});

// Route for page of products using GET
router.get('/eshop/products', async (req, res) => {
    let data = [];

    data.res = await index.showProducts();

    res.render('../views/product', data);
});

// router for product-page, doing POST-method for creating a new product
router.post("/eshop/products", urlencodedParser, async (req, res) => {
    console.info(JSON.stringify(req.body, null, 4));

    await index.createProduct(
        req.body.id,
        req.body.name,
        req.body.price,
        req.body.cat_id
    );

    res.redirect("/eshop/products");
});

// GET method for viewing a product
router.get("/eshop/product/:id", async (req, res) => {
    let id = req.params.id;
    let data = {
        title: `Product: ${id}`,
        product: id
    };

    data.res = await index.viewProduct(id);

    res.render("../views/viewProduct", data);
});

// GET function for editing a product in web GUI
router.get("/eshop/product/edit/:id", async (req, res) => {
    let id = req.params.id;
    let data = {
        title: `Edit product ${id}`,
        product: id
    };

    data.res = await index.viewProduct(id);

    res.render("../views/editProduct", data);
});

// POST function for editing a product in web GUI
router.post("/eshop/product/edit", urlencodedParser, async (req, res) => {
    let id = req.body.id;
    let name = req.body.name;
    let price = req.body.price;
    let category = req.body.category;

    await index.editProduct(id, name, price, category);
    res.redirect(`edit/${id}`);
});

router.post("/eshop/product/delete", urlencodedParser, async (req, res) => {
    let id = req.body.doit;

    await index.deleteProduct(id);

    res.redirect("back");
});

module.exports = router;
