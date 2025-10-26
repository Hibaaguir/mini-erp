-- Mini-ERP - Schéma de base de données complet
-- Version: 1.0
-- Créé le: 2024-01-01

-- Table des clients
CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    email TEXT,
    telephone TEXT,
    adresse TEXT,
    code_postal TEXT,
    ville TEXT DEFAULT 'Paris',
    pays TEXT DEFAULT 'France',
    type_client TEXT DEFAULT 'particulier',
    siret TEXT,
    note_credit DECIMAL(10,2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des catégories de produits
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des produits
CREATE TABLE IF NOT EXISTS produits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    description TEXT,
    reference TEXT UNIQUE,
    prix_achat DECIMAL(10,2),
    prix_vente DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    stock_minimum INTEGER DEFAULT 5,
    categorie_id INTEGER,
    fournisseur TEXT,
    tva DECIMAL(4,2) DEFAULT 20.0,
    unite TEXT DEFAULT 'pièce',
    image_url TEXT,
    actif BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categorie_id) REFERENCES categories(id)
);

-- Table des commandes
CREATE TABLE IF NOT EXISTS commandes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_commande TEXT UNIQUE,
    client_id INTEGER NOT NULL,
    date_commande DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_livraison_prevue DATE,
    date_livraison_reelle DATE,
    statut TEXT DEFAULT 'en_attente',
    mode_livraison TEXT DEFAULT 'standard',
    frais_livraison DECIMAL(10,2) DEFAULT 0,
    remise DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Table des lignes de commande
CREATE TABLE IF NOT EXISTS lignes_commande (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    commande_id INTEGER NOT NULL,
    produit_id INTEGER NOT NULL,
    quantite INTEGER NOT NULL CHECK(quantite > 0),
    prix_unitaire DECIMAL(10,2) NOT NULL,
    remise_ligne DECIMAL(10,2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
    FOREIGN KEY (produit_id) REFERENCES produits(id)
);

-- Table des fournisseurs
CREATE TABLE IF NOT EXISTS fournisseurs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    email TEXT,
    telephone TEXT,
    adresse TEXT,
    code_postal TEXT,
    ville TEXT,
    pays TEXT DEFAULT 'France',
    contact_nom TEXT,
    contact_telephone TEXT,
    conditions_paiement TEXT DEFAULT '30 jours',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des approvisionnements
CREATE TABLE IF NOT EXISTS approvisionnements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fournisseur_id INTEGER,
    reference TEXT UNIQUE,
    date_commande DATE DEFAULT CURRENT_DATE,
    date_reception_prevue DATE,
    date_reception_reelle DATE,
    statut TEXT DEFAULT 'en_attente',
    montant_total DECIMAL(10,2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fournisseur_id) REFERENCES fournisseurs(id)
);

-- Table des lignes d'approvisionnement
CREATE TABLE IF NOT EXISTS lignes_approvisionnement (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    approvisionnement_id INTEGER NOT NULL,
    produit_id INTEGER NOT NULL,
    quantite_commandee INTEGER NOT NULL,
    quantite_recue INTEGER DEFAULT 0,
    prix_achat DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (approvisionnement_id) REFERENCES approvisionnements(id) ON DELETE CASCADE,
    FOREIGN KEY (produit_id) REFERENCES produits(id)
);

-- Table des paiements
CREATE TABLE IF NOT EXISTS paiements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    commande_id INTEGER NOT NULL,
    montant DECIMAL(10,2) NOT NULL,
    mode_paiement TEXT DEFAULT 'carte',
    statut TEXT DEFAULT 'en_attente',
    date_paiement DATE,
    reference TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (commande_id) REFERENCES commandes(id)
);

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS utilisateurs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'utilisateur',
    actif BOOLEAN DEFAULT 1,
    derniere_connexion DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des paramètres système
CREATE TABLE IF NOT EXISTS parametres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cle TEXT UNIQUE NOT NULL,
    valeur TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_clients_nom ON clients(nom);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_produits_nom ON produits(nom);
CREATE INDEX IF NOT EXISTS idx_produits_categorie ON produits(categorie_id);
CREATE INDEX IF NOT EXISTS idx_commandes_client ON commandes(client_id);
CREATE INDEX IF NOT EXISTS idx_commandes_statut ON commandes(statut);
CREATE INDEX IF NOT EXISTS idx_commandes_date ON commandes(date_commande);
CREATE INDEX IF NOT EXISTS idx_lignes_commande_commande ON lignes_commande(commande_id);
CREATE INDEX IF NOT EXISTS idx_lignes_commande_produit ON lignes_commande(produit_id);

-- Déclencheurs pour les timestamps
CREATE TRIGGER IF NOT EXISTS update_clients_timestamp 
AFTER UPDATE ON clients
BEGIN
    UPDATE clients SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_produits_timestamp 
AFTER UPDATE ON produits
BEGIN
    UPDATE produits SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_commandes_timestamp 
AFTER UPDATE ON commandes
BEGIN
    UPDATE commandes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;