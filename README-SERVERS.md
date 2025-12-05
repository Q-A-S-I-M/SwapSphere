# Running Both Servers Together

This project contains two Spring Boot servers:
- **SwapSphere Backend** (port 8080) - Main application backend
- **Chat Server** (port 8081) - WebSocket chat server

## Quick Start

### Windows
```bash
run-servers.bat
```

### Linux/Mac
```bash
./run-servers.sh
```

## Manual Start (Two Terminals)

### Using Maven Wrapper (Recommended)
```bash
# Terminal 1 - SwapSphere Backend
cd SwapSphere
./mvnw spring-boot:run
# Windows: mvnw.cmd spring-boot:run

# Terminal 2 - Chat Server
cd Chat-App-Spring-Boot
./mvnw spring-boot:run
# Windows: mvnw.cmd spring-boot:run
```

### Using System Maven (if installed)
```bash
# Terminal 1 - SwapSphere Backend
cd SwapSphere
mvn spring-boot:run

# Terminal 2 - Chat Server
cd Chat-App-Spring-Boot
mvn spring-boot:run
```

## Requirements

- **Java 21** (for SwapSphere Backend)
- **Java 17+** (for Chat Server)
- **Maven** (optional - both projects include Maven wrapper)

## Ports

- SwapSphere Backend: `http://localhost:8080`
- Chat Server: `http://localhost:8081`

## Stopping Servers

- **Windows**: Close the command windows or press `Ctrl+C` in each window
- **Linux/Mac**: Press `Ctrl+C` in the terminal running the script

