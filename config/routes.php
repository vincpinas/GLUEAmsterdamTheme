<?php
/**
 * Site URL Rules
 *
 * You can define custom site URL rules here, which Craft will check in addition
 * to routes defined in Settings → Routes.
 *
 * Read all about Craft’s routing behavior, here:
 * https://craftcms.com/docs/4.x/routing.html
 */

return [
    // Amsterdam
    'default' => [
        '/' => ['template' => 'containers/map'],
        'login' => ['template' => 'containers/login'],
        'edit-page' => ['template' => 'containers/edit-page'],
        'edit-program' => ['template' => 'containers/edit-program/index'],
        'edit-program/new' => ['template' => 'containers/edit-program/_edit'],
        'edit-program/<number:\d+>' => ['template' => 'containers/edit-program/_edit'],
        'program' => ['template' => 'containers/program'],
        'sign-up/<number:\d+>' => ['template' => 'containers/register'],
        'sign-up/confirmation' => ['template' => 'containers/register-confirm'],
        'password-reset' => ['template' => 'containers/password-reset'],
        'password-forget' => ['template' => 'containers/password-forget'],
    ],
    // Globals
    'api' => 'graphql/api',
    '<slug>' => ['template' => 'containers/account'],
];
