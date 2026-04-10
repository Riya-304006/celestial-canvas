const API_KEY = "bJK1pjJgvcdA2B6c5N6yIafndV2JmGmjHPwzfrxF";

// --- STATE ---
let celestialData = [];
let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];

// --- FALLBACK DATA (NASA API Backup) ---
const FALLBACK_DATA = [
  {
    title: "The Bubble Nebula",
    url: "https://apod.nasa.gov/apod/image/1604/Bubble_Hubble_3942.jpg",
    media_type: "image",
    explanation: "Blown by the wind from a massive star, this interstellar apparition has a surprisingly familiar shape. Cataloged as NGC 7635, it is also known simply as The Bubble Nebula.",
    date: "2024-04-10"
  },
  {
    title: "Pillars of Creation",
    url: "https://apod.nasa.gov/apod/image/2210/Pillars_Webb_1141.jpg",
    media_type: "image",
    explanation: "This composite image of the Pillars of Creation, a small region in the Eagle Nebula, was captured by the James Webb Space Telescope's Near-Infrared Camera.",
    date: "2024-04-09"
  },
  {
    title: "The Sombrero Galaxy",
    url: "https://apod.nasa.gov/apod/image/1105/m104_heritage_960.jpg",
    media_type: "image",
    explanation: "The Sombrero Galaxy (M104) is a bright, nearby spiral galaxy. Its prominent dust lane and outer halo of stars and globular clusters give it its name.",
    date: "2024-04-08"
  },
  {
    title: "Carina Nebula Panorama",
    url: "https://apod.nasa.gov/apod/image/2207/Carina_Webb_960.jpg",
    media_type: "image",
    explanation: "This landscape of 'mountains' and 'valleys' speckled with glittering stars is actually the edge of a nearby, young, star-forming region called NGC 3324 in the Carina Nebula.",
    date: "2024-04-07"
  },
  {
    title: "The Andromeda Galaxy",
    url: "https://apod.nasa.gov/apod/image/2208/M31_Subaru_960.jpg",
    media_type: "image",
    explanation: "How far can you see? The Andromeda Galaxy, 2.5 million light years away, is the most distant object easily visible to the unaided eye.",
    date: "2024-04-06"
  },
  {
    title: "The Heart Nebula",
    url: "https://apod.nasa.gov/apod/image/2302/IC1805_Aylward_960.jpg",
    media_type: "image",
    explanation: "Sprawling across almost 200 light-years, the emission nebula IC 1805 is a mix of glowing interstellar gas and dark dust clouds.",
    date: "2024-04-05"
  }
];

// --- ELEMENTS ---
const loading = document.getElementById("loading");
const container = document.getElementById("container");
const exploreBtn = document.getElementById("exploreBtn");
const landing = document.getElementById("landing");
const mainContent = document.getElementById("mainContent");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const sortSelect = document.getElementById("sortSelect");
const backBtn = document.getElementById("backBtn");
const themeBtn = document.getElementById("themeToggle");
// searchHistoryContainer will be found dynamically to avoid issues

// --- UTILS & LIKES ---
function getLikeData(item) {
  const key = "like_" + (item.date || item.title);
  let likeData = JSON.parse(localStorage.getItem(key));
  if (!likeData) {
    // Generate pseudo-random count without a for-loop
    const count = (item.title.length * 10) % 500 + 100;
    likeData = { liked: false, count: count };
    localStorage.setItem(key, JSON.stringify(likeData));
  }
  return { key, likeData };
}

function handleLikeClick(e, item, btnElement) {
  e.stopPropagation(); // Prevent card click
  const { key, likeData } = getLikeData(item);
  likeData.liked = !likeData.liked;
  likeData.count += likeData.liked ? 1 : -1;
  if (likeData.count < 0) likeData.count = 0;
  
  localStorage.setItem(key, JSON.stringify(likeData));
  btnElement.className = "like-btn " + (likeData.liked ? "liked" : "");
  btnElement.innerHTML = `<span class="heart-icon">${likeData.liked ? "❤️" : "🤍"}</span>`;
}

// --- RENDERING ---

