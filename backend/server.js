const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// ✅ Route de test AJOUTÉE
app.get('/api/test', (req, res) => {
    console.log('✅ Route /api/test appelée');
    res.json({ 
        message: '✅ API Mini-ERP fonctionne!', 
        timestamp: new Date().toISOString(),
        version: '1.0'
    });
});

// Base de données SQLite
const db = new sqlite3.Database('./erp.db', (err) => {
    if (err) {
        console.error('❌ Erreur DB:', err.message);
    } else {
        console.log('✅ Connecté à la base SQLite.');
        initDB();
    }
});

// Initialisation de la base
function initDB() {
    const tables = [
        `CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            email TEXT,
            telephone TEXT,
            adresse TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS produits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            description TEXT,
            prix REAL NOT NULL,
            stock INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS commandes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id INTEGER,
            produit_id INTEGER,
            quantite INTEGER,
            statut TEXT DEFAULT 'en_attente',
            date_commande DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(client_id) REFERENCES clients(id),
            FOREIGN KEY(produit_id) REFERENCES produits(id)
        )`
    ];

    let completed = 0;
    tables.forEach((sql) => {
        db.run(sql, (err) => {
            if (err) {
                console.error('❌ Erreur table:', err);
            } else {
                completed++;
                console.log(`✅ Table ${completed} créée/verifiée`);
            }
        });
    });
}

// ✅ Route pour données de démo AJOUTÉE
app.get('/api/init-demo', (req, res) => {
    console.log('🎮 Initialisation données démo...');
    
    const clients = [
        ['Tech Solutions SARL', 'contact@techsolutions.fr', '+33 1 45 67 89 10', '123 Avenue Tech, Paris'],
        ['BioNature France', 'info@bionature.fr', '+33 4 78 45 12 36', '456 Rue Verte, Lyon'],
        ['InnovStart', 'hello@innovstart.com', '+33 5 61 23 45 67', '789 Boulevard Innovation, Toulouse'],
        ['Global Services', 'contact@globalservices.fr', '+33 2 34 56 78 90', '321 Rue Commerce, Lille']
    ];
    
    const produits = [
        ['Ordinateur Portable Pro', 'PC portable 15" 16GB RAM, 512GB SSD', 1299.99, 10],
        ['Souris Ergonomique', 'Souris sans fil ergonomique pour usage intensif', 45.50, 25],
        ['Clavier Mécanique', 'Clavier mécanique rétroéclairé RGB', 89.99, 15],
        ['Écran 24 pouces', 'Écran LCD 24 pouces Full HD, 75Hz', 189.99, 8],
        ['Casque Audio Pro', 'Casque audio professionnel avec réduction de bruit', 149.99, 12]
    ];
    
    let completed = 0;
    const totalOperations = clients.length + produits.length;
    
    // Vérifier si des données existent déjà
    db.get('SELECT COUNT(*) as count FROM clients', (err, row) => {
        if (row.count > 0) {
            console.log('📊 Données déjà présentes');
            res.json({ message: 'Données déjà présentes dans la base' });
            return;
        }
        
        // Insérer clients
        clients.forEach(client => {
            db.run(
                'INSERT INTO clients (nom, email, telephone, adresse) VALUES (?, ?, ?, ?)',
                client,
                (err) => {
                    if (err) console.error('❌ Erreur client:', err);
                    completed++;
                    checkCompletion();
                }
            );
        });
        
        // Insérer produits
        produits.forEach(produit => {
            db.run(
                'INSERT INTO produits (nom, description, prix, stock) VALUES (?, ?, ?, ?)',
                produit,
                (err) => {
                    if (err) console.error('❌ Erreur produit:', err);
                    completed++;
                    checkCompletion();
                }
            );
        });
        
        function checkCompletion() {
            if (completed === totalOperations) {
                console.log('✅ Données démo insérées avec succès!');
                res.json({ 
                    success: true,
                    message: `Données de démo insérées: ${clients.length} clients, ${produits.length} produits` 
                });
            }
        }
    });
});

// Routes Clients
app.get('/api/clients', (req, res) => {
    console.log('📋 Récupération des clients');
    db.all('SELECT * FROM clients ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            console.error('❌ Erreur clients:', err);
            res.status(400).json({ error: err.message });
            return;
        }
        console.log(`📊 ${rows.length} clients trouvés`);
        res.json({ data: rows });
    });
});

