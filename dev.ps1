$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
if ($projectRoot.StartsWith("\\?\")) {
  $projectRoot = $projectRoot.Substring(4)
}

$scriptPath = Join-Path $projectRoot "scripts\run-next-dev.js"
Set-Location -LiteralPath $projectRoot

$nodeArgs = @($scriptPath) + $args
& node @nodeArgs
exit $LASTEXITCODE
