// Announcements button (_includes/wiki-msg.html): the badge counts the messages in the dialog that
// the reader has not opened yet. Opening the dialog marks all of them as read. The ids of the
// read messages live in localStorage; only the ids still in the dialog are kept.
(function () {
  var KEY = 'wikiMsgRead';
  var btn = document.getElementById('wiki-msg-btn');
  var dialog = document.getElementById('wiki-msg-dialog');
  if (!btn || !dialog) return;
  var badge = btn.querySelector('.float-btn-badge');

  var ids = Array.prototype.map.call(dialog.querySelectorAll('[data-msg-id]'), function (el) {
    return el.getAttribute('data-msg-id');
  });

  function getRead() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY));
      return Array.isArray(v) ? v : [];
    } catch (e) {
      return [];
    }
  }

  function showBadge() {
    var read = getRead();
    var unread = ids.filter(function (id) { return read.indexOf(id) < 0; }).length;
    badge.textContent = unread;
    badge.hidden = unread === 0;
  }

  function markAllRead() {
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch (e) {}
    badge.hidden = true;
  }

  showBadge();

  btn.addEventListener('click', function () {
    dialog.showModal();
    markAllRead();
  });

  // a click on the backdrop lands on the <dialog> itself, not on its content
  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) dialog.close();
  });
})();