app.post('/api/clients', (req, res) => {
    console.log('➕ Ajout client:', req.body);
    const { nom, email, telephone, adresse } = req.body;
    
    if (!nom) {
        return res.status(400).json({ error: 'Le nom est obligatoire' });
    }
    
    db.run(
        'INSERT INTO clients (nom, email, telephone, adresse) VALUES (?, ?, ?, ?)',
        [nom, email, telephone, adresse],
        function(err) {
            if (err) {
                console.error('❌ Erreur ajout client:', err);
                res.status(400).json({ error: err.message });
                return;
            }
            console.log(`✅ Client créé avec ID: ${this.lastID}`);
            res.json({ id: this.lastID, message: 'Client créé avec succès' });
        }
    );
});

// Routes Produits
app.get('/api/produits', (req, res) => {
    console.log('📦 Récupération des produits');
    db.all('SELECT * FROM produits ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            console.error('❌ Erreur produits:', err);
            res.status(400).json({ error: err.message });
            return;
        }
        console.log(`📊 ${rows.length} produits trouvés`);
        res.json({ data: rows });
    });
});

app.post('/api/produits', (req, res) => {
    console.log('➕ Ajout produit:', req.body);
    const { nom, description, prix, stock } = req.body;
    
    if (!nom || !prix) {
        return res.status(400).json({ error: 'Le nom et le prix sont obligatoires' });
    }
    
    db.run(
        'INSERT INTO produits (nom, description, prix, stock) VALUES (?, ?, ?, ?)',
        [nom, description, parseFloat(prix), parseInt(stock) || 0],
        function(err) {
            if (err) {
                console.error('❌ Erreur ajout produit:', err);
                res.status(400).json({ error: err.message });
                return;
            }
            console.log(`✅ Produit créé avec ID: ${this.lastID}`);
            res.json({ id: this.lastID, message: 'Produit créé avec succès' });
        }
    );
});

// ✅ ROUTE EXISTANTE : Mettre à jour le stock d'un produit (remplacer)
app.put('/api/produits/:id/stock', (req, res) => {
    const produitId = req.params.id;
    const { stock } = req.body;
    
    console.log(`📦 Mise à jour stock produit ${produitId} -> ${stock}`);
    
    if (stock === undefined || stock === null) {
        return res.status(400).json({ error: 'Le stock est obligatoire' });
    }
    
    const nouveauStock = parseInt(stock);
    if (isNaN(nouveauStock) || nouveauStock < 0) {
        return res.status(400).json({ error: 'Le stock doit être un nombre positif' });
    }
    
    // Vérifier si le produit existe
    db.get('SELECT * FROM produits WHERE id = ?', [produitId], (err, produit) => {
        if (err) {
            console.error('❌ Erreur vérification produit:', err);
            return res.status(400).json({ error: err.message });
        }
        
        if (!produit) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }
        
        // Mettre à jour le stock
        db.run(
            'UPDATE produits SET stock = ? WHERE id = ?',
            [nouveauStock, produitId],
            function(err) {
                if (err) {
                    console.error('❌ Erreur mise à jour stock:', err);
                    return res.status(400).json({ error: err.message });
                }
                
                console.log(`✅ Stock produit ${produitId} mis à jour vers: ${nouveauStock}`);
                res.json({ 
                    success: true, 
                    message: `Stock mis à jour vers: ${nouveauStock}`,
                    produit_id: produitId,
                    nouveau_stock: nouveauStock
                });
            }
        );
    });
});

