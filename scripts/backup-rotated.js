/**
 * Backup System con Rotación
 * 
 * Características:
 * - Backups automáticos
 * - Rotación de backups antiguos
 * - Compresión gzip
 * - Verificación de integridad
 */

const BACKUP_CONFIG = {
    maxBackups: 7,           // Mantener 7 backups
    backupDir: './backups/',
    sources: [
        'state/',
        'projects/',
        'memory/',
        'scripts/'
    ],
    exclude: [
        '*.pyc',
        '__pycache__/',
        'node_modules/',
        '*.log'
    ]
};

class BackupSystem {
    constructor(config = BACKUP_CONFIG) {
        this.config = config;
        this.backupDir = config.backupDir;
    }
    
    async createBackup(label = 'manual') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup_${label}_${timestamp}.tar.gz`;
        const filepath = `${this.backupDir}${filename}`;
        
        // Crear comando tar
        const excludes = this.config.exclude.map(e => `--exclude=${e}`).join(' ');
        const sources = this.config.sources.join(' ');
        
        const command = `tar -czf ${filepath} ${excludes} ${sources}`;
        
        try {
            const result = await exec(command);
            
            // Calcular checksum
            const checksum = await this.calculateChecksum(filepath);
            
            // Guardar metadata
            const metadata = {
                filename,
                filepath,
                timestamp: Date.now(),
                size: await this.getFileSize(filepath),
                checksum,
                sources: this.config.sources
            };
            
            // Guardar metadata
            await this.saveMetadata(metadata);
            
            // Rotar backups si es necesario
            await this.rotateBackups();
            
            return { success: true, backup: metadata };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async calculateChecksum(filepath) {
        const result = await exec(`sha256sum ${filepath}`);
        return result.stdout.split(' ')[0];
    }
    
    async getFileSize(filepath) {
        const result = await exec(`stat -c%s ${filepath}`);
        return parseInt(result.stdout);
    }
    
    async saveMetadata(metadata) {
        const metadataFile = `${this.backupDir}backups.json`;
        const existing = await this.loadMetadata();
        
        existing.push(metadata);
        
        await write(metadataFile, JSON.stringify(existing, null, 2));
    }
    
    async loadMetadata() {
        try {
            const content = await read(`${this.backupDir}backups.json`);
            return JSON.parse(content);
        } catch {
            return [];
        }
    }
    
    async rotateBackups() {
        const backups = await this.loadMetadata();
        
        if (backups.length > this.config.maxBackups) {
            // Ordenar por fecha (más recientes primero)
            backups.sort((a, b) => b.timestamp - a.timestamp);
            
            // Eliminar backups excedentes
            const toRemove = backups.slice(this.config.maxBackups);
            for (const backup of toRemove) {
                await exec(`rm -f ${backup.filepath}`);
            }
            
            // Actualizar metadata
            const kept = backups.slice(0, this.config.maxBackups);
            await write(`${this.backupDir}backups.json`, JSON.stringify(kept, null, 2));
        }
    }
    
    async restoreBackup(filename) {
        const backupPath = `${this.backupDir}${filename}`;
        
        try {
            // Verificar checksum
            const currentChecksum = await this.calculateChecksum(backupPath);
            const metadata = await this.loadMetadata();
            const backupMeta = metadata.find(b => b.filename === filename);
            
            if (backupMeta && currentChecksum !== backupMeta.checksum) {
                throw new Error('Checksum mismatch - backup may be corrupted');
            }
            
            // Extraer backup
            await exec(`tar -xzf ${backupPath} -C /`);
            
            return { success: true, filename };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async listBackups() {
        const backups = await this.loadMetadata();
        return backups.map(b => ({
            filename: b.filename,
            timestamp: new Date(b.timestamp).toISOString(),
            size: this.formatSize(b.size),
            checksum: b.checksum.substring(0, 8)
        }));
    }
    
    formatSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let unitIndex = 0;
        let size = bytes;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }
}

// Script CLI
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0] || 'create';
    
    const backup = new BackupSystem();
    
    switch (command) {
        case 'create':
            backup.createBackup('auto').then(r => {
                console.log(r.success ? 'Backup creado' : `Error: ${r.error}`);
            });
            break;
            
        case 'list':
            backup.listBackups().then(list => {
                console.log('Backups disponibles:');
                list.forEach(b => {
                    console.log(`  ${b.filename} - ${b.size} - ${b.timestamp}`);
                });
            });
            break;
            
        case 'restore':
            const filename = args[1];
            if (filename) {
                backup.restoreBackup(filename).then(r => {
                    console.log(r.success ? 'Restaurado' : `Error: ${r.error}`);
                });
            } else {
                console.log('Uso: backup.js restore <filename>');
            }
            break;
    }
}

module.exports = { BackupSystem, BACKUP_CONFIG };
