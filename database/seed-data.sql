-- Données d'initialisation pour le Mini-ERP

-- Insertion des catégories
INSERT INTO categories (nom, description) VALUES
('Informatique', 'Ordinateurs, périphériques et accessoires informatiques'),
('Bureautique', 'Fournitures de bureau et matériel de papeterie'),
('Mobilier', 'Meubles de bureau et équipements'),
('Électronique', 'Appareils électroniques et gadgets'),
('Livres', 'Livres et documentation');

-- Insertion des fournisseurs
INSERT INTO fournisseurs (nom, email, telephone, adresse, contact_nom, conditions_paiement) VALUES
('TechDistrib', 'contact@techdistrib.fr', '+33 1 45 67 89 10', '123 Avenue de la Tech, 75013 Paris', 'Marc Dubois', '30 jours'),
('OfficePro', 'ventes@officepro.com', '+33 1 56 78 90 12', '45 Rue du Commerce, 75008 Paris', 'Sophie Martin', '45 jours'),
('MobilierPlus', 'info@mobilierplus.fr', '+33 1 34 56 78 90', '78 Boulevard des Fabricants, 69002 Lyon', 'Pierre Lambert', '30 jours fin de mois');

-- Insertion des clients
INSERT INTO clients (nom, email, telephone, adresse, code_postal, ville, type_client, siret) VALUES
('TechnoLogic Solutions', 'achat@technologic.fr', '+33 1 56 78 90 12', '45 Rue de la Tech, 75013 Paris', '75013', 'Paris', 'entreprise', '12345678901234'),
('BioNature SARL', 'contact@bionature.com', '+33 4 78 45 12 36', '12 Rue des Herbes, 69001 Lyon', '69001', 'Lyon', 'entreprise', '56789012345678'),
('InnovStart', 'info@innovstart.fr', '+33 5 61 23 45 67', '8 Allée de l''Innovation, 31000 Toulouse', '31000', 'Toulouse', 'entreprise', '90123456789012'),
('Sophie Bernard', 's.bernard@email.com', '+33 6 12 34 56 78', '25 Rue du Commerce, 44000 Nantes', '44000', 'Nantes', 'professionnel', NULL),
('Pierre Lefebvre', 'p.lefebvre@artisanat.fr', '+33 6 98 76 54 32', '7 Place du Marché, 67000 Strasbourg', '67000', 'Strasbourg', 'professionnel', NULL);

-- Insertion des produits
INSERT INTO produits (nom, description, reference, prix_vente, stock, categorie_id, fournisseur) VALUES
('Ordinateur Portable Pro', 'Ordinateur portable 15 pouces, 16GB RAM, 512GB SSD', 'LAPTOP-PRO-001', 1299.99, 15, 1, 'TechDistrib'),
('Souris Ergonomique', 'Souris sans fil ergonomique pour usage intensif', 'MOUSE-ERG-002', 45.50, 50, 1, 'TechDistrib'),
('Clavier Mécanique', 'Clavier mécanique rétroéclairé USB', 'KEYB-MEC-003', 89.99, 30, 1, 'TechDistrib'),
('Pack Papier A4', 'Ramette de 500 feuilles papier A4 80g', 'PAP-A4-500', 12.99, 200, 2, 'OfficePro'),
('Stylos Bille Pack 10', 'Pack de 10 stylos bille bleue', 'PEN-BLUE-10', 8.50, 150, 2, 'OfficePro'),
('Chaise de Bureau', 'Chaise de bureau ergonomique réglable', 'CHAIR-ERG-001', 299.99, 25, 3, 'MobilierPlus'),
('Bureau Manager', 'Bureau en bois 160x80cm avec tiroirs', 'DESK-MGR-160', 459.99, 10, 3, 'MobilierPlus'),
('Écran 24 pouces', 'Écran LCD 24 pouces Full HD', 'MONITOR-24-FHD', 189.99, 20, 1, 'TechDistrib');

-- Insertion d''un utilisateur admin
INSERT INTO utilisateurs (nom, email, password_hash, role) VALUES
('Administrateur', 'admin@erp.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'administrateur'); -- password: password

-- Insertion des paramètres système
INSERT INTO parametres (cle, valeur, description) VALUES
('nom_entreprise', 'Mini-ERP Solutions', 'Nom de l''entreprise'),
('tva_par_defaut', '20.0', 'Taux de TVA par défaut'),
('devise', 'EUR', 'Devise utilisée'),
('pays_par_defaut', 'France', 'Pays par défaut');

-- Insertion de commandes exemple
INSERT INTO commandes (numero_commande, client_id, statut, frais_livraison, remise) VALUES
('CMD-2024-001', 1, 'livree', 15.00, 0),
('CMD-2024-002', 2, 'confirmee', 12.50, 50.00),
('CMD-2024-003', 3, 'en_attente', 10.00, 0);

-- Insertion des lignes de commande
INSERT INTO lignes_commande (commande_id, produit_id, quantite, prix_unitaire) VALUES
(1, 1, 2, 1299.99),
(1, 2, 5, 45.50),
(2, 4, 10, 12.99),
(2, 5, 20, 8.50),
(3, 6, 1, 299.99),
(3, 7, 1, 459.99);