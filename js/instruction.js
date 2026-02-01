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

  function getImageList(instruction) {
    if (instruction.images && Array.isArray(instruction.images) && instruction.images.length > 0) {
      return instruction.images;
    }
    if (instruction.image) {
      return [instruction.image];
    }
    return [];
  }

  function openLightbox(src, alt) {
    var lightbox = document.getElementById("instruction-lightbox");
    var img = document.getElementById("instruction-lightbox-image");
    if (!lightbox || !img) return;
    img.src = src;
    img.alt = alt || "Фото инструкции";
    lightbox.removeAttribute("hidden");
    lightbox.classList.add("instruction-lightbox-open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    var lightbox = document.getElementById("instruction-lightbox");
    if (!lightbox) return;
    lightbox.setAttribute("hidden", "");
    lightbox.classList.remove("instruction-lightbox-open");
    document.body.style.overflow = "";
  }

  function render(instruction) {
    document.title = instruction.airline + " — " + instruction.aircraft + " — InstructCompare";

    var gallery = document.getElementById("instruction-gallery");
    var imageList = getImageList(instruction);
    var altBase = "Инструкция по безопасности: " + instruction.airline + ", " + instruction.aircraft;

    if (gallery) {
      gallery.innerHTML = "";
      if (imageList.length === 0) {
        var empty = document.createElement("div");
        empty.className = "instruction-gallery-empty";
        empty.textContent = "Нет изображений";
        gallery.appendChild(empty);
      } else {
        imageList.forEach(function (path, index) {
          var wrap = document.createElement("div");
          wrap.className = "instruction-gallery-item";
          var img = document.createElement("img");
          img.className = "instruction-gallery-image";
          img.src = imageSrc(path);
          img.alt = imageList.length > 1 ? altBase + " — фото " + (index + 1) : altBase;
          img.loading = "lazy";
          img.onerror = function () {
            wrap.classList.add("instruction-gallery-item-fallback");
            img.style.display = "none";
          };
          wrap.appendChild(img);
          wrap.addEventListener("click", function () {
            openLightbox(imageSrc(path), img.alt);
          });
          wrap.setAttribute("role", "button");
          wrap.setAttribute("tabindex", "0");
          wrap.setAttribute("aria-label", "Увеличить фото " + (index + 1));
          wrap.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openLightbox(imageSrc(path), img.alt);
            }
          });
          gallery.appendChild(wrap);
        });
      }
    }

    var lightboxEl = document.getElementById("instruction-lightbox");
    var lightboxImg = document.getElementById("instruction-lightbox-image");
    var closeBtn = document.getElementById("instruction-lightbox-close");

    if (closeBtn) {
      closeBtn.addEventListener("click", closeLightbox);
    }
    if (lightboxEl) {
      lightboxEl.addEventListener("click", function (e) {
        if (e.target === lightboxEl || e.target.classList.contains("instruction-lightbox-content")) {
          closeLightbox();
        }
      });
      lightboxEl.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeLightbox();
      });
    }
    if (lightboxImg) {
      lightboxImg.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }

    document.addEventListener("keydown", function onEsc(e) {
      if (e.key === "Escape" && document.getElementById("instruction-lightbox").classList.contains("instruction-lightbox-open")) {
        closeLightbox();
      }
    });

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
