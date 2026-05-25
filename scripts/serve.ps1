param(
  [int]$Port = 8000
)

$Node = Get-Command node -ErrorAction SilentlyContinue

if (-not $Node) {
  throw 'Node.js nao foi encontrado. Use `node scripts/serve.mjs` ou instale o Node.js primeiro.'
}

& $Node.Source (Join-Path $PSScriptRoot 'serve.mjs') --port $Port
