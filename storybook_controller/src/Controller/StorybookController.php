<?php

namespace Drupal\storybook_controller\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Site\Settings;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Theme\ThemeManagerInterface;
use Drupal\Core\Link;
use Drupal\Core\Url;

/**
 * Controller for Storybook components.
 */
class StorybookController extends ControllerBase {

  public function adminPage() {
    $links = [
      [
        'title' => $this->t('Storybook Components'),
        'description' => $this->t('Browse and view Storybook components.'),
        'url' => \Drupal\Core\Url::fromRoute('storybook.components_list'),
      ],
      [
        'title' => $this->t('Storybook Settings'),
        'description' => $this->t('Configure Storybook Controller settings.'),
        'url' => \Drupal\Core\Url::fromRoute('storybook.settings'),
      ],
    ];

    $items = [];
    foreach ($links as $link) {
      $items[] = [
        '#theme' => 'admin_item',
        '#attributes' => ['class' => ['storybook-admin-block']],
        '#wrapper_attributes' => ['class' => ['admin-item']],
        'title' => [
          '#markup' => '<h3 class="admin-item__title">' . $link['title'] . '</h3>',
        ],
        'link' => [
          '#markup' => '<a class="admin-item__link" href="' . $link['url']->toString() . '">' . $this->t('Go to link') . '</a>',
        ],
        'description' => [
          '#markup' => '<p>' . $link['description'] . '</p>',
        ],
      ];
    }
    // Render the list of links.
    return [
      '#type' => 'container',
      '#attributes' => ['class' => ['admin-page']],
      'content' => [
        '#theme' => 'item_list',
        '#items' => $items,
        '#attributes' => ['class' => ['admin-list--panel admin-list']],
      ],
    ];
  }

  protected $configFactory;
  protected $themeManager;

  public function __construct($config_factory, ThemeManagerInterface $theme_manager) {
    $this->configFactory = $config_factory;
    $this->themeManager = $theme_manager;
  }

  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('config.factory'),
      $container->get('theme.manager')
    );
  }

  /**
   * Renders a Storybook component.
   */
  public function renderComponent($id, Request $request) {
    $config = $this->configFactory->get('storybook_controller.settings');
    $enabled = $config->get('enable_component_access');
    
    // Obtén el tema activo.
    $active_theme = $this->themeManager->getActiveTheme()->getPath();
    
    // Usa la ruta configurada o la ruta predeterminada en el tema activo.
    $template_path = $config->get('template_path') ?: $active_theme . '/templates/storybook';

    if (!$enabled) {
      throw new \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException();
    }


    $css_file = $active_theme . '/css/components/' . $id . '.css';
    $css_url = \Drupal::service('file_url_generator')->generateAbsoluteString($css_file);
    $css_exists = file_exists(\Drupal::service('file_system')->realpath($css_file));

    $js_file = $theme_path . '/js/components/' . $id . '.js';
    $js_url = \Drupal::service('file_url_generator')->generateAbsoluteString($js_file);
    $js_exists = file_exists(\Drupal::service('file_system')->realpath($js_file));

    $args = $request->query->all();
    $template_content = \Drupal::service('twig')->render($template_path . '/' . $id . '.html.twig', [
        'args' => $args,
        'css_url' => $css_exists ? $css_url : null, 
        'js_url' => $js_exists ? $js_url : null,
    ]);

    $response = new Response($template_content);
    
    $response->headers->set('Access-Control-Allow-Origin', 'http://localhost:6006');

    return $response;
  }

  /**
   * Checks if component access is allowed based on config.
   */
  public function checkComponentAccess() {
    $config = $this->configFactory->get('storybook_controller.settings');
    return $config->get('enable_component_access');
  }

  /**
   * Lists all available components in the Storybook.
   */
  public function listComponents() {
    $config = $this->configFactory->get('storybook_controller.settings');
    
    // Obtén el tema activo.
    $active_theme = $this->themeManager->getActiveTheme()->getPath();
    
    // Usa la ruta configurada o la ruta predeterminada en el tema activo.
    $template_path = $config->get('template_path') ?: $active_theme . '/templates/storybook';
    $components = [];

    // Escanea el directorio de templates en busca de componentes.
    if (is_dir($template_path)) {
      foreach (scandir($template_path) as $file) {
        $filename = pathinfo($file, PATHINFO_FILENAME);
        $extension = pathinfo($file, PATHINFO_EXTENSION);
        // Asegúrate de que el archivo tenga la extensión '.twig'.
        if ($extension === 'twig') {
          // Elimina el '.html' si está presente.
          $name = str_replace('.html', '', $filename);
          $components[] = [
            'name' => $name,
            'url' => '/storybook/components/' . $name,
          ];
        }
      }
    }

    return [
      '#theme' => 'item_list',
      '#items' => array_map(function ($component) {
        return [
          '#markup' => '<a href="' . $component['url'] . '">' . $component['name'] . '</a>',
        ];
      }, $components),
    ];
  }
}
