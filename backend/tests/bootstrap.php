<?php

declare(strict_types=1);

$autoloadCandidates = [
    __DIR__ . '/../vendor/autoload.php',
    __DIR__ . '/../../../../vendor/autoload.php',
];

$loader = null;
foreach ($autoloadCandidates as $candidate) {
    if (file_exists($candidate)) {
        $loader = require_once $candidate;
        break;
    }
}

if ($loader === null) {
    throw new RuntimeException('Composer autoload.php not found.');
}

$appSrcPath = realpath(__DIR__ . '/../src');
if ($appSrcPath !== false && $loader instanceof \Composer\Autoload\ClassLoader) {
    $loader->addPsr4('App\\', $appSrcPath . DIRECTORY_SEPARATOR, true);
}
