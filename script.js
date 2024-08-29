async function fetchOneNotes(category) {
  const notes = {};
  const response = await fetch(`json/${category}.json`);
  const data = await response.json();
  notes[category] = data;
  return notes;
}

async function fetchAllNotes() {
  const categories = ["class-url"];
  const notes = {};

  for (const category of categories) {
    const response = await fetch(`json/${category}.json`);
    const data = await response.json();
    notes[category] = data;
  }
  return notes;
}

async function showCategory(category) {
  const notesContent = document.getElementById("notesContent");
  const rightSidebar = document.getElementById("rightSidebar");
  const searchBar = document.getElementById("globalSearch");

  // Clear the search bar
  searchBar.value = "";

  notesContent.innerHTML = "";
  rightSidebar.innerHTML = "<ul></ul>";
  rightSidebar.classList.remove("hidden");
  const notes = await fetchOneNotes(category);
  const subcategories = notes[category];

  for (const subcategory in subcategories) {
    const subcategoryNotes = subcategories[subcategory];

    // Create subcategory title and anchor
    const subcategoryAnchor = document.createElement("a");
    subcategoryAnchor.name = `${category}-${subcategory}`;
    notesContent.appendChild(subcategoryAnchor);

    const subcategoryTitle = document.createElement("h2");
    subcategoryTitle.textContent = subcategory;
    notesContent.appendChild(subcategoryTitle);

    // Create right sidebar link
    const sidebarItem = document.createElement("li");
    sidebarItem.textContent = subcategory;
    sidebarItem.onclick = () => {
      document
        .getElementsByName(`${category}-${subcategory}`)[0]
        .scrollIntoView({
          behavior: "smooth",
        });
    };
    rightSidebar.querySelector("ul").appendChild(sidebarItem);

    subcategoryNotes.forEach((note, index) => {
      const noteDiv = document.createElement("div");
      noteDiv.className = "note";
      noteDiv.innerHTML = `
        <h3>${note.title}</h3>
        <p id="note-content-${category}-${subcategory}-${index}">${note.content}</p>
        <button class="copy-button" id="copy-button-${category}-${subcategory}-${index}" onclick="copyContent('note-content-${category}-${subcategory}-${index}', 'copy-button-${category}-${subcategory}-${index}')">复制</button>
      `;
      notesContent.appendChild(noteDiv);
    });
  }

  // Add scroll event listener to highlight current subcategory
  notesContent.onscroll = () => {
    let activeItem = null;
    for (const subcategory in subcategories) {
      const subcategoryAnchor = document.getElementsByName(
        `${category}-${subcategory}`
      )[0];
      const rect = subcategoryAnchor.getBoundingClientRect();
      if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
        activeItem = subcategory;
        break;
      }
    }
    const rightSidebarItems = rightSidebar.querySelectorAll("li");
    rightSidebarItems.forEach((item) => {
      item.classList.remove("active");
      if (item.textContent === activeItem) {
        item.classList.add("active");
        item.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  };
}

function copyContent(contentId, buttonId) {
  const content = document.getElementById(contentId).textContent;
  navigator.clipboard.writeText(content).then(() => {
    const button = document.getElementById(buttonId);
    button.classList.add("copied");
    button.textContent = "已复制";
    setTimeout(() => {
      button.classList.remove("copied");
      button.textContent = "复制";
    }, 2000);
  });
}

async function globalSearch() {
  const query = document.getElementById("globalSearch").value.toLowerCase();
  const notesContent = document.getElementById("notesContent");
  const rightSidebar = document.getElementById("rightSidebar");

  if (query) {
    rightSidebar.classList.add("hidden");
  } else {
    rightSidebar.classList.remove("hidden");
    // 默认显示git笔记
    showCategory("class-url");
  }

  notesContent.innerHTML = "";
  const notes = await fetchAllNotes();
  const keywords = query.split(" ");

  for (const category in notes) {
    const subcategories = notes[category];
    for (const subcategory in subcategories) {
      const subcategoryNotes = subcategories[subcategory];
      subcategoryNotes.forEach((note, index) => {
        const noteTitle = note.title.toLowerCase();
        const noteContent = note.content.toLowerCase();

        // Check if all keywords are in either title or content
        const allKeywordsMatch = keywords.every(
          (keyword) =>
            noteTitle.includes(keyword) || noteContent.includes(keyword)
        );

        if (allKeywordsMatch) {
          const noteDiv = document.createElement("div");
          noteDiv.className = "note";
          noteDiv.innerHTML = `
            // <h3>${note.title}</h3>
            // <p id="note-content-${category}-${subcategory}-${index}">${note.content}</p>
            // <button class="copy-button" id="copy-button-${category}-${subcategory}-${index}" onclick="copyContent('note-content-${category}-${subcategory}-${index}', 'copy-button-${category}-${subcategory}-${index}')">复制</button>
          <h3>${note.title}</h3>
          <p id="note-content-${category}-${subcategory}-${index}">${note.content}</p>
          <button class="copy-button" id="action-button-${category}-${subcategory}-${index}" onclick="handleButtonClick('note-content-${category}-${subcategory}-${index}', 'action-button-${category}-${subcategory}-${index}')">${isUrl(note.content) ? '去上课' : '复制'}
          </button>
            `;
          notesContent.appendChild(noteDiv);
        }
      });
    }
  }
}



// 默认显示git笔记
document.addEventListener("DOMContentLoaded", () => {
  showCategory("class-url");
});
document.addEventListener("DOMContentLoaded", (event) => {
  fetchAllNotes();
});

function isUrl(string) {
  try {
      new URL(string);
      return true;
  } catch (_) {
      return false;
  }
}

function handleButtonClick(contentId, buttonId) {
  const content = document.getElementById(contentId).innerText;
  if (isUrl(content)) {
      window.open(content, '_blank');
  } else {
      copyContent(contentId, buttonId);
  }
}

function copyContent(contentId, buttonId) {
  const content = document.getElementById(contentId).innerText;
  navigator.clipboard.writeText(content).then(function() {
      const button = document.getElementById(buttonId);
      button.innerText = '已复制';
      setTimeout(() => {
          button.innerText = '复制';
      }, 2000);
  }, function(err) {
      console.error('复制失败', err);
  });
}