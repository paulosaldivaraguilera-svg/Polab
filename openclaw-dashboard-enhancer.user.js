// ==UserScript==
// @name         OpenClaw Dashboard Enhancer
// @namespace    http://polab.cl
// @version      2.0
// @description  Mejora el dashboard de OpenClaw con dark theme, panel de acciones y estadísticas
// @author       Paulo Saldívar + Foundry
// @match        http://localhost:18789/*
// @match        http://127.0.0.1:18789/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // Esperar a que cargue el DOM
    function initEnhancer() {
        // Verificar que estamos en el dashboard
        if (!window.location.pathname.includes('/chat')) return;

        console.log('%c🎮💙 OpenClaw Dashboard Enhancer v2.0', 'font-size: 20px; font-weight: bold; color: #A83232;');

        // ========== ESTILOS ==========
        const styles = \`
            :root {
                --bg-primary: #0a0a0a;
                --bg-secondary: #1a1a2e;
                --bg-card: rgba(255,255,255,0.05);
                --text-primary: #e0e0e0;
                --text-secondary: #888;
                --accent-red: #A83232;
                --accent-cyan: #00f3ff;
                --accent-yellow: #FFC107;
                --border-color: rgba(255,255,255,0.1);
            }

            /* Body */
            body {
                background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%) !important;
            }

            /* Messages */
            .message, [class*="message"] {
                background: var(--bg-card) !important;
                border: 1px solid var(--border-color) !important;
                border-radius: 12px !important;
                backdrop-filter: blur(10px);
            }

            .assistant-message, [data-sender="assistant"] {
                border-left: 4px solid var(--accent-red) !important;
            }

            .user-message, [data-sender="user"] {
                border-right: 4px solid var(--accent-cyan) !important;
            }

            /* Input */
            textarea, input, [contenteditable], .input-container {
                background: rgba(0,0,0,0.5) !important;
                border: 1px solid var(--border-color) !important;
                border-radius: 12px !important;
                color: var(--text-primary) !important;
            }

            /* Buttons */
            button, .btn, [role="button"] {
                background: linear-gradient(135deg, var(--accent-red), #cc0044) !important;
                border: none !important;
                border-radius: 8px !important;
                color: white !important;
                font-weight: 600 !important;
                transition: all 0.3s ease !important;
            }

            button:hover, .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 20px rgba(168, 50, 50, 0.4) !important;
            }

            /* Scrollbar */
            ::-webkit-scrollbar { width: 8px; }
            ::-webkit-scrollbar-track { background: var(--bg-primary) !important; }
            ::-webkit-scrollbar-thumb { background: var(--accent-red) !important; border-radius: 4px; }

            /* Links */
            a { color: var(--accent-cyan) !important; }
            a:hover { color: var(--accent-yellow) !important; }

            /* ========== PANEL ACCIONES RÁPIDAS ========== */
            #openclaw-quick-actions {
                position: fixed;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(0,0,0,0.85);
                backdrop-filter: blur(15px);
                border: 1px solid var(--border-color);
                border-radius: 16px;
                padding: 16px;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                animation: slideIn 0.5s ease;
            }

            @keyframes slideIn {
                from { opacity: 0; transform: translateY(-50%) translateX(50px); }
                to { opacity: 1; transform: translateY(-50%) translateX(0); }
            }

            #openclaw-quick-actions .title {
                color: var(--accent-yellow);
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 2px;
                text-align: center;
                margin-bottom: 8px;
                font-weight: 700;
            }

            #openclaw-quick-actions button {
                min-width: 160px;
                text-align: left;
                padding: 12px 16px;
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            #openclaw-quick-actions button span {
                font-size: 16px;
            }

            /* ========== PANEL ESTADÍSTICAS ========== */
            #openclaw-stats {
                position: fixed;
                left: 20px;
                bottom: 20px;
                background: rgba(0,0,0,0.85);
                backdrop-filter: blur(15px);
                border: 1px solid var(--border-color);
                border-radius: 12px;
                padding: 16px;
                z-index: 99999;
                font-family: 'Space Mono', monospace;
                font-size: 11px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            }

            #openclaw-stats .title {
                color: var(--accent-yellow);
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 2px;
                margin-bottom: 12px;
                font-weight: 700;
            }

            .stat-row {
                display: flex;
                justify-content: space-between;
                gap: 20px;
                margin: 6px 0;
            }

            .stat-label { color: var(--text-secondary); }
            .stat-value { color: var(--accent-cyan); font-weight: bold; }

            /* ========== HEADER ========== */
            .openclaw-header-status {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                margin-left: auto;
                padding: 6px 12px;
                background: rgba(0,0,0,0.3);
                border-radius: 20px;
                font-size: 12px;
            }

            .openclaw-header-status::before {
                content: '';
                width: 8px;
                height: 8px;
                background: #00ff88;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        \`;

        GM_addStyle(styles);

        // ========== CREAR PANEL ACCIONES ==========
        const quickActions = document.createElement('div');
        quickActions.id = 'openclaw-quick-actions';
        quickActions.innerHTML = \`
            <div class="title">⚡ Acciones Rápidas</div>
            <button onclick="window.open('/projects/polab/la-unidad/index_v2.html', '_blank')">
                <span>📰</span> La Unidad v2.0
            </button>
            <button onclick="window.open('/projects/gaming/elemental-pong/prototype_v2.1.html', '_blank')">
                <span>🎮</span> ELEMENTAL PONG
            </button>
            <button onclick="window.open('/projects/gaming/recta-provincia/prototype_v2.0.html', '_blank')">
                <span>🌑</span> RECTA PROVINCIA
            </button>
            <button onclick="window.open('/projects/polab/videojuegos/delitos/index_v1.5.html', '_blank')">
                <span>🔍</span> DELITOS
            </button>
            <button onclick="window.open('/formalizacion-epistemologica-v2.html', '_blank')">
                <span>⚖️</span> Formalización
            </button>
            <button onclick="window.open('/panel-control.html', '_blank')">
                <span>🎛️</span> Panel Control
            </button>
        \`;
        document.body.appendChild(quickActions);

        // ========== CREAR PANEL ESTADÍSTICAS ==========
        const stats = document.createElement('div');
        stats.id = 'openclaw-stats';
        stats.innerHTML = \`
            <div class="title">📊 Estado del Sistema</div>
            <div class="stat-row">
                <span class="stat-label">Proyectos</span>
                <span class="stat-value">4/4 ✅</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Casos DELITOS</span>
                <span class="stat-value">18/18</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Workspace</span>
                <span class="stat-value">6.5 MB</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Líneas código</span>
                <span class="stat-value">4000+</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Sesión</span>
                <span class="stat-value" style="color: #00ff88;">Activa</span>
            </div>
        \`;
        document.body.appendChild(stats);

        // ========== AGREGAR STATUS AL HEADER ==========
        const header = document.querySelector('header, .header, [class*="header"]') || document.body;
        const statusEl = document.createElement('span');
        statusEl.className = 'openclaw-header-status';
        statusEl.textContent = 'Sistema activo';
        header.appendChild(statusEl);

        // ========== ATALJOS DE TECLADO ==========
        const shortcuts = {
            '1': '/projects/polab/la-unidad/index_v2.html',
            '2': '/projects/gaming/elemental-pong/prototype_v2.1.html',
            '3': '/projects/gaming/recta-provincia/prototype_v2.0.html',
            '4': '/projects/polab/videojuegos/delitos/index_v1.5.html',
            '5': '/formalizacion-epistemologica-v2.html',
            '6': '/panel-control.html'
        };

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && shortcuts[e.key]) {
                e.preventDefault();
                window.open(shortcuts[e.key], '_blank');
            }
        });

        console.log('%c✅ Dashboard mejorado! 🎮💙', 'color: #00f3ff; font-size: 16px;');
        console.log('%cAtajos: Ctrl+1 a Ctrl+6', 'color: #888;');
    }

    // Ejecutar cuando esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEnhancer);
    } else {
        initEnhancer();
    }

    // También observar cambios en el DOM (para SPAs)
    const observer = new MutationObserver(() => {
        if (document.querySelector('#openclaw-quick-actions')) return; // Ya creado
        initEnhancer();
    });
    observer.observe(document.body, { childList: true, subtree: true });

})();
