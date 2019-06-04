USE eshop;

DROP TABLE IF EXISTS plocklista;
DROP TABLE IF EXISTS produktrad;
DROP TABLE IF EXISTS ordrar;
DROP TABLE IF EXISTS lager;
DROP TABLE IF EXISTS produktregister;
DROP TABLE IF EXISTS kategori;
DROP TABLE IF EXISTS kundregister;
DROP TABLE IF EXISTS logg;

CREATE TABLE kundregister
(
    `kundnummer` INT NOT NULL PRIMARY KEY,
    `adress` VARCHAR(45) NOT NULL,
    `telefonnummer` BIGINT,
    `personnummer` BIGINT NOT NULL,
    `namn` VARCHAR(45) NOT NULL,

    INDEX `idx_namn` (`namn` ASC)
)ENGINE=InnoDB;

CREATE TABLE kategori
(
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `kategori_typ` VARCHAR(25) NOT NULL
)ENGINE=InnoDB;

CREATE TABLE produktregister
(
    `produktnummer` INT NOT NULL PRIMARY KEY,
    `kategori` INT NOT NULL,
    `namn` VARCHAR(20) NOT NULL,
    `pris` INT NOT NULL,
    `beskrivning` TEXT,

    INDEX `idx_namn` (`namn` ASC),

    FOREIGN KEY (kategori) REFERENCES kategori(id)
)ENGINE=InnoDB;

CREATE TABLE ordrar
(
    `ordernummer` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `kundnummer` INT NOT NULL,
    `skapad` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `uppdaterad` TIMESTAMP DEFAULT NULL
                ON UPDATE CURRENT_TIMESTAMP,
    `bestalld` TIMESTAMP DEFAULT NULL,
    `skickad` TIMESTAMP,
    `produktrader` INT DEFAULT 0,

    INDEX `idx_skapad` (`skapad` ASC),
    INDEX `idx_uppdaterad` (`uppdaterad` ASC),

    FOREIGN KEY (kundnummer) REFERENCES kundregister(kundnummer)
)ENGINE=InnoDB;

CREATE TABLE produktrad
(
    `order_id` INT NOT NULL,
    `produkt_id` INT NOT NULL,
    `kund_id` INT NOT NULL,
    `produktantal` INT NOT NULL,

    FOREIGN KEY (produkt_id) REFERENCES produktregister(produktnummer),
    FOREIGN KEY (kund_id) REFERENCES kundregister(kundnummer),
    FOREIGN KEY (order_id) REFERENCES ordrar(ordernummer),

    PRIMARY KEY (order_id, produkt_id)
)ENGINE=InnoDB;

CREATE TABLE lager
(
    `hyllplats` VARCHAR(3) PRIMARY KEY,
    `produkt_id` INT,
    `produktantal` INT NOT NULL,

    INDEX `idx_hyllplats` (`hyllplats` ASC),
    INDEX `idx_produktantal` (`produktantal` ASC),

    FOREIGN KEY (produkt_id) REFERENCES produktregister(produktnummer)
)ENGINE=InnoDB;

CREATE TABLE plocklista
(
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `ordernummer` INT NOT NULL,
    `lagerplats` VARCHAR(3) NOT NULL,
    `produktantal` INT NOT NULL,
    `produktnummer` INT NOT NULL
)ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS logg
(
    `id`INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `meddelande` TEXT NOT NULL,
    `tid` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)ENGINE=InnoDB;

-- ============================
--         Triggers           |
-- ============================

DROP TRIGGER IF EXISTS insert_logg;
DROP TRIGGER IF EXISTS update_logg;
DROP TRIGGER IF EXISTS delete_logg;

-- Trigger, eachtime a row in produktregister is inserted
-- Outputs info to table 'logg'
CREATE TRIGGER insert_logg
AFTER INSERT
ON produktregister FOR EACH ROW
    INSERT INTO logg(`meddelande`)
        VALUES (CONCAT('Produkt "', NEW.namn, '"', " ", ' lades till i tabellen produktregister!'))
;

