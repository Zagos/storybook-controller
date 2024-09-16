<?php

namespace Drupal\storybook_controller\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

class StorybookControllerSettingsForm extends ConfigFormBase {

  protected function getEditableConfigNames() {
    return ['storybook_controller.settings'];
  }

  public function getFormId() {
    return 'storybook_controller_settings_form';
  }

  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('storybook_controller.settings');

    $form['template_path'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Template Path'),
      '#default_value' => $config->get('template_path') ?: '', // Dejar vacío por defecto
      '#description' => $this->t('Path to the directory containing the Storybook components. Leave empty to use the default path from the active theme.'),
    ];

    $form['enable_component_access'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable Component Access'),
      '#default_value' => $config->get('enable_component_access'),
      '#description' => $this->t('Allow or disallow access to Storybook components.'),
    ];

    $form['roles'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Roles Allowed to Access Components'),
      '#options' => user_role_names(),
      '#default_value' => $config->get('roles') ?: [],
      '#description' => $this->t('Select roles that can access Storybook components.'),
    ];

    return parent::buildForm($form, $form_state);
  }

  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->config('storybook_controller.settings')
      ->set('template_path', $form_state->getValue('template_path'))
      ->set('enable_component_access', $form_state->getValue('enable_component_access'))
      ->set('roles', array_filter($form_state->getValue('roles')))
      ->save();

    parent::submitForm($form, $form_state);
  }
}
