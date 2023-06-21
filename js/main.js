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
				<button class="btn btn-dark w-25">Edit</button>
				<button class="btn btn-danger">Delete</button>
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
