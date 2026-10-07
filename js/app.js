(function () {
  "use strict";

  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && items.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) {
      io.observe(el);
    });
  } else {
    items.forEach(function (el) {
      el.classList.add("in");
    });
  }

  var box = document.getElementById("lightbox");
  var boxImg = document.getElementById("lightboxImg");
  var closeBtn = document.getElementById("lightboxClose");

  function openBox(src) {
    if (!box || !boxImg) {
      return;
    }
    boxImg.src = src;
    box.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeBox() {
    if (!box) {
      return;
    }
    box.hidden = true;
    boxImg.removeAttribute("src");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".shot").forEach(function (shot) {
    shot.addEventListener("click", function () {
      openBox(shot.dataset.src);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeBox);
  }
  if (box) {
    box.addEventListener("click", function (e) {
      if (e.target === box) {
        closeBox();
      }
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeBox();
    }
  });

  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");
  var submit = document.getElementById("submitBtn");

  if (form && status && submit) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "form-status";
      status.textContent = "Transmitting...";
      submit.disabled = true;

      var data = new FormData(form);
      var mailto =
        "mailto:1vxgamingcafe@gmail.com?subject=" +
        encodeURIComponent("1VX enquiry from " + (data.get("name") || "website")) +
        "&body=" +
        encodeURIComponent(
          (data.get("message") || "") +
            "\n\nName: " + (data.get("name") || "") +
            "\nEmail: " + (data.get("email") || "") +
            "\nBranch: " + (data.get("branch") || "")
        );

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data).toString()
      })
        .then(function (res) {
          if (res.status === 404) {
            throw new Error("no-backend");
          }
          return res.json().then(function (payload) {
            return { ok: res.ok, data: payload };
          });
        })
        .then(function (result) {
          if (result.ok && result.data.ok) {
            status.className = "form-status ok";
            status.textContent = "Message received. We will get back to you.";
            form.reset();
          } else {
            status.className = "form-status err";
            status.textContent = result.data.error || "Something broke. Try again.";
          }
        })
        .catch(function (err) {
          if (err && err.message === "no-backend") {
            status.className = "form-status ok";
            status.textContent = "Opening your mail app so you can send this.";
            window.location.href = mailto;
            return;
          }
          status.className = "form-status err";
          status.textContent = "Network error. Check your connection.";
        })
        .finally(function () {
          submit.disabled = false;
        });
    });
  }
})();