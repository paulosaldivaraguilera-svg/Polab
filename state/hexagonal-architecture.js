/**
 * Hexagonal Architecture Implementation for POLAB APIs
 * 
 * Puerto y Adaptadores:
 * - Núcleo de dominio sin dependencias externas
 * - Servicios de aplicación orquestan casos de uso
 * - Adaptadores para DB, API, externos
 */

class Entity {
    constructor(props) {
        this.id = props.id;
        this.createdAt = props.createdAt || new Date();
        this.updatedAt = props.updatedAt || new Date();
    }
}

class ValueObject {
    constructor(value) {
        this.value = value;
    }
}

// ========================
// CORE DOMAIN (Inside)
// ========================

// Entidades de Dominio
class Lead extends Entity {
    constructor(props) {
        super(props);
        this.nombre = props.nombre;
        this.telefono = props.telefono;
        this.email = props.email;
        this.servicio = props.servicio;
        this.estado = props.estado || 'nuevo';
        this.fuente = props.fuente;
    }
}

class Task extends Entity {
    constructor(props) {
        super(props);
        this.project = props.project;
        this.task = props.task;
        this.status = props.status || 'pending';
        this.priority = props.priority || 1;
    }
}

// Repositorios (Puerto - abstracción)
class LeadRepository {
    async save(lead) { throw new Error('Not implemented'); }
    async findById(id) { throw new Error('Not implemented'); }
    async findAll() { throw new Error('Not implemented'); }
    async delete(id) { throw new Error('Not implemented'); }
}

class TaskRepository {
    async save(task) { throw new Error('Not implemented'); }
    async findByStatus(status) { throw new Error('Not implemented'); }
    async findPending() { throw new Error('Not implemented'); }
}

// Servicios de Dominio (Lógica de negocio pura)
class LeadService {
    constructor(leadRepository) {
        this.repository = leadRepository;
    }

    async crearLead(datos) {
        const lead = new Lead({
            ...datos,
            createdAt: new Date()
        });
        
        // Reglas de negocio
        if (!this.validarDatos(lead)) {
            throw new Error('Datos de lead inválidos');
        }
        
        return await this.repository.save(lead);
    }

    validarDatos(lead) {
        return lead.nombre && lead.telefono && lead.servicio;
    }
}

class TaskService {
    constructor(taskRepository) {
        this.repository = taskRepository;
    }

    async crearTask(project, task, priority = 1) {
        const newTask = new Task({ project, task, priority });
        return await this.repository.save(newTask);
    }

    async obtenerPendientes() {
        return await this.repository.findPending();
    }
}

// ========================
// APPLICATION SERVICES
// ========================

class ApplicationServices {
    constructor(leadService, taskService) {
        this.leadService = leadService;
        this.taskService = taskService;
    }

    async processNewLead(leadData) {
        const lead = await this.leadService.crearLead(leadData);
        return {
            success: true,
            leadId: lead.id,
            message: 'Lead creado exitosamente'
        };
    }

    async queueTask(project, taskDescription, priority = 1) {
        const task = await this.taskService.crearTask(project, taskDescription, priority);
        return {
            success: true,
            taskId: task.id,
            status: task.status
        };
    }
}

// ========================
// OUTSIDE ADAPTERS
// ========================

// Adaptador de Base de Datos (PostgreSQL/SQLite)
class SqlLeadRepository extends LeadRepository {
    constructor(dbClient) {
        super();
        this.db = dbClient;
    }

    async save(lead) {
        const query = `INSERT INTO leads (nombre, telefono, email, servicio, estado, fuente) 
                       VALUES (?, ?, ?, ?, ?, ?)`;
        const result = await this.db.execute(query, [
            lead.nombre, lead.telefono, lead.email, lead.servicio, lead.estado, lead.fuente
        ]);
        lead.id = result.insertId;
        return lead;
    }

    async findById(id) {
        const query = 'SELECT * FROM leads WHERE id = ?';
        const row = await this.db.execute(query, [id]);
        return row ? new Lead(row) : null;
    }

    async findAll() {
        const query = 'SELECT * FROM leads ORDER BY createdAt DESC';
        const rows = await this.db.execute(query, []);
        return rows.map(row => new Lead(row));
    }
}

// Adaptador de API REST
class ApiLeadAdapter {
    constructor(applicationServices) {
        this.services = applicationServices;
    }

    // Convierte request HTTP a dominio
    parseRequest(httpRequest) {
        return {
            nombre: httpRequest.body.nombre,
            telefono: httpRequest.body.telefono,
            email: httpRequest.body.email,
            servicio: httpRequest.body.servicio,
            fuente: httpRequest.body.fuente || 'api'
        };
    }

    // Convierte dominio a response HTTP
    formatResponse(domainResult) {
        return {
            statusCode: domainResult.success ? 201 : 400,
            body: domainResult
        };
    }

    async handleCreateLead(request) {
        const leadData = this.parseRequest(request);
        const result = await this.services.processNewLead(leadData);
        return this.formatResponse(result);
    }
}

// Adaptador de Cola de Mensajes
class QueueTaskAdapter {
    constructor(applicationServices, messageQueue) {
        this.services = applicationServices;
        this.queue = messageQueue;
    }

    async queueTaskFromMessage(message) {
        const taskData = JSON.parse(message.body);
        return await this.services.queueTask(
            taskData.project,
            taskData.description,
            taskData.priority
        );
    }
}

// ========================
// ENTRY POINT (Main)
// ========================

class Main {
    constructor() {
        // Inicializar adaptadores externos
        const dbClient = this.createDbClient();  // SQLite/PostgreSQL
        const messageQueue = this.createQueue(); // Redis/RabbitMQ
        
        // Inicializar repositorios (puertos)
        const leadRepo = new SqlLeadRepository(dbClient);
        const taskRepo = new InMemoryTaskRepository(); // O SQLite
        
        // Inicializar servicios de dominio
        const leadService = new LeadService(leadRepo);
        const taskService = new TaskService(taskRepo);
        
        // Inicializar servicios de aplicación
        this.appServices = new ApplicationServices(leadService, taskService);
        
        // Inicializar adaptadores de entrada
        this.apiAdapter = new ApiLeadAdapter(this.appServices);
        this.queueAdapter = new QueueTaskAdapter(this.appServices, messageQueue);
    }

    createDbClient() {
        // En producción: conexión real a SQLite/PostgreSQL
        return {
            execute: async (query, params) => ({ insertId: Date.now() })
        };
    }

    createQueue() {
        // En producción: Redis/RabbitMQ
        return {
            publish: async (channel, message) => console.log(`Queue: ${channel}`)
        };
    }

    // Handler HTTP
    async handleHttpRequest(request) {
        if (request.path === '/api/leads' && request.method === 'POST') {
            return await this.apiAdapter.handleCreateLead(request);
        }
        return { statusCode: 404, body: { error: 'Not found' } };
    }
}

module.exports = {
    Entity, ValueObject,
    Lead, Task,
    LeadRepository, TaskRepository,
    LeadService, TaskService,
    ApplicationServices,
    SqlLeadRepository,
    ApiLeadAdapter,
    QueueTaskAdapter,
    Main
};
