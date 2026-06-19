(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });

        startTimer();
    }

    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));

    scopes.forEach(function (scope) {
        var input = scope.querySelector("[data-filter-input]");
        var region = scope.querySelector("[data-filter-region]");
        var type = scope.querySelector("[data-filter-type]");
        var list = document.querySelector("[data-filter-list]");

        if (!list) {
            return;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));

        if (scope.hasAttribute("data-query-sync") && input) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q) {
                input.value = q;
            }
        }

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var regionValue = region ? region.value : "";
            var typeValue = type ? type.value : "";

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-type") || "",
                    card.getAttribute("data-year") || "",
                    card.getAttribute("data-tags") || "",
                    card.textContent || ""
                ].join(" ").toLowerCase();
                var regionText = card.getAttribute("data-region") || "";
                var typeText = card.getAttribute("data-type") || "";
                var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                var regionMatch = !regionValue || regionText.indexOf(regionValue) !== -1;
                var typeMatch = !typeValue || typeText.indexOf(typeValue) !== -1;

                card.classList.toggle("hidden", !(keywordMatch && regionMatch && typeMatch));
            });
        }

        [input, region, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilter);
                control.addEventListener("change", applyFilter);
            }
        });

        applyFilter();
    });
})();
