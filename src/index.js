"use strict";

// this file have functions used by the web-GUI

const mysql = require("promise-mysql");
const config = require("../config/db/eshop.json");
let db;

(async function () {
    db = await mysql.createConnection(config);
    process.on("exit", () => {
        db.end();
    });
})();

// Function for webGUI, shows categories
async function showCategories() {
    let sql, res;

    sql = `CALL show_categories();`;

    res = await db.query(sql);
    console.info(`SQL: ${sql} got ${res.length} rows`);

    return res[0];
}

// Function for showing all customers on the customers page
async function showCustomers() {
    let sql, res;

    sql = `CALL show_customers();`;

    res = await db.query(sql);
    console.info(`SQL: ${sql} got ${res.length} rows`);

    return res[0];
}

// Function for showing all orders over all customers
async function allOrders() {
    let sql, res;

    sql = `CALL all_orders();`;

    res = await db.query(sql);
    console.info(`SQL: ${sql} got ${res.length} rows`);

    return res[0];
}

async function showOrderProducts(onr, knr) {
    let sql, res;

    sql = `CALL show_ordered_products(?, ?);`;

    res = await db.query(sql, [onr, knr]);
    console.info(`SQL: ${sql} got ${res.length} rows`);

    return res[0];
}

// Function for creating an order for specified by customer id
async function createOrder(knr) {
    let sql;

    sql = `CALL create_order(?);`;

    await db.query(sql, [knr]).then(function (res) {
        console.info(`SQL ${sql} got ${res.length} rows`);
    }).catch(function(error) {
        console.info(error);
    });
}

// Function for deleteing an order specified by customer id
async function deleteOrder(onr) {
    let sql;

    sql = `CALL delete_order(?);`;

    await db.query(sql, [onr]).then(function (res) {
        console.info(`SQL ${sql} geto ${res.length} rows`);
    }).catch(function(error) {
        console.info(error);
    });
}

// Function for showing a specific customers orders
async function customerSpecOrders(knr) {
    let sql, res;

    sql = `CALL show_customer_orders(?);`;

    res = await db.query(sql, [knr]);
    console.info(`SQL: ${sql} got ${res.length} rows`);

    return res[0];
}

// Function for showing which products that can be added to an order
async function productsToAdd() {
    let sql, res;

    sql = `CALL show_products();`;

    res = await db.query(sql);
    console.info(`SQL: ${sql} got ${res.length} rows`);

    return res[0];
}

// Function for adding a product to order by ordernumber, productnumber
// customer-id and amout of products
async function addToOrder(onr, prdnr, knr, icount) {
    let sql;

    sql = `CALL add_to_order(?, ?, ?, ?);`;

    await db.query(sql, [onr, prdnr, knr, icount]).then(function (res) {
        console.info(res);
        console.info(`SQL: ${sql} got ${res.length} rows`);
    }).catch(function (error) {
        console.info(error);
    });
}

// Functio for getting products that a customers is about to order
async function productRows(onr) {
    let sql, res;

    sql = `CALL show_productRow(?);`;

    res = await db.query(sql, [onr]);
    console.info(`SQL: ${sql} got ${res.length} rows`);

    return res[0];
}

// Deletes a product from order by product number
async function deleteFromOrder(pnr) {
    let sql;

    sql = `CALL delete_from_order(?);`;

    await db.query(sql, [pnr]).then(function (res) {
        console.info(res);
        console.info(`SQL: ${sql} got ${res.length} rows`);
    }).catch(function (error) {
        console.info(error);
    });
}

// Function for setting an order as 'beställd'
async function submitOrder(onr) {
    let sql;

    sql = `CALL submit_order(?)`;

    await db.query(sql, [onr]).then(function (res) {
        console.info(res);
        console.info(`SQL: ${sql} got ${res.length} rows`);
    }).catch(function(error) {
        console.info(error);
    });
}

// Function for web-GUI, shows products
async function showProducts() {
    let sql, res;

    sql = `CALL show_products();`;

    res = await db.query(sql);
    console.info(`SQL: ${sql} got ${res.length} rows`);

    return res[0];
}

// function for creating a new product
async function createProduct(id, name, price, catId) {
    let sql;

    sql = `CALL create_product(?, ?, ?, ?);`;

    await db.query(sql, [id, name, price, catId]).then(function (res) {
        console.info(res);
        console.info(`SQL: ${sql} got ${res.length} rows`);
    }).catch(function (error) {
        console.error(error);
    });
}

async function viewProduct(id) {
    let sql, res;

    sql = `CALL view_product(?);`;

    res = await db.query(sql, [id]);
    console.info(`SQL: ${sql} got ${res.length} rows`);

    return res[0];
}

async function editProduct(id, name, price, category) {
    let sql, res;

    sql = `CALL edit_product(?, ?, ?, ?);`;

    res = await db.query(sql, [id, name, price, category]);
    console.info(`SQL: ${sql} got ${res.length} rows`);
}

async function deleteProduct(id) {
    let sql, res;

    sql = `CALL delete_product(?);`;

    res = await db.query(sql, [id]);
    console.info(`SQL ${sql} removed ${res.length} rows`);
}

module.exports = {
    showCategories: showCategories,
    showProducts: showProducts,
    createProduct: createProduct,
    viewProduct: viewProduct,
    editProduct: editProduct,
    deleteProduct: deleteProduct,
    showCustomers: showCustomers,
    allOrders: allOrders,
    customerSpecOrders: customerSpecOrders,
    productsToAdd: productsToAdd,
    addToOrder: addToOrder,
    productRows: productRows,
    deleteFromOrder: deleteFromOrder,
    submitOrder: submitOrder,
    createOrder: createOrder,
    deleteOrder: deleteOrder,
    showOrderProducts: showOrderProducts
};
