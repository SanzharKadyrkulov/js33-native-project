//? json-server -w db.json -p 8000

// ? АПИ для запросов
const API = "http://localhost:8000/products";

//? элемент куда мы добавляем карточки
const list = document.querySelector("#products-list");
//? форма с инпутами для добавлдения
const addForm = document.querySelector("#add-form");
const titleInp = document.querySelector("#title");
const priceInp = document.querySelector("#price");
const descriptionInp = document.querySelector("#description");
const imageInp = document.querySelector("#image");

// ? форма с инпутами для изменения
const editForm = document.querySelector("#edit-form");
const editTitleInp = document.querySelector("#edit-title");
const editPriceInp = document.querySelector("#edit-price");
const editDescriptionInp = document.querySelector("#edit-description");
const editImageInp = document.querySelector("#edit-image");

// ? кнопка для скрытия и показа Admin panel
const adminPanelBtnShow = document.querySelector(".admin-panel-btn-show");
const adminPanelBtnHide = document.querySelector(".admin-panel-btn-hide");
// const myModalEl = document.querySelector(".modal");
// const modal = bootstrap.Modal.getInstance(myModalEl);


//? Достаем кнопку
const changeMode = document.querySelector(".theme");

//todo Код для показа Admin panel
addForm.style.visibility = "hidden";
addForm.style.position = "absolute";
adminPanelBtnHide.style.visibility = "hidden";
adminPanelBtnHide.style.position = "absolute";

adminPanelBtnShow.addEventListener("click", (e) => {
  addForm.style.visibility = "visible";
  addForm.style.position = "static";
  adminPanelBtnShow.style.visibility = "hidden";
  adminPanelBtnShow.style.position = "absolute";
  adminPanelBtnHide.style.visibility = "visible";
  adminPanelBtnHide.style.position = "static";
});

//todo Код для скрытия Admin panel
adminPanelBtnHide.addEventListener("click", (e) => {
  addForm.style.visibility = "hidden";
  addForm.style.position = "absolute";
  adminPanelBtnHide.style.visibility = "hidden";
  adminPanelBtnHide.style.position = "absolute";
  adminPanelBtnShow.style.visibility = "visible";
  adminPanelBtnShow.style.position = "static";
});


async function getProducts() {
  const res = await fetch(API); //? запрос на получение данных
  const data = await res.json(); //? расшивровка данных

  return data; //? возвращаем данные
}

//? функция для добавления
async function addProduct(newProduct) {
  await fetch(API, {
    method: "POST", //? указываем метод запроса
    body: JSON.stringify(newProduct), //? данные которые хотим добавить
    headers: {
      //? указываем тип контента чтобы сервер смог прочитать данные
      "Content-Type": "application/json",
    },
  });
  //? стянуть и отобразить актуальные данные
  render();
}

// ? функция для удаления
async function deleteProduct(id) {
  //? запрос на удаление
  await fetch(`${API}/${id}`, {
    method: "DELETE",
  });
  //? стянуть и отобразить актуальные данные
  render();
}

async function getOneProduct(id) {
  const res = await fetch(`${API}/${id}`);
  const data = await res.json();
  return data;
}

async function editProduct(id, newData) {
  await fetch(`${API}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(newData),
    headers: {
      "Content-Type": "application/json",
    },
  });
  render();
}

//? первоначальное отображение данных
render();

//? фукция для отображения данных на странице
async function render() {
  //? стягиваем актуальные данные
  const data = await getProducts();
  //? очищаем list чтобы карточки не дублировались
  list.innerHTML = "";
  //? перебираем полученные данные и на каждый элемент создаем карточку
  data.forEach((item) => {
    list.innerHTML += `
		<div class="card m-5" style="width: 18rem">
			<img
				src="${item.image}"
				class="card-img-top"
				alt="..."
			/>
			<div class="card-body">
				<h5 class="card-title">${item.title}</h5>
				<p class="card-text">${item.description.slice(0, 70)}...</p>
				<p class="card-text">${item.price}$</p>
				<button id="${item.id}" data-bs-toggle="modal"
				data-bs-target="#exampleModal" class="btn btn-dark w-25 btn-edit">Edit</button>
				<button id="${item.id}" class="btn btn-danger btn-delete">Delete</button>
			</div>
		</div>
		`;
  });
}

//? обработчик события для добавления
addForm.addEventListener("submit", (e) => {
  //? чтобы страница не перезагружалась
  e.preventDefault();

  //? проверка на заполненость полей
  if (
    !titleInp.value.trim() ||
    !priceInp.value.trim() ||
    !descriptionInp.value.trim() ||
    !imageInp.value.trim()
  ) {
    alert("Заполните все поля");
    return;
  }

  //? собираем обьект из значений инпутов
  const product = {
    title: titleInp.value,
    price: priceInp.value,
    description: descriptionInp.value,
    image: imageInp.value,
  };

  //? добавляем обьект в db.json
  addProduct(product);

  //? очищаем инпуты
  titleInp.value = "";
  priceInp.value = "";
  descriptionInp.value = "";
  imageInp.value = "";
});

// ? обработчик события для удаления
document.addEventListener("click", (e) => {
  //? блок if сработает только если мы нажали на элемент с классом btn-delete (на кнопку delete)
  if (e.target.classList.contains("btn-delete")) {
    deleteProduct(e.target.id); //? вызов функции deleteProduct
  }
});

let id = null;
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-edit")) {
    id = e.target.id;
    const product = await getOneProduct(id);

    editTitleInp.value = product.title;
    editPriceInp.value = product.price;
    editDescriptionInp.value = product.description;
    editImageInp.value = product.image;
  }
});

editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (
    !editTitleInp.value.trim() ||
    !editPriceInp.value.trim() ||
    !editDescriptionInp.value.trim() ||
    !editImageInp.value.trim()
  ) {
    alert("Заполните все поля");
    return;
  }

  const newData = {
    title: editTitleInp.value,
    price: editPriceInp.value,
    description: editDescriptionInp.value,
    image: editImageInp.value,
  };

  editProduct(id, newData);

});

//? Функция для смены темы
changeMode.addEventListener("click", async (e) => {
  document.body.classList.toggle("dark-mode");
  document.querySelector("h2").classList.toggle("text-white");
  //   if (document.querySelector(".navbar").classList.contains(".bg-dark")) {
  //     document.querySelector(".navbar").classList.remove("bg-dark");
  //   } else {
  //     document.querySelector(".navbar").classList.toggle("bg-dark");
  //   }

  console.log(document.querySelectorAll(".card-body"));
  let cards = document.getElementsByClassName("card-body");

  for (let i of cards) {
    i.classList.toggle("dark-mode-cards");
  }

});
