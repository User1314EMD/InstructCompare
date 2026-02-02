(function () {
  "use strict";

  var DATA_URL = "data/instructions.json";
  var instructions = [];
  var filtered = [];

  var grid = document.getElementById("catalog-grid");
  var empty = document.getElementById("catalog-empty");
  var catalogResults = document.getElementById("catalog-results");
  var searchInput = document.getElementById("search-input");
  var filterAirline = document.getElementById("filter-airline");
  var filterAircraft = document.getElementById("filter-aircraft");
  var filterCountry = document.getElementById("filter-country");
  var filterYear = document.getElementById("filter-year");

  function uniqueSorted(arr) {
    return Array.from(new Set(arr)).filter(Boolean).sort();
  }

  function fillSelect(el, values) {
    var opts = el.querySelectorAll("option");
    for (var i = 1; i < opts.length; i++) opts[i].remove();
    values.forEach(function (v) {
      var o = document.createElement("option");
      o.value = v;
      o.textContent = v;
      el.appendChild(o);
    });
  }

  function imageSrc(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    if (path.charAt(0) === "/") return path;
    return "/" + path;
  }

  function fillFilters() {
    fillSelect(filterAirline, uniqueSorted(instructions.map(function (i) { return i.airline; })));
    fillSelect(filterAircraft, uniqueSorted(instructions.map(function (i) { return i.aircraft; })));
    fillSelect(filterCountry, uniqueSorted(instructions.map(function (i) { return i.country; })));
    fillSelect(filterYear, uniqueSorted(instructions.map(function (i) { return String(i.year); })));
  }

  function applyFilters() {
    var airline = filterAirline.value;
    var aircraft = filterAircraft.value;
    var country = filterCountry.value;
    var year = filterYear.value;
    var q = (searchInput && searchInput.value || "").trim().toLowerCase();

    filtered = instructions.filter(function (i) {
      if (airline && i.airline !== airline) return false;
      if (aircraft && i.aircraft !== aircraft) return false;
      if (country && i.country !== country) return false;
      if (year && String(i.year) !== year) return false;
      if (q) {
        var s = [i.airline, i.aircraft, i.country, String(i.year)].join(" ").toLowerCase();
        if (s.indexOf(q) === -1) return false;
      }
      return true;
    });

    renderCards();
  }

  function updateResults() {
    if (!catalogResults) return;
    var total = instructions.length;
    var n = filtered.length;
    if (n === total) {
      catalogResults.innerHTML = "В каталоге <strong>" + total + "</strong> инструкций";
    } else {
      catalogResults.innerHTML = "Показано <strong>" + n + "</strong> из <strong>" + total + "</strong>";
    }
  }

  function renderCards() {
    grid.innerHTML = "";
    empty.style.display = filtered.length ? "none" : "block";
    updateResults();

    filtered.forEach(function (item) {
      var a = document.createElement("a");
      a.className = "card";
      a.href = "instruction.html?id=" + encodeURIComponent(item.id);

      var imgWrap = document.createElement("div");
      imgWrap.className = "card-image-wrap";
      var img = document.createElement("img");
      img.className = "card-image";

      // Поддержка как одиночного поля image, так и массива images
      var cover = item.image;
      if ((!cover || cover === "") && item.images && Array.isArray(item.images) && item.images.length > 0) {
        cover = item.images[0];
      }

      img.src = imageSrc(cover);
      img.alt = item.airline + " — " + item.aircraft;
      img.loading = "lazy";
      img.onerror = function () { imgWrap.classList.add("card-image-fallback"); };
      imgWrap.appendChild(img);

      var body = document.createElement("div");
      body.className = "card-body";
      var title = document.createElement("h2");
      title.className = "card-title";
      title.textContent = item.airline;
      var meta = document.createElement("p");
      meta.className = "card-meta";
      meta.innerHTML = "<span>" + escapeHtml(item.aircraft) + "</span><span>" + escapeHtml(item.country) + "</span><span>" + escapeHtml(String(item.year)) + "</span>";
      body.appendChild(title);
      body.appendChild(meta);

      a.appendChild(imgWrap);
      a.appendChild(body);
      grid.appendChild(a);
    });
  }

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function onFilterChange() { applyFilters(); }

  if (filterAirline) filterAirline.addEventListener("change", onFilterChange);
  if (filterAircraft) filterAircraft.addEventListener("change", onFilterChange);
  if (filterCountry) filterCountry.addEventListener("change", onFilterChange);
  if (filterYear) filterYear.addEventListener("change", onFilterChange);
  if (searchInput) searchInput.addEventListener("input", onFilterChange);

  fetch(DATA_URL)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      instructions = data;
      fillFilters();
      filtered = instructions.slice();
      renderCards();
    })
    .catch(function () {
      grid.innerHTML = "<p class=\"catalog-empty\">Не удалось загрузить данные. Проверьте наличие файла data/instructions.json.</p>";
      if (catalogResults) catalogResults.textContent = "";
    });
})();