// ✅ NOUVELLE ROUTE : AJOUTER du stock à un produit existant
app.put('/api/produits/:id/ajouter-stock', (req, res) => {
    const produitId = req.params.id;
    const { quantite } = req.body;
    
    console.log(`📥 Ajout de stock demandé - Produit: ${produitId}, Quantité: ${quantite}`);
    
    if (!quantite || quantite <= 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'La quantité doit être un nombre positif' 
        });
    }
    
    // Vérifier si le produit existe
    db.get('SELECT * FROM produits WHERE id = ?', [produitId], (err, produit) => {
        if (err) {
            console.error('❌ Erreur vérification produit:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erreur base de données' 
            });
        }
        
        if (!produit) {
            return res.status(404).json({ 
                success: false, 
                message: 'Produit non trouvé' 
            });
        }
        
        // Calculer le nouveau stock (addition)
        const nouveauStock = produit.stock + parseInt(quantite);
        
        // Mettre à jour le stock
        db.run(
            'UPDATE produits SET stock = ? WHERE id = ?',
            [nouveauStock, produitId],
            function(err) {
                if (err) {
                    console.error('❌ Erreur mise à jour stock:', err);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Erreur lors de la mise à jour du stock' 
                    });
                }
                
                console.log(`✅ Stock ajouté - Produit: ${produitId}, Ancien stock: ${produit.stock}, Nouveau stock: ${nouveauStock}, Quantité ajoutée: ${quantite}`);
                
                res.json({
                    success: true,
                    message: `Stock augmenté de ${quantite} unités`,
                    produit: {
                        id: produitId,
                        nom: produit.nom,
                        ancien_stock: produit.stock,
                        nouveau_stock: nouveauStock,
                        quantite_ajoutee: parseInt(quantite)
                    }
                });
            }
        );
    });
});

// ✅ ROUTE EXISTANTE : Mettre à jour un produit complet
app.put('/api/produits/:id', (req, res) => {
    const produitId = req.params.id;
    const { nom, description, prix, stock } = req.body;
    
    console.log(`✏️ Mise à jour produit ${produitId}:`, req.body);
    
    // Vérifier si le produit existe
    db.get('SELECT * FROM produits WHERE id = ?', [produitId], (err, produit) => {
        if (err) {
            console.error('❌ Erreur vérification produit:', err);
            return res.status(400).json({ error: err.message });
        }
        
        if (!produit) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }
        
        // Préparer les valeurs à mettre à jour
        const nouveauNom = nom || produit.nom;
        const nouvelleDescription = description !== undefined ? description : produit.description;
        const nouveauPrix = prix !== undefined ? parseFloat(prix) : produit.prix;
        const nouveauStock = stock !== undefined ? parseInt(stock) : produit.stock;
        
        if (nouveauPrix < 0) {
            return res.status(400).json({ error: 'Le prix doit être positif' });
        }
        
        if (nouveauStock < 0) {
            return res.status(400).json({ error: 'Le stock doit être positif' });
        }
        
        // Mettre à jour le produit
        db.run(
            'UPDATE produits SET nom = ?, description = ?, prix = ?, stock = ? WHERE id = ?',
            [nouveauNom, nouvelleDescription, nouveauPrix, nouveauStock, produitId],
            function(err) {
                if (err) {
                    console.error('❌ Erreur mise à jour produit:', err);
                    return res.status(400).json({ error: err.message });
                }
                
                console.log(`✅ Produit ${produitId} mis à jour avec succès`);
                res.json({ 
                    success: true, 
                    message: 'Produit mis à jour avec succès',
                    produit_id: produitId,
                    produit: {
                        id: produitId,
                        nom: nouveauNom,
                        description: nouvelleDescription,
                        prix: nouveauPrix,
                        stock: nouveauStock
                    }
                });
            }
        );
    });
});

// Routes Commandes
app.get('/api/commandes', (req, res) => {
    console.log('🛒 Récupération des commandes');
    const sql = `
        SELECT 
            c.id, 
            cl.nom as client_nom, 
            p.nom as produit_nom,
            c.quantite,
            c.statut,
            c.date_commande,
            (c.quantite * p.prix) as total
        FROM commandes c
        JOIN clients cl ON c.client_id = cl.id
        JOIN produits p ON c.produit_id = p.id
        ORDER BY c.date_commande DESC
    `;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('❌ Erreur commandes:', err);
            res.status(400).json({ error: err.message });
            return;
        }
        console.log(`📊 ${rows.length} commandes trouvées`);
        res.json({ data: rows });
    });
});

