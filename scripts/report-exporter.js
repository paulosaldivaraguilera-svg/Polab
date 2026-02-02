/**
 * Export Module - PDF/CSV Reports
 * 
 * Genera reportes exportables en diferentes formatos:
 * - CSV para datos tabulares
 * - JSON para integración
 */

class ReportExporter {
    constructor() {
        this.formats = ['csv', 'json', 'txt'];
    }
    
    // Exportar leads a CSV
    exportLeadsCSV(leads) {
        const headers = ['ID', 'Nombre', 'Teléfono', 'Email', 'Servicio', 'Fuente', 'Estado', 'Fecha'];
        const rows = leads.map(l => [
            l.id,
            l.nombre,
            l.telefono,
            l.email || '',
            l.servicio,
            l.fuente,
            l.estado,
            new Date(l.fecha).toLocaleDateString()
        ]);
        
        return this.toCSV(headers, rows);
    }
    
    // Exportar métricas a JSON
    exportMetricsJSON(metrics) {
        return JSON.stringify({
            exportDate: new Date().toISOString(),
            metrics
        }, null, 2);
    }
    
    // Exportar tareas a texto legible
    exportTasksTxt(tasks) {
        let txt = '═'.repeat(50) + '\n';
        txt += '      RALPH LOOP - REPORTE DE TAREAS\n';
        txt += '═'.repeat(50) + '\n\n';
        txt += `Fecha: ${new Date().toLocaleString()}\n`;
        txt += `Total: ${tasks.length} tareas\n\n`;
        
        const byProject = tasks.reduce((acc, t) => {
            if (!acc[t.project]) acc[t.project] = [];
            acc[t.project].push(t);
            return acc;
        }, {});
        
        for (const [project, projectTasks] of Object.entries(byProject)) {
            txt += `\n┌── ${project.toUpperCase()} (${projectTasks.length})\n`;
            projectTasks.forEach(t => {
                const status = t.status === 'done' ? '✅' : t.status === 'in_progress' ? '🔄' : '⏳';
                txt += `│ ${status} ${t.task}\n`;
            });
            txt += '└' + '─'.repeat(40) + '\n';
        }
        
        txt += `\n\nGenerado por PauloARIS v2.1`;
        return txt;
    }
    
    // Helper: Array to CSV
    toCSV(headers, rows) {
        const allRows = [headers, ...rows];
        return allRows.map(row => 
            row.map(cell => {
                const str = String(cell);
                return str.includes(',') || str.includes('"') || str.includes('\n')
                    ? `"${str.replace(/"/g, '""')}"`
                    : str;
            }).join(',')
        ).join('\n');
    }
    
    // Download helper
    download(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    // Export and download
    exportAndDownload(data, format, filename) {
        let content;
        let mimeType;
        
        switch (format.toLowerCase()) {
            case 'csv':
                content = this.exportLeadsCSV(data);
                mimeType = 'text/csv';
                break;
            case 'json':
                content = this.exportMetricsJSON(data);
                mimeType = 'application/json';
                break;
            case 'txt':
                content = this.exportTasksTxt(data);
                mimeType = 'text/plain';
                break;
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
        
        this.download(content, `${filename}.${format}`, mimeType);
    }
}

// CLI Usage
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];
    const exporter = new ReportExporter();
    
    // Simulated data for demo
    const mockTasks = [
        { project: 'pauloaris', task: 'Mejorar dashboard', status: 'done' },
        { project: 'pauloaris', task: 'Crear API docs', status: 'in_progress' },
        { project: 'games', task: 'Update Elemental Pong', status: 'pending' }
    ];
    
    if (command === 'tasks') {
        console.log(exporter.exportTasksTxt(mockTasks));
    } else {
        console.log('Usage: report.js tasks');
    }
}

module.exports = ReportExporter;