-- Trigger, eachtime row in produktregister is updated
-- Outputs info to table 'logg'
CREATE TRIGGER update_logg
AFTER UPDATE
ON produktregister FOR EACH ROW
    INSERT INTO logg (`meddelande`)
        VALUES (CONCAT('Produkt "', OLD.namn,'"', " ",' uppdaterades i tabellen produktregister!'))
;

-- Trigger, eachtime a row in produktregister is deleted
-- Outputs info to table 'logg'
CREATE TRIGGER delete_logg
AFTER DELETE
ON produktregister FOR EACH ROW
    INSERT INTO logg (`meddelande`)
        VALUES (CONCAT('Produkt "', OLD.namn, '"', " ",' togs bort ur tabellen produktregister'))
;

-- ==================================
-- |           Functions            |
-- ==================================

DROP FUNCTION IF EXISTS order_status;

DELIMITER $$

CREATE FUNCTION order_status(
    in_onr INT
)
RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
    IF in_onr NOT IN (SELECT ordernummer FROM ordrar) THEN
        RETURN "Error: ordernummer doesn't exist";
    END IF;

    SET @created = (SELECT skapad FROM ordrar WHERE ordernummer = in_onr);
    SET @latest = @created;
    SET @updated = (SELECT uppdaterad FROM ordrar WHERE ordernummer = in_onr);
    SET @order_submitted = (SELECT bestalld FROM ordrar WHERE ordernummer = in_onr);
    SET @skickad = (SELECT skickad FROM ordrar WHERE ordernummer = in_onr);
    SET @status = "none";

    IF @updated > @created THEN
        SET @latest = @updated;
    END IF;

    IF @latest = @updated THEN
        SET @status = "uppdaterad";
    END IF;

    -- If an order have been ordered set its status to 'beställd'
    IF @order_submitted >= @updated THEN
        SET @latest = @order_submitted;
    END IF;

    IF @latest = @order_submitted THEN
        SET @status = "beställd";
    END IF;

    -- IF and order have been shipped set its status to 'skickad'
    IF @skickad > @order_submitted THEN
        SET @latest = @skickad;
    END IF;

    -- If the latest event is that an order have been shipped
    IF @latest = @skickad THEN
        SET @status = "skickad";
    END IF;

    -- If the latest event is that a order have been created
    -- set its status to 'skapad'
    IF @latest = @created THEN
        SET @status = "skapad";
    END IF;

    RETURN @status;
END
$$

DELIMITER ;

-- =================================
-- |   Stored procedures           |
-- =================================

DROP PROCEDURE IF EXISTS show_categories;
DROP PROCEDURE IF EXISTS show_products;
DROP PROCEDURE IF EXISTS show_shelf;
DROP PROCEDURE IF EXISTS show_logg;
DROP PROCEDURE IF EXISTS show_inventory;
DROP PROCEDURE IF EXISTS filter_inventory;
DROP PROCEDURE IF EXISTS inv_add;
DROP PROCEDURE IF EXISTS inv_del;
DROP PROCEDURE IF EXISTS create_product;
DROP PROCEDURE IF EXISTS view_product;
DROP PROCEDURE IF EXISTS edit_product;
DROP PROCEDURE IF EXISTS delete_product;
DROP PROCEDURE IF EXISTS show_customers;
DROP PROCEDURE IF EXISTS all_orders;
DROP PROCEDURE IF EXISTS show_customer_orders;
DROP PROCEDURE IF EXISTS add_to_order;
DROP PROCEDURE IF EXISTS search_orders;
DROP PROCEDURE IF EXISTS show_productRow;
DROP PROCEDURE IF EXISTS delete_from_order;
DROP PROCEDURE IF EXISTS create_order;
DROP PROCEDURE IF EXISTS delete_order;
DROP PROCEDURE IF EXISTS submit_order;
DROP PROCEDURE IF EXISTS show_ordered_products;
DROP PROCEDURE IF EXISTS add_to_picklist;
DROP PROCEDURE IF EXISTS show_picklist;
DROP PROCEDURE IF EXISTS ship_order;

