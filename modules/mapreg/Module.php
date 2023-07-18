<?php
namespace mapreg;

use Craft;
use yii\base\Event;
use craft\elements\User;
use craft\services\Elements;


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
        Event::on(\Elements::class, Elements::EVENT_BEFORE_SAVE_ELEMENT, function (Event $event) {
            // only execute code if element is of type user.
            if ($event->element instanceof User) {
                $userId = $event->element->id;

                if (!Craft::$app->getUser()->getIdentity())
                    return;

                $potentionalOldAsset = Craft::$app->getUser()->getIdentity()->getFieldValue('thumbnail')->one();

                // If file array is empty with request stop function from running.
                if (!isset($_FILES["fields"]))
                    return;
                // Access uploaded files in post request to check if image was uploaded
                $uploadedAsset = $_FILES["fields"]["name"]["thumbnail"][0];

                // If there is no asset in this field yet stop function from running
                if ($potentionalOldAsset === null)
                    return;
                // If there is no new uploaded image stop function from running
                if ($uploadedAsset === "")
                    return;

                Craft::$app->elements->deleteElementById($potentionalOldAsset->id);
            }
        });

        Event::on(Elements::class, Elements::EVENT_AFTER_SAVE_ELEMENT, function (Event $event) {
            // only execute code if element is of type user and guest.
            $guest_reg = Craft::$app->request->getBodyParam("guestRegister");

            if (!$event->element instanceof User || !$guest_reg) {
                return;
            }

            function getParticipantsGroup()
            {
                foreach (Craft::$app->userGroups->allGroups as $group) {
                    if ("participants" == $group->handle) {
                        return $group;
                    }
                }
            };

            $participants_group = getParticipantsGroup()->id;
            Craft::$app->users->assignUserToGroups($event->element->id, [$participants_group]);
        });

        Event::on(Elements::class, Elements::EVENT_AFTER_SAVE_ELEMENT, function (Event $event) {
            // only execute code if element is of type user and guest.
            $guest_reg = Craft::$app->request->getBodyParam("guestRegister");
            $user = $event->element;
            $requestBody = Craft::$app->request->getBodyParams();

            if (!$event->element instanceof User || !$guest_reg) {
                return;
            }

            // Activate user before assignment to group
            if ($user->active)
                return;
            Craft::$app->users->activateUser($user);

            // get guest group with handle
            function getGuestGroup()
            {
                foreach (Craft::$app->userGroups->allGroups as $group) {
                    if ("guests" == $group->handle) {
                        return $group;
                    }
                }
            };

            $guest_group = getGuestGroup()->id;
            Craft::$app->users->assignUserToGroups($user->id, [$guest_group]);

            Craft::$app->request->getCsrfToken();
            $user = User::find()->id($user->id)->one();
            $user->setFieldValue('profession', $requestBody["fields"]["profession"]);
            $user->setFieldValue('ageGroup', $requestBody["fields"]["ageGroup"]);
            $user->setFieldValue('marketingPermissions', $requestBody["fields"]["marketingPermissions"]);

            if (Craft::$app->elements->saveElement($user)) {
                return $user;
            } else {
                throw new \Exception("Couldn't save user: " . print_r($user->getErrors(), true));
            }

        });
    }

}