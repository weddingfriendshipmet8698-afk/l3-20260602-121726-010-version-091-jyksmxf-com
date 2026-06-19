
import { H as Hls } from './hls-vendor.js';

const navToggle = document.querySelector('[data-nav-toggle]');
const mainNav = document.querySelector('[data-main-nav]');

if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
        mainNav.classList.toggle('is-open');
    });
}

const backTop = document.querySelector('[data-back-top]');

if (backTop) {
    window.addEventListener('scroll', () => {
        backTop.classList.toggle('is-visible', window.scrollY > 420);
    });

    backTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

const hero = document.querySelector('[data-hero]');

if (hero) {
    const slides = [...hero.querySelectorAll('[data-hero-slide]')];
    const dots = [...hero.querySelectorAll('[data-hero-dots] button')];
    let current = 0;
    let timer = null;

    const showSlide = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
        dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
    };

    const start = () => {
        timer = window.setInterval(() => showSlide(current + 1), 5200);
    };

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            window.clearInterval(timer);
            showSlide(index);
            start();
        });
    });

    start();
}

const initFilterPanel = (panel) => {
    const input = panel.querySelector('[data-filter-input]');
    const year = panel.querySelector('[data-filter-year]');
    const reset = panel.querySelector('[data-filter-reset]');
    const count = panel.querySelector('[data-result-count]');
    const list = document.querySelector('[data-filter-list]');

    if (!list) {
        return;
    }

    const cards = [...list.querySelectorAll('.movie-card')];

    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    if (q && input) {
        input.value = q;
    }

    const apply = () => {
        const keyword = (input?.value || '').trim().toLowerCase();
        const yearValue = year?.value || '';
        let visible = 0;

        cards.forEach((card) => {
            const text = [
                card.dataset.title,
                card.dataset.region,
                card.dataset.genre,
                card.dataset.category,
                card.textContent,
            ].join(' ').toLowerCase();
            const matchKeyword = !keyword || text.includes(keyword);
            const matchYear = !yearValue || card.dataset.year === yearValue;
            const ok = matchKeyword && matchYear;
            card.style.display = ok ? '' : 'none';
            if (ok) {
                visible += 1;
            }
        });

        if (count) {
            count.textContent = `${visible} 部影片`;
        }
    };

    input?.addEventListener('input', apply);
    year?.addEventListener('change', apply);
    reset?.addEventListener('click', () => {
        if (input) input.value = '';
        if (year) year.value = '';
        apply();
    });

    apply();
};

document.querySelectorAll('[data-filter-panel]').forEach(initFilterPanel);

const players = document.querySelectorAll('.js-player');

players.forEach((player) => {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play]');
    const status = player.querySelector('[data-status]');
    const src = player.dataset.src;
    let initialized = false;
    let hls = null;

    const setStatus = (text) => {
        if (status) {
            status.textContent = text;
        }
    };

    const init = () => {
        if (initialized || !video || !src) {
            return;
        }

        initialized = true;
        setStatus('正在加载播放源...');

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });

            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setStatus('播放源已就绪');
            });
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (!data || !data.fatal) {
                    return;
                }

                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    setStatus('网络错误，正在重试...');
                    hls.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    setStatus('媒体错误，正在恢复...');
                    hls.recoverMediaError();
                } else {
                    setStatus('播放源加载失败');
                    hls.destroy();
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            setStatus('播放源已就绪');
        } else {
            setStatus('当前浏览器不支持 HLS 播放');
        }
    };

    const play = async () => {
        init();
        try {
            await video.play();
            player.classList.add('is-playing');
            setStatus('正在播放');
        } catch (error) {
            setStatus('请再次点击播放按钮');
        }
    };

    button?.addEventListener('click', play);
    video?.addEventListener('click', () => {
        if (video.paused) {
            play();
        } else {
            video.pause();
        }
    });
    video?.addEventListener('play', () => player.classList.add('is-playing'));
    video?.addEventListener('pause', () => player.classList.remove('is-playing'));
});
