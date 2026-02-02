/**
 * Push Notifications Module con Service Worker
 * 
 * Características:
 * - Notificaciones del navegador
 * - Service Worker para background
 * - Suscripción/unsuscripción
 */

class PushNotifications {
    constructor() {
        this.swRegistration = null;
        this.vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
        this.permission = 'default';
    }
    
    // Verificar soporte
    isSupported() {
        return 'Notification' in window && 'serviceWorker' in navigator;
    }
    
    // Inicializar
    async init() {
        if (!this.isSupported()) {
            console.warn('Push notifications not supported');
            return false;
        }
        
        this.permission = Notification.permission;
        
        // Registrar service worker
        this.swRegistration = await navigator.serviceWorker.register('/sw.js');
        
        // Suscripción existente
        const subscription = await this.swRegistration.pushManager.getSubscription();
        if (subscription) {
            this.subscription = subscription;
        }
        
        return true;
    }
    
    // Solicitar permiso
    async requestPermission() {
        try {
            this.permission = await Notification.requestPermission();
            return this.permission === 'granted';
        } catch (e) {
            console.error('Error requesting permission:', e);
            return false;
        }
    }
    
    // Suscribirse a push notifications
    async subscribe() {
        if (this.permission !== 'granted') {
            await this.requestPermission();
        }
        
        if (!this.swRegistration) {
            await this.init();
        }
        
        try {
            const subscription = await this.swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
            });
            
            this.subscription = subscription;
            
            // Enviar suscripción al servidor
            await this.sendSubscriptionToServer(subscription);
            
            return subscription;
        } catch (e) {
            console.error('Error subscribing:', e);
            return null;
        }
    }
    
    // Desuscribirse
    async unsubscribe() {
        if (this.subscription) {
            await this.subscription.unsubscribe();
            this.subscription = null;
            
            // Notificar al servidor
            await this.removeSubscriptionFromServer();
        }
    }
    
    // Mostrar notificación
    async show(title, options = {}) {
        if (this.permission !== 'granted') {
            await this.requestPermission();
        }
        
        const defaultOptions = {
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            vibrate: [100, 50, 100],
            requireInteraction: false,
            ...options
        };
        
        // Usar service worker para notificaciones
        if (this.swRegistration && this.swRegistration.active) {
            this.swRegistration.showNotification(title, defaultOptions);
        } else {
            new Notification(title, defaultOptions);
        }
    }
    
    // Notificaciones del sistema
    async notifyTaskComplete(taskName) {
        await this.show('✅ Tarea Completada', {
            body: `La tarea "${taskName}" ha sido completada exitosamente.`,
            tag: 'task-complete',
            data: { taskName, timestamp: Date.now() }
        });
    }
    
    async notifyAlert(alert) {
        await this.show(`🚨 ${alert.type.toUpperCase()}`, {
            body: alert.message,
            tag: 'system-alert',
            requireInteraction: true,
            data: alert
        });
    }
    
    async notifyMilestone(milestone) {
        await this.show('🎯 Hito Alcanzado', {
            body: milestone,
            tag: 'milestone',
            requireInteraction: false
        });
    }
    
    // Comunicarse con Service Worker
    sendToSW(message) {
        if (this.swRegistration && this.swRegistration.active) {
            this.swRegistration.active.postMessage(message);
        }
    }
    
    // Servidor
    async sendSubscriptionToServer(subscription) {
        // En producción: enviar al servidor
        console.log('Subscription:', JSON.stringify(subscription));
    }
    
    async removeSubscriptionFromServer() {
        // En producción: eliminar del servidor
        console.log('Unsubscribed');
    }
    
    // Helper
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
}

// Service Worker para Push
const swCode = `
self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'PauloARIS';
    const options = data.options || { body: 'Notificación del sistema' };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});
`;

window.PushNotifications = PushNotifications;
