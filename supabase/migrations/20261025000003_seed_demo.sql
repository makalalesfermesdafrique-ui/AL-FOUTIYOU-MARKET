insert into categories(slug,name) values ('terrains','Terrains'),('immobilier','Immobilier'),('automobiles','Automobiles'),('motos','Motos'),('autres','Autres')
on conflict do nothing;
insert into listings(title,description,category_id,price,city,status) values
('Terrain 300 m² viabilisé','Titre foncier, accès route goudronnée.',(select id from categories where slug='terrains'),12000000,'Dakar','published'),
('Villa 4 chambres','Quartier calme, garage, terrasse.',(select id from categories where slug='immobilier'),85000000,'Dakar','published'),
('Toyota Corolla 2018','Essence, 80 000 km, bon état.',(select id from categories where slug='automobiles'),6500000,'Thiès','published');
