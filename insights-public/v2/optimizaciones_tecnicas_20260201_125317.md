# Optimizaciones Técnicas Específicas

## 1. ZRAM (Swap Comprimido)
### Problema: Agotamiento de memoria en Pi 4GB/8GB
### Solución: Comprimir datos en RAM
```bash
# 50% de RAM como ZRAM
echo $(( $(free -k | awk '/^Mem:/ {print $2}') / 2 )) | sudo tee /sys/block/zram0/disksize
sudo mkswap /dev/zram0
sudo swapon /dev/zram0 -p 100
```

## 2. Overclocking (Pi 5)
### Configuración segura para rendimiento
```bash
# /boot/firmware/config.txt
arm_freq=2800
gpu_freq=900
over_voltage_delta=40000
sdram_freq_min=3200
```

## 3. Docker Endurecido
### Principios de mínimo privilegio
```yaml
user: "1000:1000"           # Usuario no-root
read_only: true             # Sistema archivos inmutable
cap_drop: [ALL]             # Sin capacidades kernel
no-new-privileges:true      # Prevenir escalada
```

## 4. Governor CPU
### Evitar throttling durante pensamiento
```bash
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
# Hacer permanente en /etc/default/cpufrequtils
```

## 5. DNS Rápido
### Reducir latencia de APIs
```
nameserver 1.1.1.1  # Cloudflare
nameserver 8.8.8.8  # Google
```

## Checklist de Optimización
- [ ] ZRAM activo
- [ ] Governor en performance
- [ ] Overclock aplicado (si Pi 5)
- [ ] Docker daemon optimizado
- [ ] Servicios innecesarios desactivados
