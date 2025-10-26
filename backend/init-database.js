const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

console.log('Initialisation de la base de données...');

const db = new sqlite3.Database('./erp.db', (err) => {
    if (err) {
        console.error('Erreur DB:', err.message);
        process.exit(1);
    }
    console.log('Connecté à la base SQLite.');
});

// Lire et exécuter le schéma
const schema = fs.readFileSync('../database/schema.sql', 'utf8');
console.log('Exécution du schéma...');

db.exec(schema, (err) => {
    if (err) {
        console.error('Erreur schéma:', err);
    } else {
        console.log('Schéma exécuté avec succès!');
        
        // Lire et exécuter les données initiales
        const seedData = fs.readFileSync('../database/seed-data.sql', 'utf8');
        db.exec(seedData, (err) => {
            if (err) {
                console.error('Erreur données initiales:', err);
            } else {
                console.log('Données initiales insérées avec succès!');
                console.log('✅ Base de données initialisée!');
            }
            db.close();
        });
    }
});