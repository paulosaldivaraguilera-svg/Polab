/**
 * Platform Engineering Setup - Nix + Docker + Reproducibility
 * 
 * Configuración para entorno de desarrollo reproducible:
 * - Nix Flakes para gestión de dependencias
 * - Docker Compose para servicios
 * - Dev environment configurable
 */

const PLATFORM_CONFIG = {
    nix: {
        enabled: true,
        flakes: true,
        channels: ['nixpkgs'],
        overlays: ['nur-overlay']
    },
    docker: {
        network: 'polab_network',
        volumes: ['./data:/app/data'],
        restartPolicy: 'unless-stopped'
    },
    services: [
        { name: 'ollama', port: 11434, image: 'ollama/ollama:latest' },
        { name: 'n8n', port: 5678, image: 'n8nio/n8n:latest' },
        { name: 'postgres', port: 5432, image: 'postgres:15' },
        { name: 'redis', port: 6379, image: 'redis:7-alpine' }
    ]
};

// Generate Nix Flake for the project
function generateNixFlake() {
    return `{
  description = "PauloARIS - Sistema de Agente Autónomo";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells = {
          default = pkgs.mkShell {
            buildInputs = with pkgs; [
              # Lenguajes
              python311
              nodejs_20
              rustc
              cargo

              # Herramientas de desarrollo
              git
              curl
              wget
              jq
              yq

              # Docker y contenedores
              docker
              docker-compose

              # IA y ML
              ollama

              # Seguridad
              gh
              ssh-to-age

              # Editor
              neovim
              lazyvim

              # Utils
              htop
              btop
              nvme-cli
            ];

            shellHook = ''
              export EDITOR=nvim
              alias ll='ls -la'
              alias gs='git status'
              alias gd='git diff'
              alias gc='git commit -m "$(date +%Y-%m-%d): $(git diff --stat | head -1)"'
            '';
          };
        };

        packages = {
          ollama = pkgs.ollama;
          n8n = pkgs.n8n;
        };
      }
    );
};
`;
}

// Generate Docker Compose for services
function generateDockerCompose() {
    const services = PLATFORM_CONFIG.services.map(svc => {
        return `  ${svc.name}:
    image: ${svc.image}
    container_name: polab_${svc.name}
    ports:
      - "${svc.port}:${svc.port}"
    volumes:
      - polab_${svc.name}_data:/data
    networks:
      - polab_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:${svc.port}/health"]
      interval: 30s
      timeout: 10s
      retries: 3`;
    }).join('\n');

    return `version: '3.8'

networks:
  polab_network:
    driver: bridge

volumes:
${PLATFORM_CONFIG.services.map(svc => `  polab_${svc.name}_data:`).join('\n')}

services:
${services}

  # Agente PauloARIS
  pauloaris:
    build: .
    container_name: polab_pauloaris
    depends_on:
      - ollama
      - postgres
      - redis
    environment:
      - OLLAMA_HOST=http://ollama:11434
      - DATABASE_URL=postgresql://user:pass@postgres:5432/polab
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./:/app
      - pauloaris_data:/root/.cache
    networks:
      - polab_network
    restart: unless-stopped
    profiles:
      - agent`;
}

// Dev environment configuration
function generateDevConfig() {
    return `# PauloARIS Development Environment
# Configuración reproducible con Nix

{
  "name": "polab-dev",
  "nixEnabled": true,
  "dockerEnabled": true,
  
  "languages": {
    "python": {
      "version": "3.11",
      "lsp": "pyright",
      "formatters": ["black", "ruff"],
      "test": "pytest"
    },
    "javascript": {
      "version": "20",
      "lsp": "typescript-language-server",
      "formatters": ["prettier"],
      "test": "vitest"
    },
    "rust": {
      "toolchain": "stable",
      "lsp": "rust-analyzer",
      "formatters": ["rustfmt"]
    }
  },

  "ai": {
    "ollama": {
      "url": "http://localhost:11434",
      "models": ["phi3", "qwen2.5:1.5b", "tinyllama"]
    },
    "neovim": {
      "plugins": ["avante.nvim", "codeCompanion"],
      "model": "ollama:phi3"
    }
  },

  "tools": {
    "git": {
      "hooks": true,
      "gpgSign": true
    },
    "docker": {
      "contexts": ["default", "buildx"]
    }
  },

  "monitoring": {
    "ports": [5678, 11434, 3939],
    "dashboards": ["n8n", "ollama", "grafana"]
  }
}
`;
}

// Nix flake wrapper for easy execution
const NIX_FLAKE_WRAPPER = `#!/usr/bin/env bash
# PauloARIS Nix Environment Wrapper

set -e

FLAKE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

case "$1" in
    shell)
        exec nix develop "$FLAKE_DIR" -c bash --rcfile <(cat ~/.bashrc; echo 'PS1="[pauloaris-nix] $PS1"')
        ;;
    build)
        exec nix build "$FLAKE_DIR#$2"
        ;;
    run)
        exec nix run "$FLAKE_DIR#$2"
        ;;
    update)
        exec nix flake update "$FLAKE_DIR"
        ;;
    *)
        echo "Usage: $0 {shell|build|run|update}"
        echo ""
        echo "Commands:"
        echo "  shell  - Enter development shell"
        echo "  build  - Build a package"
        echo "  run    - Run a package"
        echo "  update - Update flake inputs"
        exit 1
        ;;
esac
`;
}

module.exports = { 
    PLATFORM_CONFIG, 
    generateNixFlake, 
    generateDockerCompose, 
    generateDevConfig,
    NIX_FLAKE_WRAPPER 
};
