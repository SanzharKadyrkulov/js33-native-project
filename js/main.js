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
const categoryInp = document.querySelector("#category");

// ? форма с инпутами для изменения
const editForm = document.querySelector("#edit-form");
const editTitleInp = document.querySelector("#edit-title");
const editPriceInp = document.querySelector("#edit-price");
const editDescriptionInp = document.querySelector("#edit-description");
const editImageInp = document.querySelector("#edit-image");
const editCategoryInp = document.querySelector("#edit-category");
const exampleModal = document.querySelector("#exampleModal");

//? поиск
const searchInput = document.querySelector("#search");
//? переиенная для запроса на поиск
let searchVal = "";

// ? фильтрация
const radios = document.querySelectorAll("input[type='radio']");
let category = "";

//? элементы пагинации
const paginationList = document.querySelector(".pagination-list");
const prev = document.querySelector(".prev");
const next = document.querySelector(".next");
//? количество продуктов на одной странице
const limit = 6;
//? текущая страница
let currentPage = 1;
//? общее количество страниц
let pageTotalCount = 1;

// ? кнопка для скрытия и показа Admin panel
const adminPanelBtnShow = document.querySelector(".admin-panel-btn-show");
const adminPanelBtnHide = document.querySelector(".admin-panel-btn-hide");
// const myModalEl = document.querySelector(".modal");
// const modal = bootstrap.Modal.getInstance(myModalEl);

//? Достаем кнопку
const changeMode = document.querySelector(".theme");
let isDark = false;

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
	//? q - это поиск по всем ключам объекта
	//? [key]_like - это поиск по определенному ключу (вместо [key] должно быть название ключа)
	//? _limit это максимальное количество элементов на одной странице
	//? _page чтобы элементы на определенной странице
	const res = await fetch(
		`${API}?title_like=${searchVal}&_limit=${limit}&_page=${currentPage}&category_like=${category}`
	); //? запрос на получение данных

	const data = await res.json(); //? расшивровка данных
	// ? x-total-count общее кол-во продуктов
	const count = res.headers.get("x-total-count");
	//? высчитываем общее кол-во страниц
	pageTotalCount = Math.ceil(count / limit);

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
			<div class="card-body ${isDark ? "dark-mode-cards" : ""}">
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
	//? отрисовываем кнопки пагинации
	renderPagination();
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
		category: categoryInp.value,
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
		category: editCategoryInp.value,
	};

	editProduct(id, newData);
	let modal = bootstrap.Modal.getInstance(exampleModal);
	modal.hide();
});

//? Функция для смены темы
changeMode.addEventListener("click", async (e) => {
	document.body.classList.toggle("dark-mode");
	document.querySelector("h2").classList.toggle("text-white");
	const navbar = document.querySelector(".navbar");
	navbar.classList.toggle("bg-dark");
	navbar.classList.toggle("navbar-dark");
	navbar.classList.toggle("bg-body-tertiary");

	isDark = !isDark;
	render();
});
// ? функция для отображения кнопок пагинации
function renderPagination() {
	paginationList.innerHTML = "";
	for (let i = 1; i <= pageTotalCount; i++) {
		paginationList.innerHTML += `
		<li class="page-item ${
			i === currentPage ? "active" : ""
		}"><button class="page-link page-number">${i}</button></li>
		`;
	}

	//? чтобы кропка prev была неактивна на первой странице
	if (currentPage <= 1) {
		prev.classList.add("disabled");
	} else {
		prev.classList.remove("disabled");
	}
	//? чтобы кропка next была неактивна на последней странице
	if (currentPage >= pageTotalCount) {
		next.classList.add("disabled");
	} else {
		next.classList.remove("disabled");
	}
}
//? обработчик события чтобы перейти на следующую страницу
next.addEventListener("click", () => {
	if (currentPage >= pageTotalCount) {
		return;
	}
	currentPage++;
	render();
});

//? обработчик события чтобы перейти на предыдущую страницу
prev.addEventListener("click", () => {
	if (currentPage <= 1) {
		return;
	}
	currentPage--;
	render();
});

//? обработчик события чтобы перейти на определенную страницу
document.addEventListener("click", (e) => {
	if (e.target.classList.contains("page-number")) {
		currentPage = +e.target.innerText;
		render();
	}
});

searchInput.addEventListener("input", (e) => {
	searchVal = searchInput.value;
	currentPage = 1;
	render();
});

// ? фильтрация
radios.forEach((item) => {
	item.addEventListener("change", (e) => {
		category = e.target.id;
		render();
	});
});