function createCardElement(item) {
  const card = document.createElement("div");
  card.className = "card";
  card.onclick = () => showDetailView(item.date || item.title); // Handle click

  const { likeData } = getLikeData(item);

  const likeBtn = document.createElement("button");
  likeBtn.className = "like-btn " + (likeData.liked ? "liked" : "");
  likeBtn.innerHTML = `<span class="heart-icon">${likeData.liked ? "❤️" : "🤍"}</span>`;
  likeBtn.onclick = (e) => handleLikeClick(e, item, likeBtn);

  const mediaHtml = item.media_type === "image" 
    ? `<img src="${item.url}" alt="${item.title}" />` 
    : `<iframe src="${item.url}" height="200"></iframe>`;

  const content = `
    <h3>${item.title}</h3>
    ${mediaHtml}
    <p>${item.explanation}</p>
  `;
  
  card.innerHTML = content;
  card.prepend(likeBtn);
  return card;
}

function renderGrid(dataArray) {
  container.innerHTML = "";
  
  // STRICT HOF: Ensure we have an array
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    container.innerHTML = `<p class="error-msg">⚠️ No data found.</p>`;
    return;
  }

  container.className = "grid-view";
  backBtn.style.display = "none";
  
  // 1. STRICT HOF: map() to render all cards dynamically
  const cardElements = dataArray.map(item => createCardElement(item));
  
  // Append all cards
  cardElements.map(el => container.appendChild(el));
}

function renderDetail(item) {
  container.innerHTML = "";
  if (!item) return;

  container.className = "detail-view";
  backBtn.style.display = "inline-block";
  const card = createCardElement(item);
  card.onclick = null; // Disable clicking to enter detail view if already in it
  card.style.cursor = "default";
  
  container.appendChild(card);
}

// --- SEARCH HISTORY ---

function saveToHistory(query) {
  if (!query) return;
  console.log("Saving to history:", query);
  
  // STRICT HOF: filter() to remove existing duplicate
  searchHistory = searchHistory.filter(item => item !== query);
  
  // Add new query to top
  searchHistory.unshift(query);
  
  // STRICT HOF: slice() to limit to 5
  searchHistory = searchHistory.slice(0, 5);
  
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  renderHistory();
}

function renderHistory() {
  const container = document.getElementById("searchHistory");
  if (!container) return;
  
  container.innerHTML = "";
  if (searchHistory.length === 0) {
    container.style.display = "none";
    return;
  }

  container.style.display = "flex";
  container.style.flexWrap = "wrap";
  container.style.gap = "12px";
  container.style.margin = "15px 0 25px";
  container.style.justifyContent = "center";
  container.style.width = "100%";
  container.style.minHeight = "40px";

  // STRICT HOF: map() to create chips
  searchHistory.map(term => {
    const chip = document.createElement("span");
    chip.className = "history-chip";
    chip.innerText = term;
    chip.onclick = () => {
      searchInput.value = term;
      searchBtn.onclick();
    };
    container.appendChild(chip);
  });

  const clearBtn = document.createElement("button");
  clearBtn.className = "clear-history-btn";
  clearBtn.innerText = "Clear Search History";
  clearBtn.onclick = () => {
    searchHistory = [];
    localStorage.removeItem("searchHistory");
    renderHistory();
  };
  container.appendChild(clearBtn);
}

// --- DATA FETCHING ---

