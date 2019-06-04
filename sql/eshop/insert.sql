USE eshop;

DELETE FROM lager;
DELETE FROM produktregister;
DELETE FROM kategori;
DELETE FROM kundregister;
DELETE FROM ordrar;

INSERT INTO kategori
    (kategori_typ)
VALUES
    ('kaffe'),
    ('te'),
    ('bakelse'),
    ('dryck'),
    ('kall dryck'),
    ('varm dryck')
;

INSERT INTO produktregister
    (produktnummer, kategori, namn, pris, beskrivning)
VALUES
    ('2525','1','chailatte','20','kaffe, earl grey te, mjölk och socker'),
    ('2424','1','espresso','22','Espresso med bönor från guatemala'),
    ('2323','2','ginsengte','18','te på ginseng'),
    ('2222','3','chokladboll','15','chokladboll med pärlsocker'),
    ('2121','3','muffin','18','muffin med chokladsmak'),
    ('2020','1','bryggkaffe','12','kaffe bryggt på färska bönor')
;

INSERT INTO lager
    (hyllplats, produkt_id, produktantal)
VALUES
    ('5b','2424','12'),
    ('4f','2323','5'),
    ('2e','2222','1'),
    ('1c','2121','2'),
    ('1d','2020','13'),
    ('5a','2525','8')
;

INSERT INTO kundregister
    (Kundnummer, adress, telefonnummer, personnummer, namn)
VALUES
    ('991282','Kvillevägen 34 440 74 HJÄLTEBY','03047776047','3510136025','Sandy Lundberg'),
    ('620564','Klinta 91 570 31 INGATORP','03816451891','7608284068','Marion Fransson'),
    ('290109','Djursbo 35 570 84 MÖRLUNDA','04957095271','7512121299','Elliott Larsson'),
    ('628955','Utveda 42 280 40 SKÅNES FAGERHULT','04357516023','9710114225','Zahraa Lindström'),
    ('169221','Läktargatan 54 260 34 MÖRARP','0424461411','4803042003','Denize Hansson')
;

INSERT INTO ordrar
    (kundnummer)
VALUES
    ('991282'),
    ('620564'),
    ('290109'),
    ('169221'),
    ('169221')
;