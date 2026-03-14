const filterOn = "filter-on";

function toggleCardList(items, btnMap) {
  const activeMap = {}
  for (const [field, buttons] of Object.entries(btnMap)) {
    let s =  new Set();
    activeMap[field] = s;
    for (const btn of buttons) {
      if (!btn.classList.contains(filterOn)) {
        s.add(btn.dataset.value);
      }
    }
  }

  for (const item of items) {
    let active = true;
    for (const [field, s] of Object.entries(activeMap)) {
      if (!s.has(item.dataset[field])) {
        active = false;
        break;
      }
    }
    if (active) {
      item.classList.remove("filtered");
    } else {
      item.classList.add("filtered");
    }
  }
}
document.querySelectorAll(".chara-filter").forEach(ele => {
  const list = document.querySelector(ele.dataset.list);
  const items = Array.from(list.querySelectorAll("tbody > tr, li"));
  const buttons = ele.querySelectorAll("button[data-field]");

  const btnMap = {}; // field -> btns
  for (const btn of buttons) {
    const field = btn.dataset.field;
    let s = btnMap[field];
    if (s === undefined) {
      s = []
      btnMap[field] = s;
    }
    s.push(btn);
  }

  for (const btn of buttons) {
    btn.addEventListener("click", () => {
      const foundIndex = btnMap[btn.dataset.field].findIndex(b => b.classList.contains(filterOn));
      if (foundIndex == -1) {
        for (const b of btnMap[btn.dataset.field]) {
          if (b.dataset.value !== btn.dataset.value) {
            b.classList.add(filterOn);
          }
        }
      } else {
        btn.classList.toggle(filterOn);
      }

      toggleCardList(items, btnMap);
    });
  }

  const resetButtons = ele.querySelectorAll("button[data-reset]");
  for (const btn of resetButtons) {
    btn.addEventListener("click", () => {
      for (const b of btnMap[btn.dataset.reset]) {
        b.classList.remove(filterOn);
      }

      toggleCardList(items, btnMap);
    });
  }
});

for (const radio of document.querySelectorAll("#collection-radio-group input[type=radio]")) {
  const targetList = Array.from(document.querySelectorAll(radio.dataset.targetList));
  const attr = radio.name;
  radio.addEventListener("change", () => {
    for (const list of targetList) {
      list.dataset[attr] = radio.value;
    }
  });
}