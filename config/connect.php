<?php

use craft\helpers\App;

return [
    'connections' => [
        'old' => [
            'driver' => App::env('OLD_DB_DRIVER'),
            'server' => App::env('OLD_DB_SERVER'),
            'user' => App::env('OLD_DB_USER'),
            'password' => App::env('OLD_DB_PASSWORD'),
            'database' => App::env('OLD_DB_DATABASE'),
            'schema' => App::env('OLD_DB_SCHEMA'),
            'tablePrefix' => App::env('OLD_DB_TABLE_PREFIX'),
            'port' => App::env('OLD_DB_PORT')
        ],
    ],
];