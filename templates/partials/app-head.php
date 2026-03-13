<?php
declare(strict_types=1);

$pageTitle = $pageTitle ?? 'Код и Кофе';
$pageIcon = $pageIcon ?? '💻';
$pageStyles = $pageStyles ?? [];
$pageUseFontAwesome = $pageUseFontAwesome ?? false;
$pageExtraHead = $pageExtraHead ?? [];
?>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($pageTitle) ?></title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'><?= htmlspecialchars($pageIcon) ?></text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
  <?php if ($pageUseFontAwesome): ?>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <?php endif; ?>
  <?php foreach ($pageStyles as $pageStyle): ?>
    <link rel="stylesheet" href="<?= htmlspecialchars($pageStyle) ?>">
  <?php endforeach; ?>
  <?php foreach ($pageExtraHead as $pageHeadTag): ?>
    <?= $pageHeadTag . PHP_EOL ?>
  <?php endforeach; ?>
  <script>
    window.ApiSession = (() => {
      let authStatePromise = null;

      async function fetchState() {
        const response = await fetch('/ajax/auth.php?action=me', {
          cache: 'no-store',
          credentials: 'same-origin',
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to load auth state.');
        }
        return data;
      }

      async function getState(force = false) {
        if (force || authStatePromise === null) {
          authStatePromise = fetchState().catch((error) => {
            authStatePromise = null;
            throw error;
          });
        }

        return authStatePromise;
      }

      async function getCsrfToken(force = false) {
        const state = await getState(force);
        if (state.csrfToken) {
          window.CSRF_TOKEN = state.csrfToken;
        }
        return state.csrfToken || window.CSRF_TOKEN || '';
      }

      function forget() {
        authStatePromise = null;
      }

      return { getState, getCsrfToken, forget };
    })();
  </script>
</head>
