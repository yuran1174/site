<?php
declare(strict_types=1);

$pageNavItems = $pageNavItems ?? [];
?>
<div class="page-nav">
  <?php foreach ($pageNavItems as $pageNavItem): ?>
    <?php if (!empty($pageNavItem['visible']) || !array_key_exists('visible', $pageNavItem)): ?>
      <a
        href="<?= htmlspecialchars((string) ($pageNavItem['href'] ?? '#')) ?>"
        class="<?= htmlspecialchars(trim('nav-link ' . ($pageNavItem['class'] ?? ''))) ?>"
        <?php if (!empty($pageNavItem['id'])): ?>id="<?= htmlspecialchars((string) $pageNavItem['id']) ?>"<?php endif; ?>
      ><?= $pageNavItem['label'] ?? '' ?></a>
    <?php endif; ?>
  <?php endforeach; ?>
</div>