app.post('/api/commandes', (req, res) => {
    console.log('➕ Ajout commande:', req.body);
    const { client_id, produit_id, quantite, statut } = req.body;
    
    if (!client_id || !produit_id || !quantite) {
        return res.status(400).json({ error: 'Client, produit et quantité sont obligatoires' });
    }
    
    // Vérifier le stock
    db.get('SELECT nom, stock FROM produits WHERE id = ?', [produit_id], (err, produit) => {
        if (err) {
            console.error('❌ Erreur vérification stock:', err);
            res.status(400).json({ error: err.message });
            return;
        }
        
        if (!produit) {
            return res.status(400).json({ error: 'Produit non trouvé' });
        }
        
        if (produit.stock < quantite) {
            return res.status(400).json({ 
                error: `Stock insuffisant pour "${produit.nom}". Stock disponible: ${produit.stock}` 
            });
        }
        
        // Créer la commande
        db.run(
            'INSERT INTO commandes (client_id, produit_id, quantite, statut) VALUES (?, ?, ?, ?)',
            [parseInt(client_id), parseInt(produit_id), parseInt(quantite), statut || 'en_attente'],
            function(err) {
                if (err) {
                    console.error('❌ Erreur ajout commande:', err);
                    res.status(400).json({ error: err.message });
                    return;
                }
                
                // Mettre à jour le stock
                db.run(
                    'UPDATE produits SET stock = stock - ? WHERE id = ?',
                    [quantite, produit_id],
                    (err) => {
                        if (err) {
                            console.error('❌ Erreur mise à jour stock:', err);
                        } else {
                            console.log(`✅ Stock mis à jour pour produit ${produit_id}`);
                        }
                    }
                );
                
                console.log(`✅ Commande créée avec ID: ${this.lastID}`);
                res.json({ id: this.lastID, message: 'Commande créée avec succès' });
            }
        );
    });
});

// ✅ ROUTE EXISTANTE : Modifier le statut d'une commande
app.put('/api/commandes/:id/statut', (req, res) => {
    const commandeId = req.params.id;
    const { statut } = req.body;
    
    console.log(`🔄 Mise à jour statut commande ${commandeId} -> ${statut}`);
    
    if (!statut) {
        return res.status(400).json({ error: 'Le statut est obligatoire' });
    }
    
    const statutsValides = ['en_attente', 'confirmee', 'livree', 'annulee'];
    if (!statutsValides.includes(statut)) {
        return res.status(400).json({ error: 'Statut invalide' });
    }
    
    // Vérifier si la commande existe
    db.get('SELECT * FROM commandes WHERE id = ?', [commandeId], (err, commande) => {
        if (err) {
            console.error('❌ Erreur vérification commande:', err);
            return res.status(400).json({ error: err.message });
        }
        
        if (!commande) {
            return res.status(404).json({ error: 'Commande non trouvée' });
        }
        
        // Mettre à jour le statut
        db.run(
            'UPDATE commandes SET statut = ? WHERE id = ?',
            [statut, commandeId],
            function(err) {
                if (err) {
                    console.error('❌ Erreur mise à jour statut:', err);
                    return res.status(400).json({ error: err.message });
                }
                
                console.log(`✅ Statut commande ${commandeId} mis à jour vers: ${statut}`);
                res.json({ 
                    success: true, 
                    message: `Statut mis à jour vers: ${statut}`,
                    commande_id: commandeId,
                    nouveau_statut: statut
                });
            }
        );
    });
});

// ✅ ROUTE EXISTANTE : Récupérer une commande spécifique
app.get('/api/commandes/:id', (req, res) => {
    const commandeId = req.params.id;
    
    console.log(`📋 Récupération commande ${commandeId}`);
    
    const sql = `
        SELECT 
            c.id, 
            cl.nom as client_nom, 
            p.nom as produit_nom,
            c.quantite,
            c.statut,
            c.date_commande,
            (c.quantite * p.prix) as total,
            c.client_id,
            c.produit_id
        FROM commandes c
        JOIN clients cl ON c.client_id = cl.id
        JOIN produits p ON c.produit_id = p.id
        WHERE c.id = ?
    `;
    
    db.get(sql, [commandeId], (err, row) => {
        if (err) {
            console.error('❌ Erreur récupération commande:', err);
            return res.status(400).json({ error: err.message });
        }
        
        if (!row) {
            return res.status(404).json({ error: 'Commande non trouvée' });
        }
        
        console.log(`✅ Commande ${commandeId} trouvée`);
        res.json({ data: row });
    });
});