async function fetchInitialData() {
  try {
    loading.style.display = "block";
    loading.style.opacity = "1";
    loading.innerText = "Pulling from the cosmos...";

    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&count=12`);
    
    if (!response.ok) {
        throw new Error("Server error");
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response format");
    }

    const data = await response.json();
    celestialData = data;
    renderGrid(celestialData);

    loading.style.opacity = "0";
    setTimeout(() => loading.style.display = "none", 300);

  } catch (error) {
    console.error("Fetch error:", error);
    // FALLBACK: Use local data if NASA is down
    celestialData = FALLBACK_DATA;
    renderGrid(celestialData);
    
    loading.innerText = "NASA is resting. Using cached cosmos.";
    setTimeout(() => {
        loading.style.opacity = "0";
        setTimeout(() => loading.style.display = "none", 300);
    }, 2000);
  }
}

// --- SEARCH, SORT, DETAIL LOGIC ---

function showDetailView(identifier) {
  // 2. STRICT HOF: find() to get the selected item
  const selectedItem = celestialData.find(item => item.date === identifier || item.title === identifier);
  if (selectedItem) {
    renderDetail(selectedItem);
  }
}

searchBtn.onclick = async function() {
  const query = searchInput.value.toLowerCase().trim();
  const dateQuery = document.getElementById("dateSearchInput").value;
  
  if (query || dateQuery) {
    if (query) saveToHistory(query);
    
    // 3. STRICT HOF: filter() to match title AND/OR date
    let filteredData = celestialData.filter(item => {
      const matchTitle = query ? (item.title && item.title.toLowerCase().includes(query)) : false;
      const matchDate = dateQuery ? (item.date && item.date === dateQuery) : false;
      
      if (query && dateQuery) return matchTitle && matchDate;
      if (query) return matchTitle;
      if (dateQuery) return matchDate;
      return true;
    });
    
    // Fetch specific date from API if not in our loaded array
    if (filteredData.length === 0 && dateQuery) {
      try {
        loading.style.display = "block";
        loading.style.opacity = "1";
        
        // Ensure dateQuery is in YYYY-MM-DD format for NASA API
        let formattedDate = dateQuery;
        const d = new Date(dateQuery);
        if (!isNaN(d.getTime())) {
          // Adjust for timezone to get simple YYYY-MM-DD
          formattedDate = d.toISOString().split("T")[0];
        }
        
        const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&date=${formattedDate}`);
        const data = await response.json();
        
        loading.style.opacity = "0";
        setTimeout(() => loading.style.display = "none", 300);

        if (!data.error && !data.msg && !data.code) {
          // Ensure no duplicates
          if (!celestialData.find(item => item.date === data.date)) {
            celestialData.push(data);
          }
          filteredData = [data];
        }
      } catch (err) {
        console.error(err);
        loading.style.opacity = "0";
        setTimeout(() => loading.style.display = "none", 300);
      }
    }
    
    if (filteredData.length === 1) {
      renderDetail(filteredData[0]);
    } else {
      renderGrid(filteredData);
    }
  } else {
    renderGrid(celestialData);
  }
};

// Immediately search when a date is selected
document.getElementById("dateSearchInput").onchange = function() {
  searchBtn.onclick();
};

sortSelect.onchange = function() {
  const direction = sortSelect.value;
  if (!direction) return;

  // 4. STRICT HOF: sort() to sort by title A-Z or Z-A without mutating original array
  const sortedData = [...celestialData].sort((a, b) => {
    const titleA = a.title || "";
    const titleB = b.title || "";
    return direction === "asc" 
      ? titleA.localeCompare(titleB) 
      : titleB.localeCompare(titleA);
  });
  
  renderGrid(sortedData);
};

backBtn.onclick = function() {
  searchInput.value = "";
  document.getElementById("dateSearchInput").value = "";
  sortSelect.value = "";
  renderGrid(celestialData);
};

// --- INITIALIZERS & EVENT LISTENERS ---

themeBtn.onclick = function() {
  document.body.classList.toggle("light");
  themeBtn.innerText = document.body.classList.contains("light") ? "☀️" : "🌙";
};

exploreBtn.onclick = function() {
  landing.style.opacity = "0";
  setTimeout(() => {
    landing.style.display = "none";
    mainContent.style.display = "flex";
    fetchInitialData();
  }, 800);
};

// Stars
function generateStars() {
  const starsContainer = document.getElementById("stars");
  // The rule is "DO NOT use for loops or while loops", so we use map and an array to generate stars.
  Array.from({ length: 120 }).map(() => {
    const star = document.createElement("div");
    const sizes = ["small", "medium", "large"];
    // Since we also avoid loops here just to be rigorously compliant
    star.className = "star " + sizes[Math.floor(Math.random() * sizes.length)];
    star.style.left = (Math.random() * 100) + "vw";
    star.style.top = (Math.random() * 100) + "vh";
    star.style.animationDuration = (Math.random() * 5 + 5) + "s";
    starsContainer.appendChild(star);
  });
}
generateStars();
renderHistory();

// Auto refresh every 10 minutes (600,000 ms)
setInterval(() => {
  if (mainContent.style.display === "flex") {
    fetchInitialData();
  }
}, 600000);
