"use strict";

const exec = require("./src/execCommands.js");
const mysql = require("promise-mysql");
const readline = require("readline");
const config = require("./config/db/eshop.json");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// "Main" function
(function () {
    let command, subCom, arg1, arg2, arg3;

    rl.setPrompt('$: ');
    rl.prompt();

    // just checks if the input is "menu" or "help", displays a menu
    rl.on('line', async (question) => {
        if (question == 'menu' || question == 'help') {
            console.info("\n1. menu/help, shows this menu\n"
    +"2.  log <num>                             shows <num> recent rows\n"
    +"3.  shelf                                 shows which shelvs exists\n"
    +"4.  inventory                             shows where in inventory products are\n"
    +"5.  inventory <str>                       above command but filter on string\n"
    +"6.  invadd <productid> <shelf> <number>   adds new number of products to specified shelf\n"
    +"7.  invdel <poductid> <shelf> <number>    removes a number of products fron specified shelf\n"
    +`8.  order <search>                        searches all orders or
                                          specific order specified by <search>\n`
    +"9.  picklist <order id>                   creates a picklist for inventory personell\n"
    +"10. ship <order id>                       marks an order as shiped if it have been ordered\n"
    +"11. about                                 shows info about the developer about this system\n"
    +"12. clear                                 clears the screen\n"
    +"13. exit                                  exit the program\n"
            );
        } else {
            // splits up the enterd string in command and arguments respectivly
            subCom = question.split(" ");
            command = subCom[0];
            arg1 = subCom[1];
            arg2 = subCom[2];
            arg3 = subCom[3];

            // evaluate what the command and arguments is
            await evalCommand(command, arg1, arg2, arg3);

            rl.prompt();
        }
        rl.prompt();    // prompts after "menu"/"help" command is inputed
    });
})();

async function evalCommand(command, arg1, arg2, arg3) {
    let db = await mysql.createConnection(config);      // connection to database "eshop"

    // Variable that will contain the info that is printed out
    // when you enter the 'about'-command
    let appInfo = "\nDevelopers: Petter Johansson (Fullstack)\n";

    // checks what the command is equal to and executes
    // respective code with respective command
    if (command == 'log') {
        await exec.log(db, arg1);
    } else if (command == 'shelf') {
        await exec.shelf(db);
    } else if (command == 'inventory') {
        // if arguments are undefined run command without arguments, e.g exec.inventory(db);
        if (typeof arg1 === 'undefined') {
            await exec.inventory(db);
        } else {
            await exec.inventoryWithArgs(db, arg1);
        }
    } else if (command == 'invadd') {
        await exec.invAdd(db, arg1, arg2, arg3);
    } else if (command == 'invdel') {
        await exec.invDel(db, arg1, arg2, arg3);
    } else if (command == 'order') {
        if (typeof arg1 == 'undefined') {
            await exec.order(db);
        } else {
            await exec.orderWithArg(db, arg1);
        }
    } else if (command == 'picklist') {
        await exec.picklist(db, arg1);
    } else if (command == 'ship') {
        if (typeof arg1 == 'undefined') {
            console.info("You need to specify an order!");
        } else {
            await exec.ship(db, arg1);
        }
    } else if (command == 'about') {
        console.info(appInfo);
    } else if (command == 'clear') {
        process.stdout.write('\x1Bc');  // this exit codes does only work on UNIX systems
    } else if (command == 'exit' || command == 'quit') {
        exit();
    }
}

// terminates the program greacefully
function exit(code) {
    code = code || 0;
    console.info("Exiting with status code " + code);
    process.exit(code);
}