-- ===============================================
-- ====================WEB GUI====================
-- ===============================================

DELIMITER $$

-- Procedure for web-GUI, fetching category-types from table 'kategori'
CREATE PROCEDURE show_categories(
)
BEGIN
    SELECT kategori_typ, id FROM kategori;
END
$$

-- Procedure for web-GUI, fetching from table 'kundregister'
CREATE PROCEDURE show_customers(
)
BEGIN
    SELECT
        kundnummer,
        adress,
        namn,
        telefonnummer
    FROM kundregister;
END
$$

-- Procedure for web-GUI, getting all orders that have been made
CREATE PROCEDURE all_orders(
)
BEGIN
    SELECT
        ordernummer,
        o_status,
        kundnummer,
        skapad,
        uppdaterad,
        produktrader,
        namn
    FROM v_all_orders
    ;
END
$$

-- Procedure for showing which products there are in an order
CREATE PROCEDURE show_ordered_products(
    a_onr INT,
    a_knr INT
)
BEGIN
    SELECT
        *
    FROM v_show_ordered_products
    WHERE
        order_id = a_onr AND
        kund_id = a_knr;
END
$$

-- Procedure for creating an order specified by customer id
CREATE PROCEDURE create_order(
    a_knr INT
)
BEGIN
    INSERT INTO ordrar
        (kundnummer)
    VALUES
        (a_knr)
    ;
END
$$

-- Procedure for deleting an order specified by customer id
CREATE PROCEDURE delete_order(
    a_onr INT
)
BEGIN
    DELETE FROM produktrad
    WHERE
        order_id = a_onr
    ;

    DELETE FROM ordrar
    WHERE
        ordernummer = a_onr
    ;
END
$$

-- Procedure for web-GUI, showing a specific customers orders
CREATE PROCEDURE show_customer_orders(
    a_knr INT
)
BEGIN
    SELECT
        kundnummer,
        namn,
        ordernummer,
        skapad
    FROM v_kundorder
    WHERE
        kundnummer = a_knr
    ;
END
$$

-- Procedure for web-GUI, adding or inserting a product into table 'produktrad'
CREATE PROCEDURE add_to_order(
    a_ordnr INT,
    a_prdnr INT,
    a_knr INT,
    a_i_count INT
)
BEGIN
    INSERT INTO produktrad
        (order_id, produkt_id, kund_id, produktantal)
    VALUES
        (a_ordnr, a_prdnr, a_knr, a_i_count)
    ON DUPLICATE KEY UPDATE
        produktantal = produktantal + a_i_count
    ;

    SET @co = (
                SELECT
                    COUNT(produkt_id) AS `produkt_r`
                FROM produktrad
                WHERE order_id = a_ordnr
            );

    UPDATE ordrar
    SET
        uppdaterad = CURRENT_TIMESTAMP,
        produktrader = @co
    WHERE ordernummer = a_ordnr
    ;
END
$$

-- Procedure for showing products that have been added to an order by order_id
CREATE PROCEDURE show_productRow(
    a_onr INT
)
BEGIN
    SELECT
        produkt_id,
        produktantal
    FROM produktrad
    WHERE order_id = a_onr;
END
$$

-- Procedure for delete a product from an order specified by product number
CREATE PROCEDURE delete_from_order(
    a_pnr INT
)
BEGIN
    DELETE FROM produktrad
    WHERE
        produkt_id = a_pnr
    ;
END
$$

-- Procedure for submitting an order and marking it as 'beställd'
CREATE PROCEDURE submit_order(
    a_onr INT
)
BEGIN
    UPDATE ordrar
    SET
        bestalld = CURRENT_TIMESTAMP
    WHERE
        ordernummer = a_onr
    ;
END
$$

-- Procedure for web-GUI, fetching data from table "produktregister" and "lager"
CREATE PROCEDURE show_products(
)
BEGIN
    SELECT
        produktnummer,
        namn,
        pris,
        kategori_typ,
        id,
        produktantal
    FROM v_show_products;
