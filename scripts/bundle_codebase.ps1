$rootDir = (Get-Item -Path ".").FullName
$outputFile = Join-Path $rootDir "CODEBASE_CONTEXT.md"

$ignorePatterns = @(
    '\\\.git\\',
    'CODEBASE_CONTEXT\.md$',
    'scripts\\',
    '\.png$', '\.jpg$', '\.jpeg$', '\.webp$', '\.avif$', '\.mp4$', '\.gif$', '\.ico$', '\.svg$',
    'docs\\lighthouse-report.*\.html$'
)

$mediaExtensions = @('.png', '.jpg', '.jpeg', '.webp', '.avif', '.mp4', '.gif', '.ico', '.svg')

$sb = New-Object System.Text.StringBuilder

[void]$sb.AppendLine('# Codebase Context: aestheticwebsite')
[void]$sb.AppendLine('> Comprehensive context file generated for AI Agents (LLMs). Contains repository overview, file structure, assets manifest, and complete source code.')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('## 1. Project Overview & Architecture')
[void]$sb.AppendLine('- **Project Name**: Aesthetic Website (Nike Sneaker Store Demo)')
[void]$sb.AppendLine('- **Tech Stack**: Vanilla HTML5, CSS3 (Custom Design System / Glassmorphism), Vanilla JavaScript (ES6+ Modules/Scripts)')
[void]$sb.AppendLine('- **Key Modules**:')
[void]$sb.AppendLine('  - `index.html`: Landing page (Hero video, featured sneakers, interactive categories, responsive navbar & search overlay).')
[void]$sb.AppendLine('  - `assets/css/style.css`: Core design system, color variables, typography, animations, responsive breakpoints.')
[void]$sb.AppendLine('  - `assets/js/home.js`: Interactive logic for home page carousel, animations, cart previews.')
[void]$sb.AppendLine('  - `assets/js/mobile.js`: Mobile drawer, touch gestures, responsive nav toggles.')
[void]$sb.AppendLine('  - `assets/js/monitoring.js`: Performance telemetry and error logging helper.')
[void]$sb.AppendLine('  - `assets/js/searchOverlay.js`: Global modal search dialog with dynamic filtering and keyboard navigation.')
[void]$sb.AppendLine('  - `pages/products/`: Catalog listing with category filters, sorting, and product cards.')
[void]$sb.AppendLine('  - `pages/cart/`: Cart management, quantity adjustments, order summary calculation.')
[void]$sb.AppendLine('  - `pages/favor/`: Wishlist / Favorites tracking with local storage persistence.')
[void]$sb.AppendLine('  - `pages/search/`: Full dedicated search page with detailed filter parameters.')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('## 2. Directory Tree')
[void]$sb.AppendLine('```text')

$allFiles = Get-ChildItem -Path $rootDir -Recurse -File | Where-Object { 
    $_.FullName -notmatch '\\\.git\\' -and $_.Name -ne 'CODEBASE_CONTEXT.md' -and $_.FullName -notmatch '\\scripts\\'
}

foreach ($f in $allFiles) {
    $rel = $f.FullName.Substring($rootDir.Length + 1).Replace('\', '/')
    $sizeKb = [math]::Round($f.Length / 1024, 1)
    [void]$sb.AppendLine("$rel ($sizeKb KB)")
}
[void]$sb.AppendLine('```')
[void]$sb.AppendLine('')

[void]$sb.AppendLine('## 3. Media & Assets Manifest (Binary / Large Files)')
[void]$sb.AppendLine('| Relative Path | Size | Type | Description |')
[void]$sb.AppendLine('|---|---|---|---|')

foreach ($f in $allFiles) {
    $ext = $f.Extension.ToLower()
    $isMedia = $mediaExtensions -contains $ext -or $f.FullName -match 'docs\\lighthouse-report'
    if ($isMedia) {
        $rel = $f.FullName.Substring($rootDir.Length + 1).Replace('\', '/')
        $sizeStr = if ($f.Length -ge 1048576) { "$([math]::Round($f.Length / 1048576, 2)) MB" } else { "$([math]::Round($f.Length / 1024, 1)) KB" }
        $typeStr = $f.Extension.TrimStart('.').ToUpper()
        $desc = switch -Wildcard ($rel) {
            '*test-video.mp4*' { 'Hero background promo video' }
            '*logo.png*' { 'Site header brand logo' }
            '*78-best-nike-sneakers.webp*' { 'Featured collection hero image' }
            '*hollywood-keepers-hero.jpg*' { 'Lookbook banner image' }
            '*image-1.avif*' { 'Product showcase banner' }
            '*image.avif*' { 'Secondary showcase banner' }
            '*lighthouse-report*' { 'Google Lighthouse audit report (HTML)' }
            default { 'Asset' }
        }
        [void]$sb.AppendLine("| ``$rel`` | $sizeStr | $typeStr | $desc |")
    }
}
[void]$sb.AppendLine('')

[void]$sb.AppendLine('## 4. Source Code Files')
[void]$sb.AppendLine('')

$sourceFiles = $allFiles | Where-Object {
    $item = $_
    $skip = $false
    foreach ($pat in $ignorePatterns) {
        if ($item.FullName -match $pat) {
            $skip = $true
            break
        }
    }
    -not $skip
}

foreach ($file in $sourceFiles) {
    $rel = $file.FullName.Substring($rootDir.Length + 1).Replace('\', '/')
    $ext = $file.Extension.TrimStart('.').ToLower()
    $lang = switch ($ext) {
        'html' { 'html' }
        'css' { 'css' }
        'js' { 'javascript' }
        'json' { 'json' }
        'yml' { 'yaml' }
        'yaml' { 'yaml' }
        'md' { 'markdown' }
        default { 'text' }
    }
    
    [void]$sb.AppendLine('================================================')
    [void]$sb.AppendLine("FILE: $rel")
    [void]$sb.AppendLine('================================================')
    [void]$sb.AppendLine("<file path=""$rel"">")
    [void]$sb.AppendLine(('```' + $lang))
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    [void]$sb.AppendLine($content)
    [void]$sb.AppendLine('```')
    [void]$sb.AppendLine('</file>')
    [void]$sb.AppendLine('')
}

[System.IO.File]::WriteAllText($outputFile, $sb.ToString(), [System.Text.Encoding]::UTF8)
$size = [math]::Round((Get-Item $outputFile).Length / 1024, 1)
Write-Output "Successfully generated: $outputFile ($size KB)"
