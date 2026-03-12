<script>
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const res = await fetch('ajax/auth.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'logout', csrf: CSRF_TOKEN }),
        });
        const data = await res.json();
        if (data.success) {
          window.location.href = '<?= htmlspecialchars($logoutRedirect ?? 'idle.php') ?>';
        }
      } catch (e) {}
    });
  }
</script>
