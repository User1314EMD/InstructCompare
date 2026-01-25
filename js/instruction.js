(function () {
  "use strict";

  var DATA_URL = "data/instructions.json";

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function showError(msg) {
    var main = document.querySelector(".instruction-page");
    if (!main) return;
    main.innerHTML =
      "<a href=\"catalog.html\" class=\"instruction-back\">← Назад в каталог</a>" +
      "<p style=\"text-align:center;color:#6b6b6b;padding:2rem;\">" + escapeHtml(msg) + "</p>";
  }

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function imageSrc(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    if (path.charAt(0) === "/") return path;
    return "/" + path;
  }

  function render(instruction) {
    document.title = instruction.airline + " — " + instruction.aircraft + " — InstructCompare";

    var img = document.getElementById("instruction-image");
    var wrap = img && img.parentElement;
    if (wrap) wrap.classList.remove("instruction-image-fallback");
    img.src = imageSrc(instruction.image);
    img.alt = "Инструкция по безопасности: " + instruction.airline + ", " + instruction.aircraft;
    img.onerror = function () { if (wrap) { wrap.classList.add("instruction-image-fallback"); img.style.display = "none"; } };

    var meta = document.getElementById("instruction-meta");
    meta.innerHTML =
      "<span>" + escapeHtml(instruction.airline) + "</span>" +
      "<span>" + escapeHtml(instruction.aircraft) + "</span>" +
      "<span>" + escapeHtml(instruction.country) + "</span>" +
      "<span>" + escapeHtml(String(instruction.year)) + "</span>";

    document.getElementById("description-text").textContent = instruction.description || "—";
    document.getElementById("analysis-text").textContent = instruction.analysis || "—";
    document.getElementById("conclusion-text").textContent = instruction.conclusion || "—";
  }

  var idParam = getQueryParam("id");
  if (!idParam) {
    showError("Не указан идентификатор инструкции. Перейдите из каталога по ссылке на карточке.");
    throw new Error("missing id");
  }

  var id = parseInt(idParam, 10);
  if (Number.isNaN(id)) {
    showError("Некорректный идентификатор инструкции.");
    throw new Error("invalid id");
  }

  fetch(DATA_URL)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var item = data.filter(function (i) { return i.id === id; })[0];
      if (!item) {
        showError("Инструкция с таким идентификатором не найдена.");
        return;
      }
      render(item);
    })
    .catch(function () {
      showError("Не удалось загрузить данные. Проверьте наличие файла data/instructions.json.");
    });
})();
