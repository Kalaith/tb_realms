<?php

declare(strict_types=1);

$roots = ['src', 'public', 'scripts', 'tests'];
$failed = false;

foreach ($roots as $root) {
    $path = dirname(__DIR__) . DIRECTORY_SEPARATOR . $root;
    if (!is_dir($path)) {
        continue;
    }

    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path));
    foreach ($iterator as $file) {
        if (!$file instanceof SplFileInfo || $file->getExtension() !== 'php') {
            continue;
        }

        $filename = $file->getPathname();
        passthru('php -l ' . escapeshellarg($filename), $exitCode);
        if ($exitCode !== 0) {
            $failed = true;
        }

        $contents = file_get_contents($filename);
        if ($contents === false || !str_contains($contents, 'declare(strict_types=1);')) {
            fwrite(STDERR, $filename . " is missing declare(strict_types=1);\n");
            $failed = true;
        }
    }
}

exit($failed ? 1 : 0);
