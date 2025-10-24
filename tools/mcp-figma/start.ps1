param(
  [string]$FigmaApiKey = $env:FIGMA_API_KEY,
  [int]$Port = 0
)

Write-Host "Starting Figma MCP via figma-developer-mcp..."

if ([string]::IsNullOrWhiteSpace($FigmaApiKey)) {
  Write-Error "FIGMA_API_KEY is not set. Set env var or pass -FigmaApiKey."
  exit 1
}

$portArg = ""
if ($Port -gt 0) { $portArg = "--port=$Port" }

# npx fetches the package and runs it with stdio for IDE integration
$env:FIGMA_API_KEY = $FigmaApiKey
npx -y figma-developer-mcp --stdio --figma-api-key=$FigmaApiKey $portArg
