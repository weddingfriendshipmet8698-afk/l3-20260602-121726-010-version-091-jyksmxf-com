(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var mobileNav = document.getElementById("mobileNav");

    if (toggle && mobileNav) {
        toggle.addEventListener("click", function () {
            var open = mobileNav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var current = 0;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
    }

    function initFilters() {
        var grid = document.getElementById("cardGrid");
        if (!grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
        var input = document.getElementById("pageFilter");
        var year = document.getElementById("yearFilter");
        var genre = document.getElementById("genreFilter");
        var sort = document.getElementById("sortSelect");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function normalize(value) {
            return (value || "").toString().trim().toLowerCase();
        }

        function apply() {
            var keyword = normalize(input ? input.value : "");
            var selectedYear = year ? year.value : "";
            var selectedGenre = genre ? genre.value : "";

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-title"));
                var cardYear = card.getAttribute("data-year") || "";
                var cardGenre = card.getAttribute("data-genre") || "";
                var visible = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    visible = false;
                }
                if (selectedYear && cardYear !== selectedYear) {
                    visible = false;
                }
                if (selectedGenre && cardGenre.indexOf(selectedGenre) === -1) {
                    visible = false;
                }

                card.classList.toggle("is-hidden", !visible);
            });
        }

        function reorder() {
            if (!sort) {
                return;
            }

            var mode = sort.value;
            var ordered = cards.slice();

            ordered.sort(function (a, b) {
                if (mode === "rating") {
                    return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
                }
                if (mode === "views") {
                    return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
                }
                if (mode === "year") {
                    return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
                }
                return cards.indexOf(a) - cards.indexOf(b);
            });

            ordered.forEach(function (card) {
                grid.appendChild(card);
            });
        }

        [input, year, genre].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        if (sort) {
            sort.addEventListener("change", function () {
                reorder();
                apply();
            });
        }

        reorder();
        apply();
    }

    initHero();
    initFilters();
})();
