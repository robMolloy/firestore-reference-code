const cafeList = document.querySelector("#cafe-list");
const form = document.querySelector("#add-cafe-form");

const getCafes = async () => {
  const snapshot = await db
    .collection("cafes")
    .orderBy("name")
    // .where("city", "==", "berko")
    .get();
  const docs = snapshot.docs;
  return docs;
};

const renderCafes = async () => {
  const cafes = await getCafes();
  cafes.forEach((cafe) => {
    renderCafe(cafe);
  });
};

const renderCafe = (doc) => {
  const li = createCafe(doc);
  cafeList.appendChild(li);
};

const createCafe = (doc) => {
  const data = doc.data();

  let li = document.createElement("li");
  let name = document.createElement("span");
  let city = document.createElement("span");
  let cross = document.createElement("div");

  li.setAttribute("data-id", doc.id);
  name.textContent = data.name;
  city.textContent = data.city;
  cross.textContent = "x";

  li.appendChild(name);
  li.appendChild(city);
  li.appendChild(cross);

  cross.addEventListener("click", (e) => {
    e.stopPropagation();
    let id = e.target.parentElement.getAttribute("data-id");
    db.collection("cafes").doc(id).delete();
  });

  return li;
};

// renderCafes();

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let name = form.name;
  let city = form.city;
  db.collection("cafes").add({ name: name.value, city: city.value });
  name.value = "";
  city.value = "";
});

//real-time listener

db.collection("cafes")
  .orderBy("city")
  .onSnapshot((snapshot) => {
    let changes = snapshot.docChanges();
    console.log(changes);

    changes.forEach((change) => {
      if (change.type === "added") renderCafe(change.doc);
      else if (change.type === "removed") {
        let li = cafeList.querySelector(`[data-id=${change.doc.id}]`);
        cafeList.removeChild(li);
      } else if (change.type === "modified") {
        let li = cafeList.querySelector(`[data-id=${change.doc.id}]`);
        cafeList.removeChild(li);
        renderCafe(change.doc);
      }
    });
  });