END
$$

-- Procedure for web-GUI, takes parameters and adds this to table 'produktregister'
CREATE PROCEDURE create_product(
    a_id INT,
    a_name VARCHAR(20),
    a_price INT,
    a_cat_id INT
)
BEGIN
    INSERT INTO produktregister
        (produktnummer, namn, pris, kategori)
    VALUES
        (a_id, a_name, a_price, a_cat_id)
    ;
END
$$

-- Procedure for web-GUI, takes an ID and returns a row matchin with the ID
CREATE PROCEDURE view_product(
    a_id INT
)
BEGIN
    SELECT
        p.produktnummer,
        p.namn,
        p.pris,
        k.kategori_typ,
        k.id
    FROM produktregister AS p
        LEFT JOIN kategori AS k
            ON p.kategori = k.id
    WHERE
        p.produktnummer = a_id;
END
$$

-- Procedure for web-GUI, takes a parameter and updates a row where ID matches
CREATE PROCEDURE edit_product(
    a_id INT,
    a_name VARCHAR(20),
    a_price INT,
    a_category INT
)
BEGIN
    UPDATE produktregister
    SET
        namn = a_name,
        pris = a_price,
        kategori = a_category
    WHERE
        produktnummer = a_id
    ;
END
$$

-- Procedure for web-GUI, deletes a row where the parameter (ID) matches
CREATE PROCEDURE delete_product(
    a_id INT
)
BEGIN
    DELETE FROM lager
    WHERE
        produkt_id = a_id
    ;
    DELETE FROM produktregister
    WHERE
        produktnummer = a_id
    ;
END
$$

-- ===============================================
-- ================CLI Procedures=================
-- ===============================================

-- Procedure for 'shelf'-command in CLI
CREATE PROCEDURE show_shelf(
)
BEGIN
    SELECT hyllplats FROM lager;
END
$$

-- Procedure for log-command for CLI, shows the recent logs specified by a num_of_logs
CREATE PROCEDURE show_logg(
    num_of_logs INT
)
BEGIN
    SELECT
        id,
        meddelande,
        DATE_FORMAT(`tid`, '%Y-%M-%D " " %H:%i:%s') AS `Tid`
    FROM logg
    ORDER BY id DESC
    LIMIT num_of_logs
    ;
END
$$

-- Procedure for "inventory"-command in CLI
CREATE PROCEDURE show_inventory(
)
BEGIN
    SELECT
        p.produktnummer,
        p.namn,
        l.hyllplats,
        l.produktantal
    FROM produktregister AS p
        JOIN lager AS l
            ON p.produktnummer = l.produkt_id
    ;
END
$$

-- Procedure for CLI, fetches data from table "produktregister" and "lager" filtering on a string
CREATE PROCEDURE filter_inventory(
    a_input VARCHAR(20)
)
BEGIN
    SELECT
        p.produktnummer,
        p.namn,
        l.hyllplats,
        l.produktantal
    FROM produktregister AS p
        JOIN lager AS l
            ON p.produktnummer = l.produkt_id
    WHERE
        p.produktnummer LIKE CONCAT('%',a_input,'%')
        OR p.namn LIKE CONCAT('%',a_input,'%')
        OR l.hyllplats LIKE CONCAT('%',a_input,'%')
    ;
END
$$

-- Procedure for CLI, adds new amount of products to specified shelf and product id
CREATE PROCEDURE inv_add(
    a_prod_id INT,
    a_hyllplats VARCHAR(3),
    a_antal INT
)
BEGIN
    UPDATE lager
        SET produktantal = produktantal + a_antal
    WHERE produkt_id = a_prod_id
        AND hyllplats = a_hyllplats
    ;
END
$$

-- Procedure for CLI, deletes an amount of products from specified shelf and product id
CREATE PROCEDURE inv_del(
    a_prod_id INT,
    a_hyllplats VARCHAR(3),
    a_antal INT
)
BEGIN
    UPDATE lager
        SET produktantal = produktantal - a_antal
    WHERE produkt_id = a_prod_id
        AND hyllplats = a_hyllplats
    ;
