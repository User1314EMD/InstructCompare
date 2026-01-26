(function () {
  "use strict";

  var CLIENT_ID_KEY = "instructcompare_clientid";
  var SEED = [4, 5, 4, 3, 5, 4, 4, 5, 3, 4];

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function init() {
    var instructionId = getQueryParam("id");
    if (!instructionId) {
      console.warn("instruction-rating: no instructionId in URL");
      return;
    }

    var buttons = document.getElementById("instruction-rating-buttons");
    var avgEl = document.getElementById("instruction-rating-avg");
    var totalEl = document.getElementById("instruction-rating-total");
    var yoursEl = document.getElementById("instruction-rating-yours");

    if (!buttons || !avgEl || !totalEl || !yoursEl) {
      console.warn("instruction-rating: elements not found", { buttons: !!buttons, avgEl: !!avgEl, totalEl: !!totalEl, yoursEl: !!yoursEl });
      return;
    }

    var db = null;
    var useFirebase = false;

    function initFirebase() {
      if (typeof FIREBASE_CONFIG !== "undefined" && FIREBASE_CONFIG && FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY" && FIREBASE_CONFIG.projectId && FIREBASE_CONFIG.projectId !== "your-project-id") {
        try {
          if (typeof firebase !== "undefined" && firebase.firestore) {
            try {
              firebase.initializeApp(FIREBASE_CONFIG);
            } catch (e) {
              if (e.code !== "app/duplicate-app") throw e;
            }
            db = firebase.firestore();
            useFirebase = true;
            return true;
          }
        } catch (e) {
          console.warn("instruction-rating: Firebase init error", e);
          useFirebase = false;
        }
      }
      return false;
    }

    function getClientId() {
      var id = localStorage.getItem(CLIENT_ID_KEY);
      if (!id) {
        id = "x" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 12);
        localStorage.setItem(CLIENT_ID_KEY, id);
      }
      return id;
    }

    function plural(n) {
      if (n === 1) return "1 оценка";
      if (n >= 2 && n <= 4) return n + " оценки";
      return n + " оценок";
    }

    function renderUI(avg, total, user) {
      avgEl.textContent = total > 0 ? avg.toFixed(1) : "—";
      totalEl.textContent = plural(total);
      yoursEl.textContent = user != null ? "Ваша оценка: " + user : "";
      yoursEl.style.display = user != null ? "inline" : "none";
      var btns = buttons && buttons.querySelectorAll(".rating-btn-small");
      if (btns) {
        btns.forEach(function (btn) {
          var v = parseInt(btn.getAttribute("data-value"), 10);
          btn.classList.toggle("rating-btn-active", user === v);
        });
      }
    }

    function getLocalUser() {
      var key = "instructcompare_rating_" + instructionId;
      var v = localStorage.getItem(key);
      if (v == null) return null;
      var n = parseInt(v, 10);
      return n >= 1 && n <= 5 ? n : null;
    }

    function getLocalVotes() {
      var u = getLocalUser();
      return u != null ? SEED.concat([u]) : SEED;
    }

    function onVoteLocal(val) {
      var key = "instructcompare_rating_" + instructionId;
      localStorage.setItem(key, String(val));
      var u = getLocalUser();
      var votes = u != null ? SEED.concat([u]) : SEED;
      var sum = votes.reduce(function (a, b) { return a + b; }, 0);
      renderUI(sum / votes.length, votes.length, val);
    }

    var statsRef = null;
    var votesRef = null;

    function loadFromFirebase(cb) {
      if (!db || !statsRef) { if (cb) cb(0, 0, null); return; }
      Promise.all([statsRef.get(), votesRef().get()])
        .then(function (res) {
          var sum = 0, count = 0, user = null;
          if (res[0].exists) { var d = res[0].data(); sum = d.sum || 0; count = d.count || 0; }
          if (res[1].exists) user = res[1].data().value;
          if (cb) cb(sum, count, user);
        })
        .catch(function () { if (cb) cb(0, 0, null); });
    }

    function onVoteFirebase(val) {
      if (!db) return;
      var clientId = getClientId();
      var stats = db.collection("instructionStats").doc(instructionId);
      var vote = db.collection("instructionVotes").doc(clientId + "_" + instructionId);

      db.runTransaction(function (transaction) {
        return transaction.get(stats).then(function (statsSnap) {
          var sum = 0, count = 0;
          if (statsSnap.exists) { sum = statsSnap.data().sum || 0; count = statsSnap.data().count || 0; }
          return transaction.get(vote).then(function (voteSnap) {
            var oldVal = voteSnap.exists ? voteSnap.data().value : null;
            var newSum, newCount;
            if (oldVal != null) { newSum = sum - oldVal + val; newCount = count; }
            else { newSum = sum + val; newCount = count + 1; }
            transaction.set(stats, { sum: newSum, count: newCount });
            transaction.set(vote, { value: val });
          });
        });
      }).then(function () {
        loadFromFirebase(function (sum, count, user) {
          renderUI(count > 0 ? sum / count : 0, count, user);
        });
      }).catch(function () {
        loadFromFirebase(function (sum, count, user) {
          renderUI(count > 0 ? sum / count : 0, count, user);
        });
      });
    }

    function onVote(val) {
      if (val < 1 || val > 5) return;
      if (useFirebase && db) onVoteFirebase(val);
      else onVoteLocal(val);
    }

    function startRating() {
      if (useFirebase && db) {
        statsRef = db.collection("instructionStats").doc(instructionId);
        votesRef = function () { return db.collection("instructionVotes").doc(getClientId() + "_" + instructionId); };
        avgEl.textContent = "…";
        loadFromFirebase(function (sum, count, user) {
          renderUI(count > 0 ? sum / count : 0, count, user);
        });
      } else {
        var votes = getLocalVotes();
        var sum = votes.reduce(function (a, b) { return a + b; }, 0);
        renderUI(sum / votes.length, votes.length, getLocalUser());
      }

      if (buttons) {
        buttons.addEventListener("click", function (e) {
          var btn = e.target.closest(".rating-btn-small");
          if (!btn) return;
          var v = parseInt(btn.getAttribute("data-value"), 10);
          if (v >= 1 && v <= 5) {
            onVote(v);
          }
        });
      }
    }

    if (typeof firebase !== "undefined") {
      initFirebase();
      startRating();
    } else {
      var checkFirebase = setInterval(function () {
        if (typeof firebase !== "undefined") {
          clearInterval(checkFirebase);
          initFirebase();
          startRating();
        }
      }, 100);
      setTimeout(function () {
        clearInterval(checkFirebase);
        if (!useFirebase) {
          startRating();
        }
      }, 5000);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
