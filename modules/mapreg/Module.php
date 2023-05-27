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

        // Remove old image before uploading new image for user thumbnail
        Event::on(\craft\services\Elements::class, \craft\services\Elements::EVENT_BEFORE_SAVE_ELEMENT, function(Event $event) {
            $request = Craft::$app->getRequest();
            $location = $request->getBodyParams();

            if ($event->element instanceof \craft\elements\User) {
                $userId = $event->element->id;
                $asset = Craft::$app->getUser()->getIdentity()->getFieldValue('thumbnail')->one();

                if($asset === null) return;

                Craft::$app->elements->deleteElementById($asset->id);
            }
        });
    }

}