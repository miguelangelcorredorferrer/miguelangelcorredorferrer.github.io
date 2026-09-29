---
# Copia este archivo a src/content/writeups/es/<slug>.md
# SOLO máquinas retiradas. Nunca publiques flags, hashes ni contraseñas.
platform: HackTheBox         # HackTheBox, TryHackMe, VulnHub, …
name: NombreMaquina
summary: Una frase (≤ 220 caracteres) con la técnica principal. Se usa en tarjetas y como meta description.
difficulty: easy             # easy | medium | hard | insane
os: Linux                    # Linux | Windows | …
date: 2026-01-15             # fecha en la que la resolviste
tags: [web, privesc]
retired: true                # obligatorio: el build falla si es false o falta
---

## Resumen

<!-- 2-3 líneas: cadena de ataque en una frase y qué aprendiste. -->

## Reconocimiento

<!-- Enumeración de servicios y hallazgos relevantes. Pega solo la salida útil, recortada.
```bash
nmap -sC -sV <IP-objetivo>
``` -->

## Acceso inicial

<!-- Vulnerabilidad, por qué existe y cómo la explotaste. Explica el razonamiento, no solo los comandos. -->

## Escalada de privilegios

<!-- Vector de escalada y por qué funciona. -->

## Visión defensiva

<!-- Sección OBLIGATORIA (el comprobador falla si no existe este encabezado). -->

### Detección

<!-- Qué logs, eventos o reglas (Sigma, Suricata, EDR, auditd…) habrían detectado cada fase. -->

### Remediación

<!-- Cómo se corrige la causa raíz y qué controles adicionales reducirían el impacto. -->
