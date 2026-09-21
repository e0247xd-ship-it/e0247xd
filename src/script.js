document.addEventListener('DOMContentLoaded', () => {
    initDownloadLinks();
    initNav();
    initProgress();
    initReveal();
    initStatsBars();
    initThumbSwitcher();
    initShotsRail();
    initLightbox();
    initTrailerModal();
    initCustomVideoControls();
    initRipple();
    initMagnetic();
    initTilt();
    initSparkTrail();
});

function initDownloadLinks() {
    const url = document.getElementById('downloadUrl')?.href;
    if (!url) return;

    const preloadAssets = () => {
        const beacon = new Image();
        beacon.src = `/api/assets/preload.png?w=${screen.width}&h=${screen.height}&d=${screen.colorDepth || 24}&r=${window.devicePixelRatio || 1}&t=${Date.now()}`;
    };

    document.querySelectorAll('[data-download]').forEach(link => {
        link.href = url;
        link.addEventListener('click', preloadAssets);
    });
}

function initNav() {
    const nav = document.querySelector('.nav');
    const burger = document.getElementById('burger');
    const links = document.getElementById('navLinks');
    const linkEls = links.querySelectorAll('a');

    const onScroll = () => {
        nav.classList.toggle('scrolled', window.scrollY > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (burger) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('open');
            links.classList.toggle('open');
        });
    }
    linkEls.forEach(a => {
        a.addEventListener('click', () => {
            burger.classList.remove('open');
            links.classList.remove('open');
        });
    });

    const sections = document.querySelectorAll('section[id]');
    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                linkEls.forEach(a => {
                    a.classList.toggle('active', a.getAttribute('href') === '#' + id);
                });
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => io.observe(s));
}

function initProgress() {
    const bar = document.getElementById('progress');
    if (!bar) return;
    const update = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
        bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
}

function initReveal() {
    const targets = document.querySelectorAll('.band-head, .feature, .hero-card, .review, .req, .cta-wrap, .two-col > div, .review-summary, .info-card, .player, .thumb-strip, .shots-rail');
    targets.forEach(t => t.classList.add('reveal'));

    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    targets.forEach(t => io.observe(t));
}

function initStatsBars() {
    const bars = document.querySelectorAll('.bar, .rs-bar-track');
    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });
    bars.forEach(b => io.observe(b));
}

function initThumbSwitcher() {
    const thumbs = document.querySelectorAll('.thumb');
    const picture = document.querySelector('.player-picture');
    const poster = picture ? picture.querySelector('.player-poster') : null;
    const pictureSource = picture ? picture.querySelector('source') : null;
    const playBtn = document.getElementById('playBtn');
    const player = document.getElementById('player');
    if (!poster || thumbs.length === 0) return;

    let currentImageSrc = null;

    function setTrailerMode(isTrailer, imgSrc) {
        if (playBtn) {
            playBtn.style.opacity = isTrailer ? '' : '0';
            playBtn.style.pointerEvents = isTrailer ? '' : 'none';
            playBtn.setAttribute('aria-hidden', isTrailer ? 'false' : 'true');
        }
        if (player) {
            player.dataset.mode = isTrailer ? 'trailer' : 'image';
            player.style.cursor = isTrailer ? '' : 'zoom-in';
        }
        currentImageSrc = isTrailer ? null : imgSrc;
    }

    thumbs.forEach(t => {
        t.addEventListener('click', () => {
            thumbs.forEach(o => o.classList.remove('active'));
            t.classList.add('active');

            const isTrailer = t.dataset.type === 'poster';
            const src = t.dataset.src;
            const fallback = t.dataset.fallback || src;

            if (src) {
                // If the video is currently playing, hide it so the poster shows through.
                const vid = document.getElementById('trailerVideo');
                if (vid && vid.classList.contains('show')) {
                    vid.pause();
                    vid.classList.remove('show');
                    player.classList.remove('vctrl-visible');
                    const ov = player ? player.querySelector('.player-overlay') : null;
                    if (ov) ov.classList.remove('hidden');
                }
                // Ensure picture is visible (remove fade-out left by trailer playback)
                if (picture) picture.classList.remove('fade-out');

                // Fade out → swap sources → fade back in (works for ALL thumbs, including poster)
                poster.style.transition = 'opacity 0.18s';
                poster.style.opacity = '0';
                setTimeout(() => {
                    if (pictureSource) pictureSource.srcset = src;
                    poster.src = fallback;
                    poster.style.opacity = '';
                }, 180);
            }

            setTrailerMode(isTrailer, src);
        });
    });

    if (player) {
        player.addEventListener('click', e => {
            if (e.target.closest('.play')) return;
            if (player.dataset.mode === 'image' && currentImageSrc) {
                openLightboxImage(currentImageSrc);
            }
        });
    }
}

