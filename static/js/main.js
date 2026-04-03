// Market hours (U.S. stock market)
const MARKET_OPEN_HOUR = 9;
const MARKET_OPEN_MIN = 30;
const MARKET_CLOSE_HOUR = 16;
const MARKET_CLOSE_MIN = 0;

(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  mobileNavToggleBtn.addEventListener('click', mobileNavToogle);

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Auto generate the carousel indicators
   */
  document.querySelectorAll('.carousel-indicators').forEach((carouselIndicator) => {
    carouselIndicator.closest('.carousel').querySelectorAll('.carousel-item').forEach((carouselItem, index) => {
      if (index === 0) {
        carouselIndicator.innerHTML += `<li data-bs-target="#${carouselIndicator.closest('.carousel').id}" data-bs-slide-to="${index}" class="active"></li>`;
      } else {
        carouselIndicator.innerHTML += `<li data-bs-target="#${carouselIndicator.closest('.carousel').id}" data-bs-slide-to="${index}"></li>`;
      }
    });
  });

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Animate the skills items on reveal
   */
  let skillsAnimation = document.querySelectorAll('.skills-animation');
  skillsAnimation.forEach((item) => {
    new Waypoint({
      element: item,
      offset: '80%',
      handler: function(direction) {
        let progress = item.querySelectorAll('.progress .progress-bar');
        progress.forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
      }
    });
  });

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });
  // Newly added code

  $(document).ready(function(){
    $("#myInput").on("keyup", function() {
      var value = $(this).val().toLowerCase();
      $("#myTable tr").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
    });
  });


  let chart;
  let dataPoints = [];
  let chartType = "line"; // Default chart type
  
  function fetchStockData() {
      fetch(`/stock-data/${ticker}`)
          .then(response => response.json())
          .then(data => {
              let latestData = data.map(d => ({
                  x: new Date(d.Date),
                  y: chartType === "candlestick"
                      ? [d.Open, d.High, d.Low, d.Close] // Candlestick format
                      : d.Close // Line chart format
              }));
  
              dataPoints.length = 0; // Clear old data
              dataPoints.push(...latestData); // Add new data
  
              chart.options.data[0].dataPoints = dataPoints;
              chart.render(); // Update chart
  
              // Update stock price
              if (latestData.length > 0) {
                  let latestPrice = parseFloat(
                      chartType === "candlestick" 
                          ? latestData[latestData.length - 1].y[3] // Close price
                          : latestData[latestData.length - 1].y
                  ).toFixed(3);
                  document.getElementById("currentPrice").innerText = latestPrice;
              }
          })
          .catch(error => console.error("Error fetching stock data:", error));
  }
  
  // Initialize Chart
  document.addEventListener("DOMContentLoaded", function () {
      chart = new CanvasJS.Chart("chartContainer", {
          backgroundColor: "#ffffff",
          animationEnabled: true,
          theme: "light2",
          title: { 
              text: ticker + " Stock Price",
              fontColor: "#333",
              fontSize: 20
          },
          axisX: { 
            title: "Date", 
            labelAngle: -45,
            gridThickness: 0, // Removes vertical grid lines
            lineColor: "#666"
           },
          axisY: { 
            title: "Stock Price (USD)",
            gridThickness: 0, // Removes vertical grid lines
            lineColor: "#666"
           },
          data: [{
              type: chartType,
              lineColor: "#007bff",
              risingColor: "#00c853", 
              fallingColor: "#d50000",
              dataPoints: dataPoints
          }]
      });
  
      chart.render();
      fetchStockData(); // Load data initially
      setTimeout(fetchStockData, 1500);
      if (isMarketOpen() === true) {
      setInterval(fetchStockData, 5000);
      } // Update data every 5 seconds
  });
  
  // Toggle Chart Type
  document.getElementById("toggleChart").addEventListener("click", function () {
      chartType = chartType === "line" ? "candlestick" : "line"; // Toggle type
  
      // Update chart type & button text
      chart.options.data[0].type = chartType;
      this.innerText = chartType === "line" ? "Switch to Candlestick" : "Switch to Line Chart";
  
      fetchStockData(); // Fetch new data in the correct format
  });
  


// ESG Pie Chart
let esgChart; // store instance so we can re-render later
function renderESGChart(esgScore) {
  var esgData = [
      { label: "Environmental", y: esgScore.E, color: "green" },
      { label: "Social", y: esgScore.S, color: "#0956a7" },
      { label: "Governance", y: esgScore.G, color: "goldenrod" }
  ];

  esgChart = new CanvasJS.Chart("esgChart", {
      animationEnabled: true,
      theme: "light2",
      data: [{
          type: "pie",
          startAngle: 240,
          showInLegend: true,
          legendText: "{label}",
          indexLabel: "{label}: {y}",
          indexLabelFontSize: 16,
          toolTipContent: "<b>{label}</b>: {y}",
          dataPoints: esgData
      }]
  });

  esgChart.render();
  return esgChart;
}

// Ensure chart is responsive
document.addEventListener("DOMContentLoaded", function () {
  // initial render (may be inside hidden tab)
  esgChart = renderESGChart(esgScore);

  // Re-render when a Bootstrap tab becomes active (supports data-bs-toggle and data-toggle)
  document.querySelectorAll('a[data-bs-toggle="tab"], a[data-toggle="tab"]').forEach(function(tab) {
    tab.addEventListener('shown.bs.tab', function (e) {
      // if esgChart container is visible, re-render
      const container = document.getElementById('esgChart');
      if (container && container.offsetParent !== null && esgChart) {
        esgChart.render();
      }
    });
    // some setups use jQuery show event — try fallback for older bootstrap with jQuery
    tab.addEventListener('shown', function () {
      const container = document.getElementById('esgChart');
      if (container && container.offsetParent !== null && esgChart) {
        esgChart.render();
      }
    });
  });

  // Re-render on window resize (debounced)
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (esgChart) esgChart.render();
    }, 200);
  });
});

})();


// Check if market is open (Mon–Fri, 9:30 AM–4:00 PM EST)
function isMarketOpen() {
    const now = new Date();

    // Convert to U.S. Eastern Time
    const estTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const day = estTime.getDay(); // 0 = Sunday, 6 = Saturday
    const hours = estTime.getHours();
    const minutes = estTime.getMinutes();

    // Check weekday (1–5)
    const isWeekday = day >= 1 && day <= 5;

    const afterOpen =
        hours > MARKET_OPEN_HOUR ||
        (hours === MARKET_OPEN_HOUR && minutes >= MARKET_OPEN_MIN);
    const beforeClose =
        hours < MARKET_CLOSE_HOUR ||
        (hours === MARKET_CLOSE_HOUR && minutes <= MARKET_CLOSE_MIN);

    console.log(`Market Open Check - Day: ${day}, Time: ${hours}:${minutes}, After Open: ${afterOpen}, Before Close: ${beforeClose}`);

    return isWeekday && afterOpen && beforeClose;
}