// Dashboard stats - VERSION AMÉLIORÉE
app.get('/api/stats', (req, res) => {
    console.log('📊 Récupération des statistiques');
    const stats = {};
    
    db.get('SELECT COUNT(*) as total FROM clients', (err, row) => {
        if (err) {
            console.error('❌ Erreur stats clients:', err);
            return res.status(500).json({ error: err.message });
        }
        stats.clients = row.total;
        
        db.get('SELECT COUNT(*) as total FROM produits', (err, row) => {
            if (err) {
                console.error('❌ Erreur stats produits:', err);
                return res.status(500).json({ error: err.message });
            }
            stats.produits = row.total;
            
            // Compter les commandes par statut
            db.all(`
                SELECT statut, COUNT(*) as count 
                FROM commandes 
                GROUP BY statut
            `, [], (err, rows) => {
                if (err) {
                    console.error('❌ Erreur stats commandes:', err);
                    return res.status(500).json({ error: err.message });
                }
                
                stats.commandes_par_statut = {};
                let totalCommandes = 0;
                
                rows.forEach(row => {
                    stats.commandes_par_statut[row.statut] = row.count;
                    totalCommandes += row.count;
                });
                
                stats.commandes = totalCommandes;
                
                // Chiffre d'affaires détaillé par statut
                db.get(`
                    SELECT 
                        SUM(CASE WHEN statut = 'livree' THEN c.quantite * p.prix ELSE 0 END) as ca_livre,
                        SUM(CASE WHEN statut = 'confirmee' THEN c.quantite * p.prix ELSE 0 END) as ca_confirme,
                        SUM(CASE WHEN statut = 'en_attente' THEN c.quantite * p.prix ELSE 0 END) as ca_attente,
                        SUM(CASE WHEN statut NOT IN ('annulee') THEN c.quantite * p.prix ELSE 0 END) as ca_total
                    FROM commandes c 
                    JOIN produits p ON c.produit_id = p.id 
                `, (err, row) => {
                    if (err) {
                        console.error('❌ Erreur stats CA:', err);
                        return res.status(500).json({ error: err.message });
                    }
                    
                    stats.chiffre_affaires_livre = row.ca_livre || 0;
                    stats.chiffre_affaires_confirme = row.ca_confirme || 0;
                    stats.chiffre_affaires_attente = row.ca_attente || 0;
                    stats.chiffre_affaires_total = row.ca_total || 0;
                    
                    // Produits en rupture de stock
                    db.get('SELECT COUNT(*) as total FROM produits WHERE stock = 0', (err, row) => {
                        stats.rupture_stock = row.total || 0;
                        
                        console.log('📊 Statistiques calculées:', stats);
                        res.json(stats);
                    });
                });
            });
        });
    });
});
// ✅ FONCTIONS POUR LA GESTION DES STOCKS

// Peupler le select des produits pour la gestion des stocks
function peuplerSelectGestionStock(produits) {
    const select = document.getElementById('produit-stock-select');
    select.innerHTML = '<option value="">Choisir un produit...</option>';
    
    produits.forEach(produit => {
        const option = new Option(
            `${produit.nom} (Stock actuel: ${produit.stock})`, 
            produit.id
        );
        select.add(option);
    });
}

// Afficher le formulaire d'ajout de stock
function showAjoutStock() {
    const produitId = document.getElementById('produit-stock-select').value;
    if (!produitId) {
        showAlert('❌ Veuillez sélectionner un produit', 'error');
        return;
    }
    
    // Récupérer les infos du produit
    const produits = JSON.parse(sessionStorage.getItem('produitsCache') || '[]');
    const produit = produits.find(p => p.id == produitId);
    
    if (produit) {
        document.getElementById('produit-selectionne-info').innerHTML = `
            <strong>${produit.nom}</strong><br>
            <small>Stock actuel: ${produit.stock} | Prix: ${produit.prix}€</small>
        `;
    }
    
    document.getElementById('form-ajout-stock').style.display = 'block';
    document.getElementById('form-modif-stock').style.display = 'none';
    document.getElementById('quantite-ajout').value = '';
    document.getElementById('quantite-ajout').focus();
}

// Afficher le formulaire de modification de stock
function showModifStock() {
    const produitId = document.getElementById('produit-stock-select').value;
    if (!produitId) {
        showAlert('❌ Veuillez sélectionner un produit', 'error');
        return;
    }
    
    // Récupérer les infos du produit
    const produits = JSON.parse(sessionStorage.getItem('produitsCache') || '[]');
    const produit = produits.find(p => p.id == produitId);
    
    if (produit) {
        document.getElementById('produit-selectionne-modif').innerHTML = `
            <strong>${produit.nom}</strong><br>
            <small>Stock actuel: ${produit.stock} | Prix: ${produit.prix}€</small>
        `;
        document.getElementById('nouveau-stock').value = produit.stock;
    }
    
    document.getElementById('form-modif-stock').style.display = 'block';
    document.getElementById('form-ajout-stock').style.display = 'none';
    document.getElementById('nouveau-stock').focus();
}