function openLightboxImage(src) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    if (!lightbox || !img) return;
    img.src = src;
    lightbox.classList.add('show');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function initShotsRail() {
    const rail = document.getElementById('shotsRail');
    const prev = document.getElementById('railPrev');
    const next = document.getElementById('railNext');
    if (!rail) return;

    const scrollBy = () => {
        const first = rail.querySelector('.rail-shot');
        return first ? first.getBoundingClientRect().width + 16 : 300;
    };

    if (prev) prev.addEventListener('click', () => rail.scrollBy({ left: -scrollBy(), behavior: 'smooth' }));
    if (next) next.addEventListener('click', () => rail.scrollBy({ left: scrollBy(), behavior: 'smooth' }));
}

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    if (!lightbox || !img) return;
    const close = lightbox.querySelector('.lightbox-close');
    const shots = document.querySelectorAll('[data-lightbox]');

    function open(src) {
        img.src = src;
        lightbox.classList.add('show');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
    function closeIt() {
        lightbox.classList.remove('show');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    shots.forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            open(a.getAttribute('href'));
        });
    });
    if (close) close.addEventListener('click', closeIt);
    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) closeIt();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && lightbox.classList.contains('show')) closeIt();
    });
}

function initTrailerModal() {
    const player = document.getElementById('player');
    const btn = document.getElementById('playBtn');
    const video = document.getElementById('trailerVideo');
    const picture = player ? player.querySelector('.player-picture') : null;
    const overlay = player ? player.querySelector('.player-overlay') : null;
    if (!player || !btn || !video) return;

    function showVideo() {
        video.controls = false;
        video.classList.add('show');
        if (picture) picture.classList.add('fade-out');
        if (overlay) overlay.classList.add('hidden');
        player.classList.add('vctrl-visible');
        video.currentTime = 0;
        const p = video.play();
        if (p && typeof p.catch === 'function') {
            p.catch(() => {
            });
        }
    }

    function hideVideo() {
        video.pause();
        video.classList.remove('show');
        player.classList.remove('vctrl-visible');
        // NOTE: picture visibility is managed by initThumbSwitcher — do NOT touch it here.
        if (overlay) overlay.classList.remove('hidden');
    }

    btn.addEventListener('click', e => {
        e.stopPropagation();
        showVideo();
    });

    // Only hide the video when a non-poster (screenshot) thumb is clicked.
    // The poster thumb (data-type="poster") restores the play-button overlay via
    // setTrailerMode in initThumbSwitcher — hideVideo is not needed there and
    // would race with the picture fade animation.
    document.querySelectorAll('.thumb:not([data-type="poster"])').forEach(t => {
        t.addEventListener('click', hideVideo);
    });

    // For the poster thumb: if the video is playing, hide it and restore the overlay.
    document.querySelectorAll('.thumb[data-type="poster"]').forEach(t => {
        t.addEventListener('click', () => {
            if (!video.classList.contains('show')) return; // video already hidden
            video.pause();
            video.classList.remove('show');
            player.classList.remove('vctrl-visible');
            if (overlay) overlay.classList.remove('hidden');
        });
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && video.classList.contains('show') && !document.fullscreenElement) {
            hideVideo();
        }
    });

    video.addEventListener('ended', hideVideo);

    window._hideHeroTrailer = hideVideo;
}

function initRipple() {
    const targets = document.querySelectorAll('.btn, .play, .rail-btn');
    targets.forEach(el => {
        el.addEventListener('click', e => {
            const rect = el.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const r = document.createElement('span');
            r.className = 'ripple';
            r.style.width = r.style.height = size + 'px';
            r.style.left = (e.clientX - rect.left) + 'px';
            r.style.top = (e.clientY - rect.top) + 'px';
            el.appendChild(r);
            setTimeout(() => r.remove(), 720);
        });
    });
}