END
$$

-- Procedure for CLI, searches in table 'orders' by a string inputed
CREATE PROCEDURE search_orders(
    a_inp VARCHAR(10)
)
BEGIN
    SELECT
        ordernummer,
        o_status,
        kundnummer,
        skapad,
        uppdaterad,
        produktrader
    FROM v_all_orders
    WHERE
        ordernummer LIKE a_inp OR
        kundnummer LIKE a_inp
    ;
END
$$

-- call add_to_order(1, 2020, 991282, 3);
-- call add_to_order(1, 2424, 991282, 2);
-- call add_to_picklist(1);
-- Procedure for CLI which generates a picklist
CREATE PROCEDURE add_to_picklist(
    a_onr INT
)
BEGIN
    INSERT INTO plocklista
        (ordernummer, produktantal, produktnummer, lagerplats)
    SELECT
        order_id,
        produktantal,
        produkt_id,
        hyllplats
    FROM v_picklist
    WHERE order_id = a_onr;

    DELETE FROM produktrad
    WHERE order_id = a_onr;
END
$$

CREATE PROCEDURE ship_order(
    a_onr INT
)
BEGIN
    UPDATE ordrar
        SET skickad = CURRENT_TIMESTAMP
    WHERE ordernummer = a_onr
    ;

    -- Here there are supposed to be support for deleting the amount of
    -- ordered items from the table 'lager', but I couldn't manage it :(

    DELETE FROM plocklista
    WHERE ordernummer = a_onr;
END
$$

DELIMITER ;

-- =======================================
-- |               Views                 |
-- =======================================

CREATE OR REPLACE VIEW v_kundorder
AS
SELECT
    ku.kundnummer,
    ku.namn,
    o.ordernummer,
    DATE_FORMAT(o.skapad, '%Y-%M-%D %H:%i:%s') AS `skapad`,
    DATE_FORMAT(o.uppdaterad, '%Y-%M-%D %H:%i:%s') AS `uppdaterad`,
    DATE_FORMAT(o.bestalld, '%Y-%M-%D %H:%i:%s') AS `bestalld`,
    DATE_FORMAT(o.skickad, '%Y-%M-%D %H:%i:%s') AS `skickad`
FROM kundregister AS ku
    LEFT JOIN ordrar AS o
        ON ku.kundnummer = o.kundnummer
;

CREATE OR REPLACE VIEW v_show_products
AS
SELECT
    p.produktnummer,
    p.namn,
    p.pris,
    k.kategori_typ,
    k.id,
    l.produktantal
FROM produktregister AS p
LEFT JOIN lager AS l
    ON p.produktnummer = l.produkt_id
LEFT JOIN kategori AS k
    ON p.kategori = k.id
;

CREATE OR REPLACE VIEW v_show_ordered_products
AS
SELECT
    pr.order_id,
    pr.produkt_id,
    pr.kund_id,
    pr.produktantal,
    kr.namn
FROM produktrad AS pr
    LEFT JOIN kundregister AS kr
        ON pr.kund_id = kr.kundnummer
;

CREATE OR REPLACE VIEW v_picklist
AS
SELECT
    pr.order_id,
    pr.produkt_id,
    l.hyllplats,
    pr.produktantal
FROM produktrad AS pr
    JOIN lager AS l
        ON pr.produkt_id = l.produkt_id
;

CREATE OR REPLACE VIEW v_all_orders
AS
SELECT
    o.ordernummer,
    order_status(o.ordernummer) AS `o_status`,
    o.kundnummer,
    DATE_FORMAT(o.skapad, '%Y-%M-%D %H:%i:%s') AS `skapad`,
    DATE_FORMAT(o.uppdaterad, '%Y-%M-%D %H:%i:%s') AS `uppdaterad`,
    o.produktrader,
    ku.namn
FROM ordrar AS o
    LEFT JOIN kundregister AS ku
        ON ku.kundnummer = o.kundnummer
;