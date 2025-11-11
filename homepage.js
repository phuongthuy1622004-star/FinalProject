document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] DOM loaded - initializing slider")

  // ===================================================================
  // 0. Hero Video: ensure reliable autoplay with fallback
  // ===================================================================
  try {
    const heroVideo = document.querySelector('.hero-video')
    if (heroVideo) {
      heroVideo.muted = true
      heroVideo.setAttribute('playsinline', '')
      const attemptPlay = () => {
        const p = heroVideo.play()
        if (p && typeof p.then === 'function') {
          p.catch(err => {
            console.warn('[v0] Hero video autoplay blocked, waiting for user gesture:', err)
            const resume = () => {
              heroVideo.play().catch(e => console.warn('[v0] Resume play failed:', e))
              document.removeEventListener('pointerdown', resume)
            }
            document.addEventListener('pointerdown', resume, { once: true })
          })
        }
      }
      if (heroVideo.readyState >= 2) {
        attemptPlay()
      } else {
        heroVideo.addEventListener('canplay', attemptPlay, { once: true })
        // Explicitly trigger load to help some browsers
        try { heroVideo.load() } catch {}
      }
    }
  } catch (e) {
    console.warn('[v0] Hero video init error:', e)
  }

  // ===================================================================
  // 1. Mobile Navigation (Hamburger Menu)
  // ===================================================================
  const mainNavList = document.querySelector(".main-nav ul")
  if (mainNavList) {
    const headerContainer = document.querySelector(".site-header .container")
    const hamburgerBtn = document.createElement("button")
    const mobileNav = document.createElement("nav")
    const overlay = document.createElement("div")

    hamburgerBtn.innerHTML = "&#9776;"
    hamburgerBtn.classList.add("hamburger-btn")
    hamburgerBtn.setAttribute("aria-label", "Open navigation menu")
    if (headerContainer) headerContainer.appendChild(hamburgerBtn)

    mobileNav.classList.add("mobile-nav")
    mobileNav.innerHTML = `<ul>${mainNavList.innerHTML}</ul>`
    document.body.appendChild(mobileNav)

    overlay.classList.add("mobile-nav-overlay")
    document.body.appendChild(overlay)

    const toggleMenu = () => {
      const isOpen = mobileNav.classList.toggle("open")
      hamburgerBtn.classList.toggle("active")
      overlay.classList.toggle("open")
      document.body.classList.toggle("nav-open", isOpen)
      hamburgerBtn.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu")
    }

    hamburgerBtn.addEventListener("click", toggleMenu)
    overlay.addEventListener("click", toggleMenu)
  }

  // ===================================================================
  // 2. Hero Banner Slider
  // ===================================================================
  function initializeSlider(sliderElement) {
    console.log("[v0] Initializing slider:", sliderElement)

    const slides = sliderElement.querySelectorAll(".slides .slide")
    const nextBtn = sliderElement.querySelector(".next-slide")
    const prevBtn = sliderElement.querySelector(".prev-slide")
    const dotsContainer = sliderElement.querySelector(".slider-dots")

    console.log("[v0] Found slides:", slides.length)

    if (!slides || slides.length <= 1) {
      console.log("[v0] Slider has 1 or no slides, hiding controls")
      if (nextBtn) nextBtn.style.display = "none"
      if (prevBtn) prevBtn.style.display = "none"
      if (dotsContainer) dotsContainer.style.display = "none"
      if (slides.length === 1) {
        slides[0].classList.add("active")
        console.log("[v0] Single slide activated")
      }
      return
    }

    let currentSlide = 0
    let isAnimating = false
    let slideInterval
    const animationDuration = 1000

    const updateDots = () => {
      if (!dots.length) return
      dots.forEach((dot) => dot.classList.remove("active"))
      if (dots[currentSlide]) dots[currentSlide].classList.add("active")
    }

    const goToSlide = (n) => {
      if (isAnimating || n === currentSlide) return
      isAnimating = true

      const outgoingSlide = slides[currentSlide]
      const incomingSlide = slides[n]

      console.log("[v0] Transitioning from slide", currentSlide, "to", n)

      incomingSlide.classList.add("active")
      outgoingSlide.classList.remove("active")

      currentSlide = n
      updateDots()

      setTimeout(() => {
        isAnimating = false
      }, animationDuration)
    }

    const changeSlide = (direction) => {
      const nextSlideIndex = (currentSlide + direction + slides.length) % slides.length
      goToSlide(nextSlideIndex)
    }

    let dots = []
    if (dotsContainer) {
      slides.forEach((_, i) => {
        const dot = document.createElement("button")
        dot.classList.add("dot")
        dot.setAttribute("aria-label", `Go to slide ${i + 1}`)
        dot.addEventListener("click", () => {
          goToSlide(i)
          resetInterval()
        })
        dotsContainer.appendChild(dot)
      })
      dots = sliderElement.querySelectorAll(".slider-dots .dot")
      console.log("[v0] Created", dots.length, "dots")
    }

    const startInterval = () => {
      const autoplaySpeed = sliderElement.classList.contains("cta-banner-section") ? 6000 : 5000
      slideInterval = setInterval(() => changeSlide(1), autoplaySpeed)
    }

    const resetInterval = () => {
      clearInterval(slideInterval)
      startInterval()
    }

    if (nextBtn && prevBtn) {
      nextBtn.addEventListener("click", () => {
        changeSlide(1)
        resetInterval()
      })
      prevBtn.addEventListener("click", () => {
        changeSlide(-1)
        resetInterval()
      })
    }

    slides[currentSlide].classList.add("active")
    console.log("[v0] Activated initial slide:", currentSlide)
    updateDots()
    startInterval()
  }

  // Find and initialize all sliders
  const sliders = document.querySelectorAll(".slider-component")
  console.log("[v0] Found", sliders.length, "slider components")
  sliders.forEach((slider) => {
    initializeSlider(slider)
  })

  // ===================================================================
  // 2b. Video Hero: rotate overlay messages with fade-in animation
  // ===================================================================
  const heroMessagesRoot = document.querySelector(".video-hero .hero-messages")
  if (heroMessagesRoot) {
    const messages = heroMessagesRoot.querySelectorAll(".hero-message")
    let current = 0

    // Ensure only the first message is visible initially
    messages.forEach((m, i) => m.classList.toggle("active", i === 0))

    const cycle = () => {
      if (!messages.length) return
      messages[current].classList.remove("active")
      current = (current + 1) % messages.length
      messages[current].classList.add("active")
    }

    // Switch message every 5 seconds
    setInterval(cycle, 5000)
  }

  // ===================================================================
  // 3. Scroll Reveal Animation
  // ===================================================================
  const revealElements = document.querySelectorAll(
    ".service-item, .product-card, .story-content, .story-image, .instagram-item",
  )

  if (!!window.IntersectionObserver) {
    revealElements.forEach((el) => el.classList.add("reveal-on-scroll"))

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible")
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
      },
    )

    revealElements.forEach((el) => {
      revealObserver.observe(el)
    })
  }

  // ===================================================================
  // 4. Form & Button Interactions
  // ===================================================================

  const newsletterForm = document.querySelector(".newsletter-form-fitmeal")
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault()
      const emailInput = this.querySelector('input[type="email"]')
      const submitButton = this.querySelector('button[type="submit"]')

      if (emailInput.value && /^\S+@\S+\.\S+$/.test(emailInput.value)) {
        submitButton.textContent = "Đã đăng ký!"
        submitButton.disabled = true
        emailInput.value = ""

        setTimeout(() => {
          submitButton.textContent = "Đăng ký nhận tin"
          submitButton.disabled = false
        }, 3000)
      } else {
        alert("Vui lòng nhập một địa chỉ email hợp lệ.")
      }
    })
  }

  const addToCartButtons = document.querySelectorAll(".add-to-cart-btn")
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", function () {
      if (this.classList.contains("added")) return

      this.textContent = "Đã thêm!"
      this.classList.add("added")

      setTimeout(() => {
        this.textContent = "Thêm vào giỏ"
        this.classList.remove("added")
      }, 2000)
    })
  })

  console.log("[v0] All initialization complete")

  // ===================================================================
  // 7. Instagram Story Slider (auto switch every 3s)
  // ===================================================================
  try {
    const slidesRoot = document.querySelector('.story-slides')
    if (slidesRoot) {
      const slides = slidesRoot.querySelectorAll('.story-slide')
      let index = 0

      const show = (i) => {
        slides.forEach((s, idx) => {
          if (idx === i) s.classList.add('active')
          else s.classList.remove('active')
        })
      }

      const next = () => {
        index = (index + 1) % slides.length
        show(index)
      }

      // Init
      show(0)
      setInterval(next, 3000)
    }
  } catch (e) {
    console.warn('[v0] Story slider init error:', e)
  }

  // ===================================================================
  // 6. Bestsellers Carousel (4 cards/viewport, auto next 7s)
  // ===================================================================
  try {
    const bsRoot = document.querySelector('.bestsellers')
    if (bsRoot) {
      const track = bsRoot.querySelector('.bestseller-track')
      const inner = bsRoot.querySelector('.bestseller-inner')
      const prevBtn = bsRoot.querySelector('.bs-prev')
      const nextBtn = bsRoot.querySelector('.bs-next')
      const cards = bsRoot.querySelectorAll('.product-card')

      const perView = () => {
        const w = window.innerWidth
        if (w <= 768) return 1
        if (w <= 1024) return 2
        if (w <= 1280) return 4
        return 5
      }

      let currentIndex = 0
      let totalSlides = 1
      let intervalId

      const computeSlides = () => {
        totalSlides = Math.max(1, Math.ceil(cards.length / perView()))
        currentIndex = Math.min(currentIndex, totalSlides - 1)
      }

      const updateTransform = () => {
        const viewportW = track ? track.clientWidth : 0
        inner.style.transform = `translateX(-${currentIndex * viewportW}px)`
      }

      const goTo = (idx) => {
        currentIndex = (idx + totalSlides) % totalSlides
        updateTransform()
      }

      const next = () => goTo(currentIndex + 1)
      const prev = () => goTo(currentIndex - 1)

      const startAuto = () => {
        clearInterval(intervalId)
        intervalId = setInterval(next, 7000)
      }

      const onResize = () => {
        computeSlides()
        updateTransform()
      }

      // Init
      computeSlides()
      updateTransform()
      startAuto()

      // Events
      if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAuto() })
      if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAuto() })
      window.addEventListener('resize', onResize)
    }
  } catch (e) {
    console.warn('[v0] Bestsellers carousel init error:', e)
  }

  // ===================================================================
  // 5. Login Popup (show once on first visit to Homepage)
  // ===================================================================
  try {
    const popup = document.getElementById("login-popup")
    if (popup) {
      const shownKey = "fitmeal_login_popup_shown"
      const alreadyShown = sessionStorage.getItem(shownKey)

      const openPopup = () => {
        popup.classList.add("open")
        document.body.classList.add("modal-open")
        // Thử gọi resize ngay khi mở để khởi tạo kích thước sớm
        try {
          const iframe = popup.querySelector('.login-popup-iframe')
          if (iframe && (iframe.contentDocument || iframe.contentWindow?.document)) {
            // defer nhẹ để đảm bảo layout ổn định
            setTimeout(() => {
              const ev = new Event('fitmeal-popup-open')
              popup.dispatchEvent(ev)
            }, 0)
          }
        } catch(_) {}
      }

      const closePopup = () => {
        popup.classList.remove("open")
        document.body.classList.remove("modal-open")
      }

      // Event: close when clicking backdrop or X
      popup.addEventListener("click", (e) => {
        const target = e.target
        if (target instanceof Element && target.hasAttribute("data-close")) {
          closePopup()
        }
      })

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && popup.classList.contains("open")) {
          closePopup()
        }
      })

      // Show only once per session
      if (!alreadyShown) {
        openPopup()
        sessionStorage.setItem(shownKey, "1")
      }

      // ===== Auto resize iframe based on inner content (height flexible) =====
      const iframe = popup.querySelector(".login-popup-iframe")
      const dialog = popup.querySelector(".login-popup-dialog")
      // Reset any inline sizing to let CSS establish a sane baseline.
      const resetPopupSizing = () => {
        if (!iframe || !dialog) return
        iframe.style.width = ""
        iframe.style.height = ""
        dialog.style.width = ""
        dialog.style.height = ""
      }
      const clamp = (val, min, max) => Math.max(min, Math.min(max, val))

      const adjustIframeSize = () => {
        if (!iframe || !dialog) return
        try {
          const doc = iframe.contentDocument || iframe.contentWindow.document
          if (!doc) return
          const body = doc.body
          const html = doc.documentElement
          const container = doc.querySelector('.container') || body
          // Tính chiều cao theo container để tránh dính min-height 100vh của body
          const contentHeight = Math.ceil(container.getBoundingClientRect().height)
          // Đo đúng chiều rộng khối nội dung theo `.container` để khít popup
          const contentWidth = Math.ceil(container.getBoundingClientRect().width)
          const viewportMax = Math.floor(window.innerHeight * 0.9) // 90% viewport
          const viewportMaxW = Math.floor(window.innerWidth * 0.9)
          // Bám sát tuyệt đối kích thước container, chỉ giới hạn tối đa theo viewport
          const finalH = clamp(contentHeight, 0, viewportMax)
          const finalW = clamp(contentWidth, 0, viewportMaxW)

          iframe.style.height = `${finalH}px`
          dialog.style.height = `${finalH}px`
          iframe.style.width = `${finalW}px`
          dialog.style.width = `${finalW}px`
        } catch (e) {
          console.warn("[v0] Cannot access iframe for resize:", e)
        }
      }

      // Ensure baseline sizing whenever popup opens (helps with back/forward cache)
      resetPopupSizing()
      // Lắng nghe sự kiện mở để resize sớm
      popup.addEventListener('fitmeal-popup-open', () => {
        try { adjustIframeSize() } catch(_) {}
      })

      // Adjust on iframe load
      if (iframe) {
        iframe.addEventListener("load", () => {
          adjustIframeSize()
          // Observe dynamic changes inside iframe
          try {
            const doc = iframe.contentDocument || iframe.contentWindow.document
            const container = doc.querySelector('.container') || doc.body
            const ro = new ResizeObserver(() => adjustIframeSize())
            ro.observe(container)
            // Fallback: mutation observer for tab switches
            const mo = new MutationObserver(() => adjustIframeSize())
            mo.observe(doc.body, { childList: true, subtree: true, attributes: true })
          } catch (err) {
            console.warn("[v0] Observers in iframe failed:", err)
          }
        })
        // Also adjust on parent resize
        window.addEventListener("resize", adjustIframeSize)
        // Handle bfcache restore when navigating back to homepage
        window.addEventListener("pageshow", () => { resetPopupSizing(); adjustIframeSize() })
      }
    }
  } catch (err) {
    console.warn("[v0] Login popup init error:", err)
  }

  // ===================================================================
  // 8. Subtitle Marquee: populate from Footer info
  // ===================================================================
  try {
    const root = document.querySelector('.subtitle-marquee')
    if (root) {
      const setSubtitleText = (text) => {
        const t1 = root.querySelector('.subtitle-track')
        const t2 = root.querySelector('.subtitle-clone')
        if (!t1 || !t2) return
        const base = text.trim()
        // Nhân nội dung để đảm bảo chiều dài track đủ dài cho viewport lớn
        const repeated = `${base}   •   ${base}   •   ${base}`
        t1.textContent = repeated
        t2.textContent = repeated
      }

      const buildFromFooter = () => {
        const footer = document.querySelector('#site-footer .footer')
        if (!footer) return false
        const address = footer.querySelector('.address')?.textContent?.trim()
        // Tìm li có chứa giờ làm việc (bắt đầu bằng "Từ") trong cột Liên hệ
        let hours = ''
        const lis = footer.querySelectorAll('.footer-column ul li')
        for (const li of lis) {
          const txt = (li.textContent || '').trim()
          if (/^Từ\s*\d/.test(txt)) { hours = txt; break }
        }
        const emailAnchor = footer.querySelector('a[href^="mailto:"]')
        const email = (emailAnchor?.textContent?.trim()) || (emailAnchor?.getAttribute('href') || '').replace('mailto:', '')

        const addrTxt = address || 'Địa chỉ đang cập nhật'
        const hoursTxt = hours || 'Giờ làm việc: 7h00–22h00 hàng ngày'
        const emailTxt = email || 'support@fitmeal.com'

        const full = `Visit us at ${addrTxt} | ${hoursTxt} | ${emailTxt}`
        setSubtitleText(full)
        return true
      }

      // Thử dựng ngay; nếu footer chưa sẵn sàng thì đợi nạp xong
      if (!buildFromFooter()) {
        const footerRoot = document.getElementById('site-footer') || document.body
        const mo = new MutationObserver(() => { if (buildFromFooter()) mo.disconnect() })
        mo.observe(footerRoot, { childList: true, subtree: true })
      }
    }
  } catch (e) {
    console.warn('[v0] Subtitle marquee init error:', e)
  }
})
