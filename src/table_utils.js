"use strict";

// this file contains functions that returns tables for the CLI
// hopefully the code will be self-explainatory

function shelfAsTable(res) {
    let str;

    str =  "+------------+\n";
    str += "| hylla      |\n";
    str += "+------------+\n";
    for (const row of res) {
        str += "| ";
        str += row.hyllplats.padEnd(10);
        str += " |\n";
    }
    str += "+------------+\n";

    return str;
}

function logAsTable(res) {
    let str;

    str =   "+-----+------------------------------------------------------------------+\n";
    str +=  "|  id | meddelande                                                       |\n";
    str +=  "+-----+------------------------------------------------------------------+\n";
    for (const row of res[0]) {
        str += "| ";
        str += row.id.toString().padStart(3);
        str += " | ";
        str += row.meddelande.padEnd(64);
        str += " |\n";
    }
    str +=  "+-----+------------------------------------------------------------------+\n";

    return str;
}

function inventoryAsTable(res) {
    let str;

    str =  "+-------+----------------+-------------+----------+\n";
    str += "|    id | namn           | hyllplats   |    antal |\n";
    str += "+-------+----------------+-------------+----------+\n";
    for (const row of res) {
        str += "| ";
        str += row.produktnummer.toString().padStart(5);
        str += " | ";
        str += row.namn.padEnd(15);
        str += "| ";
        str += row.hyllplats.padEnd(12);
        str += "| ";
        str += row.produktantal.toString().padStart(8);
        str += " |\n";
    }
    str += "+-------+----------------+-------------+----------+\n";

    return str;
}

function fInventoryAsTable(res) {
    let str;

    str =  "+-------+----------------+-------------+--------------+\n";
    str += "|    id | namn           | hyllplats   |        antal |\n";
    str += "+-------+----------------+-------------+--------------+\n";
    for (const row of res[0]) {
        str += "| ";
        str += row.produktnummer.toString().padStart(5);
        str += " | ";
        str += row.namn.padEnd(15);
        str += "| ";
        str += row.hyllplats.padEnd(12);
        str += "| ";
        str += row.produktantal.toString().padStart(12);
        str += " |\n";
    }
    str += "+-------+----------------+-------------+--------------+\n";

    return str;
}

function orderAsTable(res) {
    let str;

    str =  "+-------------+-------------+---------------------------+" +
    "---------------------------+--------------+------------+\n";
    str += "| ordernummer | kundnummer  |                    skapad |" +
    "                uppdaterad | produktrader | status     |\n";
    str += "+-------------+-------------+---------------------------+" +
    "---------------------------+--------------+------------+\n";
    for (const row of res) {
        str += "| ";
        str += row.ordernummer.toString().padStart(11);
        str += " | ";
        str += row.kundnummer.toString().padStart(11);
        str += " | ";
        str += row.skapad.toString().padStart(25);
        str += " | ";
        if (typeof row.uppdaterad == 'undefined' || row.uppdaterad == null) {
            str += "inte uppdaterad".padStart(25);
        } else {
            str += row.uppdaterad.toString().padStart(25);
        }
        str += " | ";
        str += row.produktrader.toString().padStart(12);
        str += " | ";
        str += row.o_status.padEnd(10);
        str += " |\n";
    }
    str += "+-------------+-------------+---------------------------+" +
    "---------------------------+--------------+------------+\n";

    return str;
}

function picklistAsTable(res) {
    let str;

    str =  "+-------------+-------------+--------------+------------+\n";
    str += "| ordernummer | produktnamn | produktantal | lagerplats |\n";
    str += "+-------------+-------------+--------------+------------+\n";
    for (const row of res) {
        str += "| ";
        str += row.ordernummer.toString().padStart(11);
        str += " | ";
        str += row.produktnummer.toString().padStart(12);
        str += " | ";
        str += row.produktantal.toString().padStart(11);
        str += " | ";
        str += row.lagerplats.padEnd(10);
        str += " |\n";
    }
    str += "+-------------+-------------+--------------+------------+\n";

    return str;
}

module.exports = {
    shelfAsTable: shelfAsTable,
    logAsTable: logAsTable,
    inventoryAsTable: inventoryAsTable,
    fInventoryAsTable: fInventoryAsTable,
    orderAsTable: orderAsTable,
    picklistAsTable: picklistAsTable
};
