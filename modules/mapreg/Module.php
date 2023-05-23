<?php
namespace mapreg;

use Craft;
use yii\base\Event;
use craft\elements\User;
use craft\events\ModelEvent;


class Module extends \yii\base\Module
{
    public function init()
    {
        // Define a custom alias named after the namespace
        Craft::setAlias('@reghandle', __DIR__);

        // Set the controllerNamespace based on whether this is a console or web request
        if (Craft::$app->getRequest()->getIsConsoleRequest()) {
            $this->controllerNamespace = 'foo\\console\\controllers';
        } else {
            $this->controllerNamespace = 'foo\\controllers';
        }

        parent::init();

        // Event::on(\craft\services\Elements::class, \craft\services\Elements::EVENT_AFTER_SAVE_ELEMENT, function(Event $event) {
        //     $request = Craft::$app->getRequest();
        //     $location = $request->getBodyParams()["location"];

        //     if ($event->element instanceof \craft\elements\User) {
        //         $userId = $event->element->id;

        //         $controller = new \craft\controllers\UsersController('users', Craft::$app);
        //         $action = 'save-address';

        //         $params = [
        //             'userId' => $userId,
        //             'fullName' => 'Map',
        //         ];

        //         $result = $controller->run($action, $params);
        //     }
        // });
    }

}