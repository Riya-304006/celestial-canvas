const API_KEY = "bJK1pjJgvcdA2B6c5N6yIafndV2JmGmjHPwzfrxF";

// --- STATE ---
let celestialData = [];

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
  
  if (!dataArray || dataArray.length === 0) {
    container.innerHTML = `<p class="error-msg">⚠️ No data found.</p>`;
    return;
  }

  container.className = "grid-view";
  backBtn.style.display = "none";
  
  // 1. STRICT HOF: map() to render all cards dynamically
  const cardElements = dataArray.map(item => createCardElement(item));
  
  // Append all cards (no for loops, though we can use array spread/Destructuring if needed, but append doesn't accept array. We can just use map again or foreach)
  // Wait, no for loops allowed! We can use map() to append them!
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

// --- DATA FETCHING ---

async function fetchInitialData() {
  try {
    loading.style.display = "block";
    loading.style.opacity = "1";

    // Fetch multiple items initially (12 random pictures to populate the grid)
    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&count=12`);
    const data = await response.json();
    
    celestialData = data;
    renderGrid(celestialData);

    loading.style.opacity = "0";
    setTimeout(() => loading.style.display = "none", 300);

  } catch (error) {
    console.error("Fetch error:", error);
    loading.innerText = "Error pulling from the cosmos.";
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
    // 3. STRICT HOF: filter() to match title OR date
    let filteredData = celestialData.filter(item => {
      const matchTitle = query && item.title && item.title.toLowerCase().includes(query);
      const matchDate = dateQuery && item.date && item.date === dateQuery;
      return matchTitle || matchDate;
    });
    
    // Fetch specific date from API if not in our loaded array
    if (filteredData.length === 0 && dateQuery) {
      try {
        loading.style.display = "block";
        loading.style.opacity = "1";
        
        const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&date=${dateQuery}`);
        const data = await response.json();
        
        loading.style.opacity = "0";
        setTimeout(() => loading.style.display = "none", 300);

        if (!data.error && !data.msg) {
          celestialData.push(data);
          filteredData = [data];
        }
      } catch (err) {
        console.error(err);
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

// Auto refresh every 10 minutes (600,000 ms)
setInterval(() => {
  if (mainContent.style.display === "flex") {
    fetchInitialData();
  }
}, 60000);