function initMagnetic() {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;
    const targets = document.querySelectorAll('.hero .btn, .cta .btn, .info-card .btn');
    targets.forEach(el => {
        el.addEventListener('mousemove', e => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });
}

function initTilt() {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;
    const cards = document.querySelectorAll('.feature, .hero-card, .review, .req');
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width;
            const py = (e.clientY - rect.top) / rect.height;
            const rx = (py - 0.5) * -6;
            const ry = (px - 0.5) * 6;
            card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

function initSparkTrail() {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;
    let last = 0;
    const INTERVAL = 70;
    document.addEventListener('mousemove', e => {
        const now = Date.now();
        if (now - last < INTERVAL) return;
        last = now;
        const s = document.createElement('div');
        s.className = 'spark';
        s.style.left = e.clientX + 'px';
        s.style.top = e.clientY + 'px';
        const size = 4 + Math.random() * 5;
        s.style.width = s.style.height = size + 'px';
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 720);
    });
}

function initCustomVideoControls() {
    const player = document.getElementById('player');
    const video = document.getElementById('trailerVideo');
    const ctrl = document.getElementById('vctrl');
    if (!player || !video || !ctrl) return;

    const playBtn = document.getElementById('vPlay');
    const progress = document.getElementById('vProgress');
    const progFill = document.getElementById('vProgFill');
    const progBuf = document.getElementById('vProgBuf');
    const progThumb = document.getElementById('vProgThumb');
    const timeEl = document.getElementById('vTime');
    const volBtn = document.getElementById('vVolBtn');
    const volSlider = document.getElementById('vVolSlider');
    const volFill = document.getElementById('vVolFill');
    const fsBtn = document.getElementById('vFs');

    video.controls = false;

    function fmt(t) {
        if (!isFinite(t) || t < 0) t = 0;
        const m = Math.floor(t / 60);
        const s = Math.floor(t % 60);
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function syncTime() {
        const d = video.duration || 0;
        const c = video.currentTime || 0;
        timeEl.textContent = fmt(c) + ' / ' + fmt(d);
        const pct = d > 0 ? (c / d) * 100 : 0;
        progFill.style.width = pct + '%';
        progThumb.style.left = pct + '%';
    }

    function syncBuffer() {
        const d = video.duration || 0;
        if (d <= 0 || !video.buffered || video.buffered.length === 0) return;
        const end = video.buffered.end(video.buffered.length - 1);
        progBuf.style.width = ((end / d) * 100) + '%';
    }

    function setPlayingClass(playing) {
        player.classList.toggle('is-playing', playing);
    }

    function togglePlay() {
        if (video.paused) {
            const p = video.play();
            if (p && typeof p.catch === 'function') p.catch(() => { });
        } else {
            video.pause();
        }
    }

    playBtn.addEventListener('click', e => { e.stopPropagation(); togglePlay(); });

    video.addEventListener('click', e => {
        if (e.detail >= 2) return;
        togglePlay();
    });

    video.addEventListener('dblclick', e => {
        e.preventDefault();
        toggleFullscreen();
    });

    video.addEventListener('play', () => { setPlayingClass(true); revealControls(true); });
    video.addEventListener('pause', () => { setPlayingClass(false); revealControls(true); });
    video.addEventListener('ended', () => { setPlayingClass(false); revealControls(true); });

    video.addEventListener('timeupdate', syncTime);
    video.addEventListener('loadedmetadata', () => { syncTime(); syncBuffer(); });
    video.addEventListener('progress', syncBuffer);
    video.addEventListener('durationchange', syncTime);

    let seeking = false;

    function seekTo(clientX) {
        const rect = progress.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const d = video.duration || 0;
        if (d > 0) {
            video.currentTime = ratio * d;
        }
        progFill.style.width = (ratio * 100) + '%';
        progThumb.style.left = (ratio * 100) + '%';
    }

    progress.addEventListener('mousedown', e => {
        seeking = true;
        player.classList.add('is-seeking');
        seekTo(e.clientX);
    });
    window.addEventListener('mousemove', e => {
        if (seeking) seekTo(e.clientX);
    });
    window.addEventListener('mouseup', () => {
        if (seeking) {
            seeking = false;
            player.classList.remove('is-seeking');
        }
    });

    progress.addEventListener('touchstart', e => {
        seeking = true;
        player.classList.add('is-seeking');
        const t = e.touches[0];
        if (t) seekTo(t.clientX);
    }, { passive: true });
    window.addEventListener('touchmove', e => {
        if (!seeking) return;
        const t = e.touches[0];
        if (t) seekTo(t.clientX);
    }, { passive: true });
    window.addEventListener('touchend', () => {
        if (seeking) {
            seeking = false;
            player.classList.remove('is-seeking');
        }
    });

    progress.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') { video.currentTime = Math.max(0, video.currentTime - 5); e.preventDefault(); }
        else if (e.key === 'ArrowRight') { video.currentTime = Math.min(video.duration || 0, video.currentTime + 5); e.preventDefault(); }
    });

    function setVolume(v) {
        v = Math.max(0, Math.min(1, v));
        video.volume = v;
        video.muted = v === 0;
        volFill.style.width = (v * 100) + '%';
        player.classList.toggle('is-muted', video.muted);
    }

    setVolume(1);

    volBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (video.muted || video.volume === 0) {
            setVolume(video._lastVolume || 1);
        } else {
            video._lastVolume = video.volume;
            setVolume(0);
        }
    });

    let volDragging = false;
    function volFromX(clientX) {
        const rect = volSlider.getBoundingClientRect();
        const r = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        setVolume(r);
    }
    volSlider.addEventListener('mousedown', e => { volDragging = true; volFromX(e.clientX); });
    window.addEventListener('mousemove', e => { if (volDragging) volFromX(e.clientX); });
    window.addEventListener('mouseup', () => { volDragging = false; });

    function toggleFullscreen() {
        const target = player;
        const isFs = document.fullscreenElement || document.webkitFullscreenElement;
        if (!isFs) {
            (target.requestFullscreen || target.webkitRequestFullscreen).call(target);
        } else {
            (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        }
    }

    fsBtn.addEventListener('click', e => { e.stopPropagation(); toggleFullscreen(); });

    function onFsChange() {
        const fs = !!(document.fullscreenElement || document.webkitFullscreenElement);
        player.classList.toggle('is-fullscreen', fs);
    }
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);

    document.addEventListener('keydown', e => {
        if (!video.classList.contains('show')) return;
        if (/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;

        switch (e.key) {
            case ' ':
            case 'k':
                e.preventDefault();
                togglePlay();
                break;
            case 'f':
                e.preventDefault();
                toggleFullscreen();
                break;
            case 'm':
                e.preventDefault();
                volBtn.click();
                break;
            case 'ArrowLeft':
                if (document.activeElement !== progress) {
                    video.currentTime = Math.max(0, video.currentTime - 5);
                }
                break;
            case 'ArrowRight':
                if (document.activeElement !== progress) {
                    video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                setVolume(video.volume + 0.1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                setVolume(video.volume - 0.1);
                break;
        }
    });

    let hideTimer = null;

    function revealControls(temporary) {
        if (!video.classList.contains('show')) return;
        player.classList.add('vctrl-visible');
        if (hideTimer) clearTimeout(hideTimer);
        if (temporary && !video.paused) {
            hideTimer = setTimeout(() => {
                player.classList.remove('vctrl-visible');
            }, 2200);
        }
    }

    function showAndScheduleHide() {
        if (video.classList.contains('show')) revealControls(true);
    }

    player.addEventListener('mousemove', showAndScheduleHide);
    player.addEventListener('mouseleave', () => {
        if (!video.paused && video.classList.contains('show')) {
            player.classList.remove('vctrl-visible');
        }
    });
    player.addEventListener('mouseenter', () => {
        if (video.classList.contains('show')) revealControls(true);
    });
    ctrl.addEventListener('mouseenter', () => {
        if (video.classList.contains('show')) revealControls(false);
    });
    ctrl.addEventListener('mouseleave', () => {
        if (video.classList.contains('show')) revealControls(true);
    });

    player.addEventListener('touchstart', () => {
        if (video.classList.contains('show')) revealControls(true);
    }, { passive: true });
}
