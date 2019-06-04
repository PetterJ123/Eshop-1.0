"use strict";
const tableUtils = require("./table_utils.js");

async function log(db, arg1) {
    let sql, resAsTable;

    sql = `CALL show_logg(?)`;          // questionmark, placeholder for a argument

    await db.query(sql, [arg1]).then(function (rows) {
        resAsTable = tableUtils.logAsTable(rows);
        console.info(resAsTable);
    }).catch(function (error) {
        console.error(error);
    });
}

// Queries a stored procedure that fetches all data
// from rows named 'hyllplats'
async function shelf(db) {
    let sql, resAsTable;

    sql = `CALL show_shelf();`;

    await db.query(sql).then(function (res) {
        resAsTable = tableUtils.shelfAsTable(res[0]);
    }).catch(function (error) {
        console.error(error);
    });

    console.info(resAsTable);
}

async function inventory(db) {
    let sql, resAsTable;

    sql = `CALL show_inventory();`;

    await db.query(sql).then(function (res) {
        resAsTable = tableUtils.inventoryAsTable(res[0]);
    }).catch(function (error) {
        console.error(error);
    });

    console.info(resAsTable);
}

// function for searching the inventory
async function inventoryWithArgs(db, arg1) {
    let sql, resAsTable;
    let aInp = `%${arg1}%`;

    sql = `CALL filter_inventory(?);`;

    await db.query(sql, [aInp]).then(function (res) {
        resAsTable = tableUtils.fInventoryAsTable(res);
    }).catch(function (error) {
        console.error(error);
    });

    console.info(resAsTable);
}

async function invAdd(db, arg1, arg2, arg3) {
    let sql;

    sql = `CALL inv_add(?, ?, ?)`;

    await db.query(sql, [arg1, arg2, arg3]).then(function (res) {
        console.info('Rows affected: ', res.affectedRows);
    }).catch(function (error) {
        console.error(error);
    });
}

async function invDel(db, arg1, arg2, arg3) {
    let sql;

    sql = `CALL inv_del(?, ?, ?);`;

    await db.query(sql, [arg1, arg2, arg3]).then(function (res) {
        console.info('Rows affected: ', res.affectedRows);
    }).catch(function (error) {
        console.error(error);
    });
}

async function order(db) {
    let sql, resAsTable;

    // Below procedure is under procedures for
    // web-GUI in file 'ddl.sql'
    sql = `CALL all_orders();`;

    await db.query(sql).then(function (res) {
        resAsTable = tableUtils.orderAsTable(res[0]);
    }).catch(function(error) {
        console.error(error);
    });

    console.info(resAsTable);
}

async function orderWithArg(db, arg1) {
    let sql, resAsTable;

    sql = `CALL search_orders(?)`;

    await db.query(sql, [arg1]).then(function (res) {
        resAsTable = tableUtils.orderAsTable(res[0]);
    }).catch(function (error) {
        console.error(error);
    });

    console.info(resAsTable);
}

async function picklist(db, arg1) {
    let sqlGeneratePicklist, sqlShowPicklist, resAsTable;

    sqlGeneratePicklist = `CALL add_to_picklist(?);`;
    // Below query was so small so felt like it didn't need a procedure
    sqlShowPicklist = `SELECT * FROM plocklista WHERE ordernummer = ?`;

    await db.query(sqlGeneratePicklist, [arg1]).then(function(res) {
        console.info(`Added ${res.affectedRows} products to picklist`);
    }).catch(function(error) {
        console.info(error);
    });

    await db.query(sqlShowPicklist, [arg1]).then(function(res) {
        resAsTable = tableUtils.picklistAsTable(res);
        console.info(resAsTable);
    }).catch(function(error) {
        console.info(error);
    });
}

// Function for shipping an order
async function ship(db, arg1) {
    let sql;

    sql = `CALL ship_order(?);`;

    await db.query(sql, [arg1]).then(function(res) {
        console.info(`${res.affectedRows} different products have been shipped!`);
    }).catch(function(error) {
        console.info(error);
    });
}

module.exports = {
    log: log,
    shelf: shelf,
    inventory: inventory,
    inventoryWithArgs: inventoryWithArgs,
    invAdd: invAdd,
    invDel: invDel,
    order: order,
    orderWithArg: orderWithArg,
    picklist: picklist,
    ship: ship
};
