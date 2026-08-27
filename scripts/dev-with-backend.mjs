import { spawn } from "node:child_process"
import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const frontendRoot = path.resolve(__dirname, "..")
const backendRoot = path.resolve(frontendRoot, "..", "picklebuddy-api")
const backendPython = path.join(backendRoot, ".venv", "Scripts", "python.exe")

if (!existsSync(backendRoot)) {
  console.error(`Backend project not found at ${backendRoot}`)
  process.exit(1)
}

if (!existsSync(backendPython)) {
  console.error(
    `Backend virtual environment not found at ${backendPython}. Create it first in picklebuddy-api.`
  )
  process.exit(1)
}

const children = []

function spawnLogged(name, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: true,
  })

  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`${name} exited with code ${code}`)
      shutdown(code)
    }
  })

  children.push(child)
  return child
}

function shutdown(exitCode = 0) {
  for (const child of children) {
    if (!child.pid) {
      continue
    }

    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
        stdio: "ignore",
        shell: true,
      })
    } else {
      child.kill("SIGTERM")
    }
  }

  process.exit(exitCode)
}

process.on("SIGINT", () => shutdown(0))
process.on("SIGTERM", () => shutdown(0))

spawnLogged(
  "backend",
  backendPython,
  ["-m", "uvicorn", "app.main:app", "--reload", "--host", "127.0.0.1", "--port", "8001"],
  backendRoot
)

if (process.platform === "win32") {
  spawnLogged(
    "frontend",
    "cmd.exe",
    ["/c", "npm", "run", "dev:frontend"],
    frontendRoot
  )
} else {
  spawnLogged("frontend", "npm", ["run", "dev:frontend"], frontendRoot)
}
