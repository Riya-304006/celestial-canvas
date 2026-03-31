const fetchData = async () => {
  try {
    const res = await fetch(
      "https://api.nasa.gov/planetary/apod?api_key=bJK1pjJgvcdA2B6c5N6yIafndV2JmGmjHPwzfrxF&start_date=2023-01-01&end_date=2023-01-05"
    );

    const data = await res.json();
    console.log(data);

    const container = document.getElementById("container");

    container.innerHTML = "";

    data.map(item => {

      const card = document.createElement("div");

      const title = document.createElement("h3");
      title.innerText = item.title;

      const img = document.createElement("img");

      if (item.media_type === "image") {
        img.src = item.url;
        img.style.width = "300px";
      }

      const desc = document.createElement("p");
      desc.innerText = item.explanation;

      card.appendChild(title);
      card.appendChild(img);
      card.appendChild(desc);

      container.appendChild(card);
    });

  } catch (error) {
    console.log("Error:", error);
  }
};

fetchData();