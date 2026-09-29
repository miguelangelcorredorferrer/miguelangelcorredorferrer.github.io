---
# Copia este archivo a src/content/projects/es/<slug>.md
# El nombre del archivo es la URL: /es/projects/<slug>/
# Para la versión en inglés usa el MISMO nombre en src/content/projects/en/.
title: Título del proyecto
summary: Una frase (≤ 220 caracteres) con el problema y el resultado. Se usa en tarjetas y como meta description.
category: devsecops          # devsecops (DevSecOps/Infraestructura) | security (Seguridad)
tags: [etiqueta-1, etiqueta-2]
status: in-progress          # in-progress | done
date: 2026-01-15             # fecha de inicio o de publicación
repo: https://github.com/usuario/repo   # opcional
# demo: https://...                      # opcional
featured: false              # true = aparece en la home (máximo 4 recomendados)
# cover: ../assets/<slug>/cover.png      # opcional; imagen en src/content/projects/assets/<slug>/
# coverAlt: Descripción de la imagen     # obligatorio si hay cover
metrics: []                  # opcional, p. ej. [{ label: "Tiempo de build", value: "−40 %" }]
---

## Problema

<!-- Qué problema real resuelve y para quién. Contexto y restricciones (tiempo, coste, entorno). 3-5 líneas. -->

## Arquitectura

<!-- Diagrama como SVG estático o PNG en src/content/projects/assets/<slug>/ y enlazado así:
![Descripción del diagrama](../assets/<slug>/arquitectura.svg)
Después, 2-4 líneas explicando el flujo principal. -->

## Stack

<!-- Tecnologías usadas y por qué cada una. Una línea por pieza relevante. -->

## Decisiones y trade-offs

<!-- Las 2-4 decisiones importantes: qué alternativas había, qué elegiste y qué sacrificaste. -->

## Modelo de amenazas (resumen)

<!-- Activos, actores y superficies de ataque principales, y los controles aplicados. Una tabla corta funciona bien:
| Amenaza | Impacto | Control |
|---|---|---| -->

## Evidencia y métricas

<!-- Pruebas verificables: capturas saneadas, resultados de escaneos, antes/después, enlaces a ejecuciones de CI.
Sin IPs, hostnames internos, tokens ni datos de clientes. -->

## Lecciones aprendidas

<!-- Qué harías distinto y qué te llevas. 3-5 puntos. -->
