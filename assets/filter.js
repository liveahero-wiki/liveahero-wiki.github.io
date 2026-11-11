// List filters, used by /charas/, /statuses/ and the unexplored guide.
//
// <fieldset class="chara-filter" data-list="#list"> holds button groups:
//   <button data-field="rarity" data-value="3"> narrows the list to items with data-rarity="3"
//   (pressing more buttons of the same group widens it again), <button data-reset="rarity"> shows
//   all of them. Buttons excluded from the list get the "filter-on" class.
// <input data-filter-text data-list="#a, #b"> is a name search over one or more lists; it matches
//   the item's data-name (or its text), ignoring case, accents, spaces and punctuation.
// Hidden items get the "filtered" class, and each list fires a bubbling "listfilter" event after.
(function () {
  const filterOn = "filter-on";
  const states = new Map(); // list -> { items, groups: [{ field: [buttons] }], text }
  const keys = new WeakMap(); // item -> normalized search text

  function normalize(text) {
    return text.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
  }

  function searchKey(item) {
    let key = keys.get(item);
    if (key === undefined) {
      key = normalize(item.dataset.name ?? item.textContent);
      keys.set(item, key);
    }
    return key;
  }

  function stateOf(list) {
    let state = states.get(list);
    if (!state) {
      state = { items: Array.from(list.querySelectorAll("tbody > tr, li")), groups: [], text: "" };
      states.set(list, state);
    }
    return state;
  }

  function apply(list) {
    const state = stateOf(list);
    const active = []; // [field, allowed values] for the groups that narrow the list
    for (const group of state.groups) {
      for (const [field, buttons] of Object.entries(group)) {
        if (buttons.some(b => b.classList.contains(filterOn))) {
          active.push([field, new Set(buttons.filter(b => !b.classList.contains(filterOn)).map(b => b.dataset.value))]);
        }
      }
    }

    for (const item of state.items) {
      const shown = active.every(([field, allowed]) => allowed.has(item.dataset[field]))
        && (!state.text || searchKey(item).includes(state.text));
      item.classList.toggle("filtered", !shown);
    }
    list.dispatchEvent(new CustomEvent("listfilter", { bubbles: true }));
  }

  // aria-pressed marks the values a group is narrowed to; "All" is pressed when it is not narrowed
  function renderGroup(buttons, resetButtons) {
    const narrowed = buttons.some(b => b.classList.contains(filterOn));
    for (const b of buttons) b.setAttribute("aria-pressed", narrowed && !b.classList.contains(filterOn));
    for (const b of resetButtons) b.setAttribute("aria-pressed", !narrowed);
  }

  document.querySelectorAll(".chara-filter").forEach(ele => {
    const list = document.querySelector(ele.dataset.list);
    const group = {}; // field -> buttons
    for (const btn of ele.querySelectorAll("button[data-field]")) {
      (group[btn.dataset.field] ??= []).push(btn);
    }
    stateOf(list).groups.push(group);

    const resetsOf = field => Array.from(ele.querySelectorAll("button[data-reset]")).filter(b => b.dataset.reset == field);
    for (const [field, buttons] of Object.entries(group)) {
      renderGroup(buttons, resetsOf(field));

      for (const btn of buttons) {
        btn.addEventListener("click", () => {
          if (!buttons.some(b => b.classList.contains(filterOn))) {
            // first pick in a group: show only this value
            for (const b of buttons) b.classList.toggle(filterOn, b !== btn);
          } else {
            btn.classList.toggle(filterOn);
            // unpicking the last value goes back to showing everything
            if (buttons.every(b => b.classList.contains(filterOn))) {
              for (const b of buttons) b.classList.remove(filterOn);
            }
          }
          renderGroup(buttons, resetsOf(field));
          apply(list);
        });
      }
    }

    for (const btn of ele.querySelectorAll("button[data-reset]")) {
      btn.addEventListener("click", () => {
        const buttons = group[btn.dataset.reset];
        for (const b of buttons) b.classList.remove(filterOn);
        renderGroup(buttons, resetsOf(btn.dataset.reset));
        apply(list);
      });
    }
  });

  document.querySelectorAll("input[data-filter-text]").forEach(input => {
    const lists = Array.from(document.querySelectorAll(input.dataset.list));
    const update = () => {
      const text = normalize(input.value);
      for (const list of lists) {
        const state = stateOf(list);
        if (state.text === text) continue;
        state.text = text;
        apply(list);
      }
    };
    input.addEventListener("input", update);
    input.addEventListener("keydown", e => {
      if (e.key == "Escape" && input.value) {
        e.preventDefault();
        input.value = "";
        update();
      }
    });
    update(); // the browser may restore a typed search on back navigation
  });
})();
