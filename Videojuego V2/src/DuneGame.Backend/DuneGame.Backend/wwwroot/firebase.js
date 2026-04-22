// ============================================
// FIREBASE SERVICE - Dune: The Measure
// ============================================
// Using Firebase SDK Compat (no ES6 modules required)

// Firebase Configuration
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCu2RVHXg6dfkalPETHHKHApDIN4GR90nA",
    authDomain: "dune-the-measure-552c5.firebaseapp.com",
    databaseURL: "https://dune-the-measure-552c5-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "dune-the-measure-552c5",
    storageBucket: "dune-the-measure-552c5.firebasestorage.app",
    messagingSenderId: "726504253064",
    appId: "1:726504253064:web:63bf13865acf309a67213d",
    measurementId: "G-CC17095JCQ"
};

// Initialize Firebase
firebase.initializeApp(FIREBASE_CONFIG);
const db = firebase.firestore();

// ============================================
// SAVE SERVICE (Option A - Full Game State)
// ============================================

const SaveService = {
    // Generate a user ID (for demo, using anonymous ID stored in localStorage)
    getUserId() {
        let userId = localStorage.getItem('dune_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('dune_user_id', userId);
        }
        return userId;
    },
    
    // Generate a save ID based on timestamp
    generateSaveId() {
        const now = new Date();
        return 'save_' + now.getFullYear() + 
            String(now.getMonth() + 1).padStart(2, '0') + 
            String(now.getDate()).padStart(2, '0') + '_' +
            String(now.getHours()).padStart(2, '0') + 
            String(now.getMinutes()).padStart(2, '0');
    },
    
    // Save game state to Firestore
    save(userId, saveId, playerName, gameState) {
        console.log('[FIREBASE] ========== GUARDANDO ==========');
        console.log('[FIREBASE] User ID:', userId);
        console.log('[FIREBASE] Save ID:', saveId);
        console.log('[FIREBASE] Player:', playerName);
        console.log('[FIREBASE] GameState keys:', Object.keys(gameState));
        
        const saveRef = db.collection('users').doc(userId).collection('saves').doc(saveId);
        
        const saveData = {
            playerName: playerName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            gameState: gameState
        };
        
        return saveRef.set(saveData)
            .then(() => {
                console.log('[FIREBASE] ✅ Partida guardada correctamente');
                console.log('[FIREBASE] Ruta: users/' + userId + '/saves/' + saveId);
                console.log('[FIREBASE] ====================================');
                return { success: true, saveId: saveId };
            })
            .catch((error) => {
                console.error('[FIREBASE] ❌ Error al guardar:', error);
                console.log('[FIREBASE] ====================================');
                return { success: false, error: error.message };
            });
    },
    
    // Load a specific save
    load(userId, saveId) {
        console.log('[FIREBASE] ========== CARGANDO ==========');
        console.log('[FIREBASE] User ID:', userId);
        console.log('[FIREBASE] Save ID:', saveId);
        
        const saveRef = db.collection('users').doc(userId).collection('saves').doc(saveId);
        
        return saveRef.get()
            .then((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    console.log('[FIREBASE] ✅ Partida encontrada');
                    console.log('[FIREBASE] Player:', data.playerName);
                    console.log('[FIREBASE] GameState:', Object.keys(data.gameState || {}));
                    console.log('[FIREBASE] ====================================');
                    return { success: true, data: data };
                } else {
                    console.log('[FIREBASE] ⚠️ Partida no encontrada');
                    console.log('[FIREBASE] ====================================');
                    return { success: false, error: 'Partida no encontrada' };
                }
            })
            .catch((error) => {
                console.error('[FIREBASE] ❌ Error al cargar:', error);
                console.log('[FIREBASE] ====================================');
                return { success: false, error: error.message };
            });
    },
    
    // List all saves for a user
    listSaves(userId) {
        console.log('[FIREBASE] ========== LISTANDO ==========');
        console.log('[FIREBASE] User ID:', userId);
        
        const savesRef = db.collection('users').doc(userId).collection('saves');
        
        return savesRef.get()
            .then((snapshot) => {
                const saves = [];
                snapshot.forEach((doc) => {
                    saves.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                console.log('[FIREBASE] ✅ Partidas encontradas:', saves.length);
                saves.forEach(s => console.log('[FIREBASE]   📁 ' + s.id + ' - ' + s.playerName));
                console.log('[FIREBASE] ====================================');
                
                return { success: true, saves: saves };
            })
            .catch((error) => {
                console.error('[FIREBASE] ❌ Error al listar:', error);
                console.log('[FIREBASE] ====================================');
                return { success: false, error: error.message };
            });
    },
    
    // Delete a save
    deleteSave(userId, saveId) {
        console.log('[FIREBASE] Eliminando:', saveId);
        
        const saveRef = db.collection('users').doc(userId).collection('saves').doc(saveId);
        
        return saveRef.delete()
            .then(() => {
                console.log('[FIREBASE] ✅ Partida eliminada');
                return { success: true };
            })
            .catch((error) => {
                console.error('[FIREBASE] ❌ Error al eliminar:', error);
                return { success: false, error: error.message };
            });
    }
};

// ============================================
// CONNECTION TEST
// ============================================

function testFirebaseConnection() {
    console.log('========================================');
    console.log('[FIREBASE] 🔄 Probando conexión...');
    console.log('[FIREBASE] Project:', FIREBASE_CONFIG.projectId);
    
    // Test write
    const testRef = db.collection('test').doc('connection');
    return testRef.set({
        test: true,
        timestamp: new Date().toISOString(),
        message: 'Dune: The Measure - Connection Test'
    })
    .then(() => {
        console.log('[FIREBASE] ✅ Conexión exitosa!');
        console.log('[FIREBASE] Ya puedes ver "test/connection" en Firestore Console');
        console.log('========================================');
        return true;
    })
    .catch((error) => {
        console.error('[FIREBASE] ❌ Error de conexión:', error);
        console.log('[FIREBASE] Asegúrate de que Firestore esté habilitado');
        console.log('========================================');
        return false;
    });
}

// ============================================
// AUTO-TEST ON LOAD
// ============================================

// Expose globally
window.FirebaseService = {
    SaveService,
    testConnection: testFirebaseConnection,
    getUserId: () => SaveService.getUserId(),
    generateSaveId: () => SaveService.generateSaveId()
};

// Auto-test connection when script loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(testFirebaseConnection, 1000);
});