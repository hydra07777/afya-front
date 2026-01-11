import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

class SocketManager {
    constructor() {
        this.socket = null;
        this._isConnected = false;
        this.listeners = new Map();
    }

    connect() {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(SERVER_URL, {
            transports: ['websocket', 'polling'],
            upgrade: true,
        });

        this.socket.on('connect', () => {
            console.log('🔌 Connecté au serveur Socket.IO');
            this._isConnected = true;
        });

        this.socket.on('disconnect', () => {
            console.log('🔌 Déconnecté du serveur Socket.IO');
            this._isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Erreur de connexion Socket.IO:', error);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this._isConnected = false;
        }
    }

    // Méthodes pour les hôpitaux
    joinHospitalRoom(hospitalId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('join-hospital', hospitalId);
            console.log(`📍 Rejoint la room hôpital: ${hospitalId}`);
        }
    }

    leaveHospitalRoom(hospitalId) {
        if (this.socket && this.isConnected) {
            this.socket.emit('leave-hospital', hospitalId);
            console.log(`📍 Quitté la room hôpital: ${hospitalId}`);
        }
    }

    // Méthodes pour les admins
    joinAdminRoom() {
        if (this.socket && this.isConnected) {
            this.socket.emit('join-admin');
            console.log('👑 Rejoint la room admin');
        }
    }

    leaveAdminRoom() {
        if (this.socket && this.isConnected) {
            this.socket.emit('leave-admin');
            console.log('👑 Quitté la room admin');
        }
    }

    // Écouter les événements
    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
            // Stocker les listeners pour pouvoir les nettoyer plus tard
            if (!this.listeners.has(event)) {
                this.listeners.set(event, []);
            }
            this.listeners.get(event).push(callback);
        }
    }

    // Arrêter d'écouter un événement
    off(event, callback = null) {
        if (this.socket) {
            if (callback) {
                this.socket.off(event, callback);
                // Retirer de la liste des listeners
                const listeners = this.listeners.get(event) || [];
                const index = listeners.indexOf(callback);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            } else {
                this.socket.off(event);
                this.listeners.delete(event);
            }
        }
    }

    // Émettre un événement
    emit(event, data) {
        if (this.socket && this.isConnected) {
            this.socket.emit(event, data);
        } else {
            console.warn('⚠️ Socket non connecté, impossible d\'émettre:', event);
        }
    }

    // Nettoyer tous les listeners
    removeAllListeners() {
        if (this.socket) {
            for (const [event, callbacks] of this.listeners) {
                callbacks.forEach(callback => {
                    this.socket.off(event, callback);
                });
            }
            this.listeners.clear();
        }
    }

    // Vérifier l'état de connexion
    get isConnected() {
        return this._isConnected;
    }

    // Obtenir l'ID du socket
    get socketId() {
        return this.socket?.id || null;
    }
}

// Créer une instance unique
const socketManager = new SocketManager();

export default socketManager;