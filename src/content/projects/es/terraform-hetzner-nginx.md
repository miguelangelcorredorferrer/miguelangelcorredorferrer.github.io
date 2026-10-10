---
title: Servidor web en Hetzner Cloud con Terraform
summary: Infraestructura como código para alojar una web estática con Nginx en una instancia Ubuntu de Hetzner Cloud, con firewall a nivel de proveedor (22, 80 y 443) y aprovisionamiento automático con cloud-init.
category: devsecops
tags: [terraform, hetzner, nginx, cloud-init, iac, firewall]
status: done
date: 2026-07-30
download: /docs/terraform-hetzner-nginx.pdf
featured: true
metrics:
  - { label: "Despliegue", value: "init → plan → apply" }
  - { label: "Puertos expuestos", value: "22, 80, 443 (+ ICMP)" }
  - { label: "Instancia", value: "CX23 · 2 vCPU · 4 GB · 40 GB" }
---

## Problema

Una pequeña empresa de hostelería quiere alojar su web estática en la nube, con un firewall básico (solo los puertos 22, 80 y 443) y sin montar el servidor a mano cada vez. El objetivo del proyecto es aprender a crear instancias, acceder por SSH, aplicar firewalls a nivel de proveedor y configurar un servidor web Nginx, todo de forma reproducible. Es el primer nivel de una serie de arquitecturas cloud sobre Hetzner, con el coste como restricción: una instancia pequeña y una IPv4 pública.

## Arquitectura

![Diagrama: Terraform en CentOS llama a la API de Hetzner, que crea una instancia Ubuntu con Nginx detrás de un firewall](../assets/terraform-hetzner-nginx/arquitectura.svg)

Desde una máquina CentOS con Terraform se lanza `terraform apply`. El provider de Hetzner crea la clave SSH, el firewall y el servidor. Al arrancar por primera vez, `cloud-init` instala Nginx, escribe el `index.html` y activa el servicio. El firewall se asocia al servidor desde Terraform mediante `firewall_ids`.

## Stack

- **Terraform** (provider `hetznercloud/hcloud`): infraestructura como código, con el estado y las variables sensibles fuera del repositorio.
- **Hetzner Cloud**: instancia CX23 con Ubuntu 26.04 en Helsinki, barata por usar hardware más antiguo.
- **cloud-init**: instala Nginx y publica el contenido en el primer arranque, sin conectarse al servidor.
- **Firewall de Hetzner**: filtrado a nivel de proveedor, antes de que el tráfico llegue a la máquina.
- **GitHub y `gh`**: control de versiones del código de infraestructura.
- **`hcloud` (CLI)**: depuración sin salir a la consola web.

Estructura del proyecto:

```text
nivel1-single-instance/
├── main.tf          # provider, clave SSH y servidor
├── variables.tf     # variables (el token es sensitive)
├── firewall.tf      # reglas del firewall del proveedor
├── cloud-init.yaml  # aprovisionamiento del primer arranque
├── outputs.tf       # IPv4 e IPv6 de salida
└── terraform.tfvars # valores locales, NUNCA a git
```

## Decisiones y trade-offs

1. **Firewall del proveedor frente a firewall del sistema.** Se filtra en Hetzner, no con `ufw` dentro de la máquina: es declarativo, vive en el mismo código y no consume recursos de la instancia. Si el servidor tuviera firewall propio, habría que desactivarlo para no duplicar reglas.
2. **Clave SSH dedicada al proyecto.** Un par `ed25519` generado solo para el laboratorio (`hetzner_lab`), cargado en `ssh-agent`, en lugar de reutilizar la clave personal. Terraform sube solo la pública y la privada no sale de la máquina de control.
3. **Secretos fuera de git.** El token de la API entra por una variable `sensitive` y el valor vive en `terraform.tfvars` o en el entorno. El `.gitignore` excluye `*.tfstate`, `.terraform/` y `terraform.tfvars`.
4. **cloud-init en lugar de configurar por SSH.** Un despliegue sin pasos manuales y repetible, a cambio de que el contenido quede acoplado al arranque inicial: cambiar la web después exige recrear la instancia o usar otra herramienta (por ejemplo Ansible).

Fragmento del firewall (el resto de reglas repite el patrón con los puertos 80, 443 e ICMP):

```hcl
resource "hcloud_firewall" "basic" {
  name = "nivel1-basic-fw"

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "22"
    source_ips = ["0.0.0.0/0", "::/0"]
  }
}
```

## Modelo de amenazas (resumen)

| Amenaza | Impacto | Control |
|---|---|---|
| Filtración del token de la API de Hetzner | Control total de la cuenta y del gasto | Variable `sensitive`, valor en `terraform.tfvars` ignorado por git, nunca en el código |
| Robo de la clave privada SSH | Acceso `root` al servidor | Clave dedicada al proyecto, cargada en `ssh-agent`, fuera del repositorio |
| Exposición de servicios no previstos | Mayor superficie de ataque | Firewall con solo 22, 80 y 443 abiertos (más ICMP) |
| SSH abierto a todo internet (`0.0.0.0/0`) | Fuerza bruta y escaneos contra el puerto 22 | Autenticación por clave. Limitar el origen a IP concretas queda como mejora |
| Estado de Terraform filtrado | El `tfstate` puede contener datos sensibles | `*.tfstate` ignorado por git. En un equipo, estado remoto cifrado |

## Evidencia y métricas

Comprobaciones realizadas tras `terraform apply` (sin direcciones IP ni identificadores de la cuenta):

- `hcloud server list` muestra la instancia en estado `running`.
- `hcloud server describe` confirma el tipo CX23 (2 vCPU compartidas, 4 GB de RAM, 40 GB de disco, x86).
- `curl http://$(terraform output -raw server_ip)` devuelve el `index.html` servido por Nginx.
- `ping` a la IP pública responde con 0 % de pérdida, porque el firewall permite ICMP.
- `ssh -i ~/.ssh/hetzner_lab root@$(terraform output -raw server_ip)` abre una sesión en Ubuntu 26.04 LTS.
- `terraform destroy` elimina todos los recursos al terminar y evita costes residuales.

La IPv4 pública cuesta aproximadamente 0,50 € al mes.

## Lecciones aprendidas

- Ejecutar `terraform plan` antes de `apply` evita sorpresas en la factura.
- `.terraform.lock.hcl` se excluyó de git en este proyecto, pero HashiCorp recomienda versionarlo para fijar las versiones del provider.
- El firewall describe «entrada y salida», pero solo se definieron reglas de entrada. Conviene decidir de forma explícita la política de salida.
- Se abrió el puerto 443, pero la web se sirve por HTTP: falta un certificado TLS (por ejemplo, Let's Encrypt) para aprovecharlo.
- Siguientes pasos: restringir SSH a IP conocidas, desactivar el acceso `root` por SSH y pasar de una instancia única a una arquitectura con más capas.
