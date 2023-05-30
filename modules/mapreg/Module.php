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
            // only execute code if element is of type user.
            if ($event->element instanceof \craft\elements\User) {
                $userId = $event->element->id;

                $cfile = fopen("test.json", "w");
                fwrite($cfile, json_encode(Craft::$app->getUser()));
                fclose($cfile);

                if(!Craft::$app->getUser()->getIdentity()) return;

                $potentionalOldAsset = Craft::$app->getUser()->getIdentity()->getFieldValue('thumbnail')->one();

                // If file array is empty with request stop function from running.
                if(!isset($_FILES["fields"])) return;
                // Access uploaded files in post request to check if image was uploaded
                $uploadedAsset = $_FILES["fields"]["name"]["thumbnail"][0];

                // If there is no asset in this field yet stop function from running
                if($potentionalOldAsset === null) return;
                // If there is no new uploaded image stop function from running
                if($uploadedAsset === "") return;

                Craft::$app->elements->deleteElementById($potentionalOldAsset->id);
            }
        });
    }

}