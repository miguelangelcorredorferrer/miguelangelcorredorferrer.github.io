---
title: "Vivantia: an IoT system for smart irrigation management"
summary: Final Degree Project. An Edge-Fog-Cloud IoT system that measures temperature and humidity and remotely controls an irrigation pump over LoRaWAN and TTN, with a Vue and Node.js web application.
category: devsecops
tags: [iot, lorawan, ttn, arduino, nodejs, vue, postgresql, jwt]
status: done
date: 2025-09-01
download: /docs/tfg-vivantia-riego-iot.pdf
featured: true
metrics:
  - { label: "Effort", value: "300 h" }
  - { label: "Architecture", value: "Edge · Fog · Cloud" }
  - { label: "Irrigation modes", value: "Manual · Scheduled · Automatic" }
  - { label: "Test cases", value: "69 unit tests" }
---

## Problem

Managing irrigation remotely requires knowing the state of the crop and its environment, and being able to act on the pump without travelling there, which is costly on large plots and impractical for small gardens. Vivantia is a working prototype that solves both: sensors measuring air temperature, air humidity and soil moisture, an actuator that opens and closes the pump, and a web application to decide when to irrigate. The system must run remotely for long periods with low power consumption, and irrigate only when needed to reduce water use. I built it as my Final Degree Project in Computer Engineering (University of Córdoba), planned at 300 hours. The full document is in Spanish.

## Architecture

![Diagram: Edge device with Arduino and sensors, LoRaWAN gateway and TTN as the Fog layer, Node.js server with PostgreSQL as the Cloud layer and a Vue web interface](../assets/vivantia-riego-iot/arquitectura.svg)

The system is split into four loosely coupled modules:

- **Edge:** an Arduino MKR WAN 1310 reads a DHT11 sensor (air temperature and humidity) and a capacitive soil moisture sensor, and drives the pump through a relay.
- **Fog:** a LoRaWAN gateway and The Things Network (TTN) collect and preprocess messages, decoding bytes to JSON with a payload formatter.
- **Cloud:** a Node.js server with Express receives the readings through an HTTP webhook, stores them in PostgreSQL and exposes a REST API.
- **Web interface:** shows readings in real time and lets the user manage crops, devices and irrigation.

The *uplink* flow carries readings from the sensor to the database. The *downlink* flow carries irrigation orders from the web to the pump through the TTN API. The device also sends periodic empty uplinks to reduce downlink latency under LoRaWAN Class A.

## Stack

- **Hardware:** Arduino MKR WAN 1310, DHT11, capacitive soil moisture sensor v1.2, 5 V relay and RS PRO micro pump, inside a waterproof enclosure.
- **Communications:** LoRa and LoRaWAN (Class A, low power and long range) with TTN as network server.
- **Backend:** Node.js and Express using the MVC pattern, a REST API and Nodemailer for the verification email.
- **Database:** PostgreSQL, including the ideal conditions for each crop.
- **Frontend:** Vue.js with Nuxt, Pinia for state and Tailwind CSS.
- **Security:** JWT, bcrypt, role-based middleware and OTAA.

## Decisions and trade-offs

1. **LoRaWAN instead of Wi-Fi or 4G/5G.** The three technologies were compared. LoRaWAN offers long range and very low power consumption, ideal for a self-powered field device, in exchange for minimal bandwidth and downlinks that only arrive after an uplink in Class A.
2. **A modular Edge-Fog-Cloud architecture.** Each layer can evolve or be replaced without touching the others, and a failure in one module does not take down the whole system. The cost is more pieces to integrate and test.
3. **TTN as the Fog layer.** It avoids running a private LoRaWAN network server and integrates through a webhook and an API. In return, the system depends on a third-party service.
4. **Three irrigation modes.** Manual for one-off irrigation, scheduled for routines, and automatic based on per-crop temperature and humidity thresholds. The automatic mode requires careful calibration of low-cost sensors.
5. **Cloud not deployed.** Module 3 ran locally and was not deployed to a cloud provider, as a matter of prototype scope.

## Threat model (summary)

| Threat | Impact | Control |
|---|---|---|
| Unauthorised device on the LoRaWAN network | Injection of false readings | OTAA authentication and dynamic session keys encrypting traffic between device and gateway |
| Interception of communication with TTN | Exposure of data and irrigation orders | Communication exclusively over HTTPS |
| Unauthorised access to the API | Control of irrigation or other users' data | JWT tokens with expiry, verified by middleware on every request |
| Database theft | Exposure of user credentials | Passwords hashed with bcrypt |
| Privilege escalation | A user reaches administration functions | Role-based access control (visitor, verified user and administrator) |
| Use of the TTN API key to send unauthorised orders | Improper pump activation | The APP key is stored in the server database and only the backend uses it to sign downlinks |
| Adverse environmental conditions | Physical device failure | Waterproof enclosure |

## Evidence and metrics

The full document (349 pages) includes the requirements specification, 47 use cases, activity and sequence diagrams, the entity-relationship model and the development of every module. Testing is organised into 69 unit test cases identified by module:

- Module 1 (Edge): 4.
- Module 2 (Fog): 3.
- Module 3.1 (Cloud, API and logic): 53.
- Module 3.2 (Cloud, storage): 9.

End-to-end integration was also validated in both directions: from the sensors to the database and from the web interface to the microcontroller. The 300 hours were split as follows: preparation 15, analysis 25, design 40, development 130, testing 45 and documentation 45.

## Lessons learned

- Splitting the system into modules made it possible to test each layer on its own before integrating them.
- In LoRaWAN Class A the design revolves around the receive windows: downlinks only arrive after an uplink, hence the periodic empty uplinks.
- A physical control system must treat security end to end, from the device (OTAA) to the web (JWT and roles).
- Improvements planned in the thesis itself: deploy module 3 to the cloud, design a PCB, add bot notifications, compute vapour pressure deficit (VPD) and add AI to estimate the water required.