// Cacher les formulaires de stock
function cacherFormulairesStock() {
    document.getElementById('form-ajout-stock').style.display = 'none';
    document.getElementById('form-modif-stock').style.display = 'none';
    document.getElementById('message-stock').innerHTML = '';
}

// ✅ AJOUTER du stock (incrémental)
async function ajouterStock() {
    const produitId = document.getElementById('produit-stock-select').value;
    const quantite = document.getElementById('quantite-ajout').value;
    const messageDiv = document.getElementById('message-stock');
    
    if (!produitId || !quantite || quantite < 1) {
        messageDiv.innerHTML = '<div class="alert error">❌ Veuillez entrer une quantité valide</div>';
        return;
    }
    
    try {
        showAlert('Ajout de stock en cours...', 'info');
        
        const response = await fetch(`${API_BASE}/produits/${produitId}/ajouter-stock`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantite: parseInt(quantite) })
        });
        
        const result = await response.json();
        
        if (result.success) {
            messageDiv.innerHTML = `<div class="alert success">
                ✅ ${result.message}<br>
                <strong>Nouveau stock: ${result.produit.nouveau_stock}</strong>
            </div>`;
            
            // Réinitialiser
            document.getElementById('quantite-ajout').value = '';
            cacherFormulairesStock();
            
            // Actualiser les données
            loadProduits();
            loadStats();
            loadCommandesForm();
            
            showAlert(`✅ Stock augmenté de ${quantite} unités!`, 'success');
        } else {
            messageDiv.innerHTML = `<div class="alert error">❌ ${result.message}</div>`;
        }
    } catch (error) {
        console.error('Erreur:', error);
        messageDiv.innerHTML = '<div class="alert error">❌ Erreur lors de l\'ajout de stock</div>';
    }
}

// ✅ MODIFIER le stock (remplacer)
async function modifierStock() {
    const produitId = document.getElementById('produit-stock-select').value;
    const nouveauStock = document.getElementById('nouveau-stock').value;
    const messageDiv = document.getElementById('message-stock');
    
    if (!produitId || nouveauStock === '' || nouveauStock < 0) {
        messageDiv.innerHTML = '<div class="alert error">❌ Veuillez entrer un stock valide</div>';
        return;
    }
    
    try {
        showAlert('Modification du stock en cours...', 'info');
        
        const response = await fetch(`${API_BASE}/produits/${produitId}/stock`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock: parseInt(nouveauStock) })
        });
        
        const result = await response.json();
        
        if (result.success) {
            messageDiv.innerHTML = `<div class="alert success">
                ✅ Stock modifié avec succès!<br>
                <strong>Nouveau stock: ${result.nouveau_stock}</strong>
            </div>`;
            
            // Réinitialiser
            cacherFormulairesStock();
            
            // Actualiser les données
            loadProduits();
            loadStats();
            loadCommandesForm();
            
            showAlert('✅ Stock modifié avec succès!', 'success');
        } else {
            messageDiv.innerHTML = `<div class="alert error">❌ ${result.message}</div>`;
        }
    } catch (error) {
        console.error('Erreur:', error);
        messageDiv.innerHTML = '<div class="alert error">❌ Erreur lors de la modification du stock</div>';
    }
}

