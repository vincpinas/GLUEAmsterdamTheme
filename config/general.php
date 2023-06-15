<?php
/**
 * General Configuration
 *
 * All of your system's general configuration settings go in here. You can see a
 * list of the available settings in vendor/craftcms/cms/src/config/GeneralConfig.php.
 *
 * @see \craft\config\GeneralConfig
 */

use craft\config\GeneralConfig;
use craft\helpers\App;

$config = GeneralConfig::create()
    // Set the default week start day for date pickers (0 = Sunday, 1 = Monday, etc.)
    ->defaultWeekStartDay(1)
    // Prevent generated URLs from including "index.php"
    ->omitScriptNameInUrls()
    // Enable Dev Mode (see https://craftcms.com/guides/what-dev-mode-does)
    ->devMode(App::env('DEV_MODE') ?? false)
    // Preload Single entries as Twig variables
    ->preloadSingles()
    // Allow administrative changes
    ->allowAdminChanges(App::env('ALLOW_ADMIN_CHANGES') ?? false)
    // Disallow robots
    ->disallowRobots(App::env('DISALLOW_ROBOTS') ?? false)
    ->enableGql(true)
    ->useEmailAsUsername(true)
    ->errorTemplatePrefix('_errors/')
    ->aliases([
        '@stylesheets' => App::env('CRAFT_ENVIRONMENT') == "production" ? '/web/css' : '/css',
        '@cscripts' => App::env('CRAFT_ENVIRONMENT') == "production" ? '/web/scripts' : '/scripts'
    ])
    ->activateAccountSuccessPath('/login')
    ->invalidUserTokenPath('/')
    ->setPasswordPath('/reset-password')
    ->setPasswordSuccessPath('/login')
;

return $config;