---
title: Despliegue del servicio DNS en un dominio de Active Directory
summary: Guía práctica de laboratorio sobre Windows Server 2022. Zonas directa e inversa, FQDN, reenviadores hacia DNS públicos y comprobación con nslookup, desde el antiguo lmhosts hasta un DNS completo.
category: devsecops
tags: [dns, active-directory, windows-server, nslookup, laboratorio]
status: done
date: 2026-03-01
download: /docs/dns-active-directory.pdf
featured: true
metrics:
  - { label: "Zonas creadas", value: "2 (directa + inversa)" }
  - { label: "Registros probados", value: "A, PTR, NS, SOA" }
  - { label: "Checklist de despliegue", value: "5/5 pasos" }
---

## Problema

Active Directory depende por completo de DNS: sin resolución de nombres correcta los equipos no encuentran el controlador de dominio ni se autentican. Este proyecto documenta, paso a paso, cómo desplegar y validar el servicio DNS en un entorno de dominio, partiendo de cómo se resolvían los nombres antes de que existiera (archivo `lmhosts` y nombres NetBIOS de hasta 15 caracteres) y llegando a un DNS con FQDN, zonas y salida controlada a internet. Se realizó en un laboratorio virtual sobre Windows Server 2022, como guía de implementación reutilizable.

## Arquitectura

![Diagrama: cliente DNS, servidor DNS privado con las zonas de prueba.local, firewall y DNS público](../assets/dns-active-directory/arquitectura.svg)

El cliente solo habla con el DNS privado, que es autoritativo para el dominio del laboratorio (`prueba.local`). Si la consulta es de un dominio que no conoce, por ejemplo `www.microsoft.com`, la reenvía a través del firewall al DNS público mediante reenviadores (*forwarders*). Un DNS de Active Directory nunca debe apuntar directamente a un DNS público.

## Stack

- **Windows Server 2022**: rol *Servidor DNS*, instalado desde el Administrador del servidor o con `Install-WindowsFeature -Name DNS -IncludeManagementTools`.
- **Zona de búsqueda directa** (`prueba.local`): nombre → IP, con registros A, NS y SOA.
- **Zona de búsqueda inversa** (`3.168.192.in-addr.arpa`): IP → nombre, con registros PTR.
- **PowerShell y herramientas de red** (`nslookup`, `nbtstat`, `ipconfig /registerdns`): verificación y diagnóstico.

## Decisiones y trade-offs

1. **FQDN en lugar de nombres NetBIOS.** `lmhosts` (con `#PRE` para precargar la caché y `nbtstat -R`) funciona en redes pequeñas, pero no escala y los nombres cortos no reflejan la estructura real. Con un sufijo DNS, `marketing01` pasa a ser `marketing01.prueba.local`. Se sacrifica la simplicidad del fichero plano por una resolución jerárquica y centralizada.
2. **Zona inversa explícita.** Sin ella, `nslookup` devuelve `UnKnown` como servidor predeterminado, porque el DNS no puede traducir su IP a un nombre. Si se recrea la zona, el PTR no reaparece solo: hay que forzarlo reiniciando, marcando *Update Associated Pointer (PTR) record* en el registro A, o con `ipconfig /registerdns`.
3. **Actualizaciones dinámicas.** En el laboratorio se permitieron todas (seguras y no seguras) para que los clientes se registren solos. Es cómodo, pero el propio asistente avisa de que es un riesgo (ver modelo de amenazas).
4. **Reenviadores en lugar de apuntar a un DNS público.** Centraliza la salida a internet en un único punto controlado por el firewall, a cambio de que el DNS privado pase a ser un punto único de fallo para la navegación.

## Modelo de amenazas (resumen)

| Amenaza | Impacto | Control |
|---|---|---|
| Actualizaciones dinámicas no seguras: cualquier origen podría crear o sobrescribir registros | Suplantación de nombres, redirección de tráfico | En producción, zona integrada en AD y «solo actualizaciones dinámicas seguras». La opción insegura se usó solo en el laboratorio |
| Clientes del dominio consultando directamente a un DNS público | Fuga de nombres internos, resolución fuera de control | Los equipos solo usan el DNS privado, que reenvía a través del firewall |
| Zona inversa ausente o PTR incorrecto | Fallos de diagnóstico y de servicios que validan la IP inversa | Comprobación con `nslookup` y registro del PTR |
| Zona pública gestionada con registros dinámicos | Registros no deseados accesibles desde internet | Desactivar actualizaciones dinámicas en zonas de dominios públicos |

## Evidencia y métricas

La guía se valida con un checklist de cinco pasos, todos completados: instalar el servicio, configurar TCP/IP (IP fija y DNS apuntando a sí mismo), crear las zonas, configurar el FQDN del servidor y probar con `nslookup`.

- `nslookup` sin argumentos devuelve como servidor predeterminado el FQDN del propio DNS, resuelto por la zona inversa.
- `nslookup <fqdn>` devuelve el nombre y la IP del servidor, confirmando la zona directa.
- Con la zona inversa eliminada, el servidor predeterminado pasa a `UnKnown` y vuelve a resolverse al recrearla y registrar el PTR.
- Con `lmhosts`, tras `#PRE` y `nbtstat -R`, `nbtstat -c` lista las entradas precargadas y `ping` resuelve el nombre.

Los valores de red (`192.168.x.x`, `prueba.local`) son del laboratorio aislado.

## Lecciones aprendidas

- DNS es la base de Active Directory: conviene montarlo y validarlo antes de promover el controlador de dominio.
- La zona inversa es opcional para que «funcione», pero necesaria para diagnosticar bien y para servicios que validan la IP inversa.
- Los registros PTR no se regeneran solos al recrear una zona; hay que saber las tres formas de forzarlos.
- La opción cómoda de las actualizaciones dinámicas abiertas es la menos segura. En un entorno real iría con zonas integradas en AD y actualizaciones seguras.
- Una segunda iteración debería añadir un segundo servidor DNS, para no tener un punto único de fallo.