// ✅ Mettre à jour la fonction loadProduits pour cacher les produits en cache
async function loadProduits() {
    try {
        const response = await fetch(`${API_BASE}/produits`);
        const data = await response.json();
        
        // Stocker en cache pour la gestion des stocks
        sessionStorage.setItem('produitsCache', JSON.stringify(data.data));
        
        if (data.data.length === 0) {
            document.getElementById('produits-list').innerHTML = `
                <div class="empty-state">
                    <p>Aucun produit trouvé</p>
                    <p>Ajoutez votre premier produit en utilisant le formulaire ci-dessus.</p>
                </div>
            `;
            return;
        }
        
        let html = `
            <table>
                <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Description</th>
                    <th>Prix</th>
                    <th>Stock</th>
                    <th>Actions Rapides</th>
                </tr>
        `;
        
        data.data.forEach(produit => {
            const stockClass = produit.stock === 0 ? 'style="color: #e74c3c; font-weight: bold;"' : '';
            const stockStyle = produit.stock === 0 ? 'background: #f8d7da; color: #721c24; padding: 2px 6px; border-radius: 3px;' : '';
            
            html += `
                <tr>
                    <td>${produit.id}</td>
                    <td><strong>${produit.nom}</strong></td>
                    <td>${produit.description || '-'}</td>
                    <td>${produit.prix} €</td>
                    <td ${stockClass}><span style="${stockStyle}">${produit.stock}</span></td>
                    <td>
                        <div class="actions-container">
                            <button class="btn btn-success btn-small" onclick="ajouterStockRapide(${produit.id})">➕ Ajouter</button>
                            <button class="btn btn-warning btn-small" onclick="modifierStockRapide(${produit.id})">✏️ Modifier</button>
                        </div>
                    </td>
                </tr>
            `;
        });
        html += '</table>';
        
        document.getElementById('produits-list').innerHTML = html;
        
        // Peupler le select de gestion des stocks
        peuplerSelectGestionStock(data.data);
        
    } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        document.getElementById('produits-list').innerHTML = `
            <div class="alert error">
                ❌ Impossible de charger les produits: ${error.message}
            </div>
        `;
    }
}

// ✅ ACTIONS RAPIDES depuis le tableau
function ajouterStockRapide(produitId) {
    const quantite = prompt('Quantité à ajouter:');
    if (quantite && !isNaN(quantite) && quantite > 0) {
        fetch(`${API_BASE}/produits/${produitId}/ajouter-stock`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantite: parseInt(quantite) })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                showAlert(`✅ Stock augmenté de ${quantite} unités! Nouveau stock: ${result.produit.nouveau_stock}`, 'success');
                loadProduits();
                loadStats();
            } else {
                showAlert('❌ Erreur: ' + result.message, 'error');
            }
        })
        .catch(error => {
            showAlert('❌ Erreur lors de l\'ajout de stock', 'error');
        });
    }
}

function modifierStockRapide(produitId) {
    const produits = JSON.parse(sessionStorage.getItem('produitsCache') || '[]');
    const produit = produits.find(p => p.id == produitId);
    
    if (produit) {
        const nouveauStock = prompt(`Nouveau stock pour "${produit.nom}" (actuel: ${produit.stock}):`, produit.stock);
        if (nouveauStock !== null && !isNaN(nouveauStock) && nouveauStock >= 0) {
            fetch(`${API_BASE}/produits/${produitId}/stock`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stock: parseInt(nouveauStock) })
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    showAlert(`✅ Stock modifié! Nouveau stock: ${result.nouveau_stock}`, 'success');
                    loadProduits();
                    loadStats();
                } else {
                    showAlert('❌ Erreur: ' + result.message, 'error');
                }
            })
            .catch(error => {
                showAlert('❌ Erreur lors de la modification du stock', 'error');
            });
        }
    }
}
// ✅ Gestion des erreurs 404
app.use('*', (req, res) => {
    console.log(`❌ Route non trouvée: ${req.originalUrl}`);
    res.status(404).json({ 
        error: 'Route non trouvée',
        path: req.originalUrl,
        availableRoutes: [
            'GET  /api/test',
            'GET  /api/init-demo',
            'GET  /api/stats',
            'GET  /api/clients',
            'POST /api/clients',
            'GET  /api/produits',
            'POST /api/produits',
            'PUT  /api/produits/:id/stock',
            'PUT  /api/produits/:id/ajouter-stock',
            'PUT  /api/produits/:id',
            'GET  /api/commandes',
            'POST /api/commandes',
            'PUT  /api/commandes/:id/statut',
            'GET  /api/commandes/:id'
        ]
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
    console.log(`📊 API disponible sur http://localhost:${PORT}/api/`);
    console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
    console.log(`🎮 Données démo: http://localhost:${PORT}/api/init-demo`);
    console.log(`📈 Stats: http://localhost:${PORT}/api/stats`);
    console.log(`📦 Mise à jour stock: PUT http://localhost:${PORT}/api/produits/:id/stock`);
    console.log(`➕ Ajout stock: PUT http://localhost:${PORT}/api/produits/:id/ajouter-stock`);
    console.log(`✏️ Mise à jour produit: PUT http://localhost:${PORT}/api/produits/:id`);
    console.log(`🔄 Modif statut: PUT http://localhost:${PORT}/api/commandes/:id/statut`);
});