const title = document.getElementById("title");
const price = document.getElementById("price");
const taxs = document.getElementById("taxs");
const discount = document.getElementById("discount");
const total = document.getElementById("total");
const count = document.getElementById("count");
const category = document.getElementById("category");
const createBtn = document.getElementById("create");
const tbody = document.querySelector("tbody");
const deleteAllBtn = document.getElementById("delall");
const searchInput = document.getElementById("search");
const clearSearchBtn = document.getElementById("clear-search");
const paginationContainer = document.getElementById("pagination");

const modal = document.getElementById("duplicate-modal");
const modalMessage = document.getElementById("modal-message");
const confirmAddBtn = document.getElementById("confirm-add");
const cancelAddBtn = document.getElementById("cancel-add");

let products = JSON.parse(localStorage.getItem("products") || "[]");
let filteredProducts = [...products];
let mode = "create";
let indexToUpdate = null;

let currentPage = 1;
const productsPerPage = 15;

renderProductsPage(currentPage);
toggleDeleteAllBtn();

function getTotal() {
  if (price.value.trim() !== "") {
    const result =
      Number(price.value) +
      Number(taxs.value || 0) -
      Number(discount.value || 0);
    total.value = `Total: ${result}`;
    total.style.background = "#a9dfbf";
    total.style.color = "#145a32";
  } else {
    total.value = "Total: ";
    total.style.background = "#f5b7b1";
    total.style.color = "#641e16";
  }
}

createBtn.onclick = () => {
  if (
    title.value.trim() === "" ||
    price.value.trim() === "" ||
    category.value.trim() === ""
  ) {
    showAlert();
    return;
  }

  const newProduct = {
    title: title.value.trim(),
    price: price.value.trim(),
    taxs: taxs.value.trim(),
    discount: discount.value.trim(),
    total: total.value.slice(7).trim(),
    count: Number(count.value) || 1,
    category: category.value.trim(),
  };

  if (mode === "update") {
    products[indexToUpdate] = newProduct;
    resetForm();
    mode = "create";
    createBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Create Product';
    saveProducts();
    filteredProducts = [...products];
    currentPage = 1;
    renderProductsPage(currentPage);
    toggleDeleteAllBtn();
    return;
  }

  const existingIndex = products.findIndex(
    (p) =>
      p.title.toLowerCase() === newProduct.title.toLowerCase() &&
      p.category.toLowerCase() === newProduct.category.toLowerCase()
  );

  if (existingIndex !== -1) {
    modalMessage.textContent = `This product already exists in #${
      existingIndex + 1
    }. Do you want to increase its count?`;
    modal.classList.remove("hidden");

    confirmAddBtn.onclick = () => {
      products[existingIndex].count += newProduct.count;
      modal.classList.add("hidden");
      saveProducts();
      filteredProducts = [...products];
      currentPage = 1;
      renderProductsPage(currentPage);
      toggleDeleteAllBtn();
      resetForm();
      confirmAddBtn.onclick = null;
      cancelAddBtn.onclick = null;
    };

    cancelAddBtn.onclick = () => {
      modal.classList.add("hidden");
      resetForm();
      confirmAddBtn.onclick = null;
      cancelAddBtn.onclick = null;
    };

    return;
  }

  products.push(newProduct);
  saveProducts();
  filteredProducts = [...products];
  currentPage = 1;
  renderProductsPage(currentPage);
  toggleDeleteAllBtn();
  resetForm();
};

function saveProducts() {
  localStorage.setItem("products", JSON.stringify(products));
}

function renderProductsPage(page) {
  tbody.innerHTML = "";
  const start = (page - 1) * productsPerPage;
  const end = start + productsPerPage;
  const pageProducts = filteredProducts.slice(start, end);

  pageProducts.forEach((product, i) => {
    const globalIndex = start + i;
    tbody.innerHTML += `
      <tr>
        <td>${globalIndex + 1}</td>
        <td>${product.title}</td>
        <td>${product.price}</td>
        <td>${product.taxs}</td>
        <td>${product.discount}</td>
        <td>${product.total}</td>
        <td>${product.count}</td>
        <td>${product.category}</td>
        <td><span class="update" onclick="editProduct(${globalIndex})">Update</span></td>
        <td><span class="delete" onclick="decreaseCount(${globalIndex})">Delete</span></td>
        <td><span class="delall" onclick="removeProduct(${globalIndex})">Clear</span></td>
      </tr>
    `;
  });

  renderPagination();
}

function renderPagination() {
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (totalPages <= 1) {
    paginationContainer.style.display = "none";
    return;
  }
  paginationContainer.style.display = "block";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");
    btn.onclick = () => {
      currentPage = i;
      renderProductsPage(currentPage);
    };
    paginationContainer.appendChild(btn);
  }
}

function editProduct(i) {
  const product = products[i];
  title.value = product.title;
  price.value = product.price;
  taxs.value = product.taxs;
  discount.value = product.discount;
  count.value = product.count;
  category.value = product.category;
  getTotal();
  createBtn.innerHTML = "Update";
  mode = "update";
  indexToUpdate = i;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function decreaseCount(i) {
  if (products[i].count > 1) {
    products[i].count--;
  } else {
    products.splice(i, 1);
  }
  saveProducts();
  filteredProducts = [...products];
  renderProductsPage(currentPage);
  toggleDeleteAllBtn();
}

function removeProduct(i) {
  products.splice(i, 1);
  saveProducts();
  filteredProducts = [...products];
  renderProductsPage(currentPage);
  toggleDeleteAllBtn();
}

function toggleDeleteAllBtn() {
  if (products.length > 0) {
    deleteAllBtn.style.display = "block";
    deleteAllBtn.textContent = `Delete All Products (${products.length})`;
  } else {
    deleteAllBtn.style.display = "none";
  }
}

deleteAllBtn.onclick = () => {
  localStorage.removeItem("products");
  products = [];
  filteredProducts = [];
  renderProductsPage(currentPage);
  toggleDeleteAllBtn();
};

searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();
  filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(value) ||
      product.category.toLowerCase().includes(value)
  );
  currentPage = 1;
  renderProductsPage(currentPage);
});

clearSearchBtn.onclick = () => {
  searchInput.value = "";
  filteredProducts = [...products];
  currentPage = 1;
  renderProductsPage(currentPage);
};

function resetForm() {
  title.value = "";
  price.value = "";
  taxs.value = "";
  discount.value = "";
  total.value = "Total: ";
  total.style.background = "#f5b7b1";
  total.style.color = "#641e16";
  count.value = "";
  category.value = "";
  mode = "create";
  createBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Create Product';
}

function showAlert() {
  const alertMsg = document.getElementById("alert-msg");
  alertMsg.classList.remove("hidden");
  setTimeout(() => {
    alertMsg.classList.add("hidden");
  }, 3000);
}

// PDF Export
document.getElementById("exportPDF").onclick = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text("Product Manager Report", 14, 20);

  const now = new Date();
  const totalCount = products.length;
  const totalAmount = products.reduce((acc, p) => acc + Number(p.total), 0);

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(
    `Date: ${now.toLocaleDateString()}  |  Total Products: ${totalCount}  |  Total Amount: $${totalAmount}`,
    14,
    30
  );

  const headers = [
    ["#", "Title", "Price", "Taxes", "Discount", "Total", "Count", "Category"],
  ];

  const data = products.map((p, i) => [
    i + 1,
    p.title,
    p.price,
    p.taxs,
    p.discount,
    p.total,
    p.count,
    p.category,
  ]);

  doc.autoTable({
    startY: 40,
    head: headers,
    body: data,
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  doc.save("Product-Report.pdf");
};

// Excel Export
document.getElementById("exportExcel").onclick = () => {
  const worksheet = XLSX.utils.json_to_sheet(products);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
  XLSX.writeFile(workbook, "products.xlsx");
};

document.getElementById("importExcel").addEventListener("change", function (e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    rows.forEach((row) => {
      const newProduct = {
        title: row.title || "",
        price: row.price || 0,
        taxs: row.taxs || 0,
        discount: row.discount || 0,
        total: row.total || 0,
        count: row.count || 1,
        category: row.category || "",
      };
      products.push(newProduct);
    });

    saveProducts();
    filteredProducts = [...products];
    renderProductsPage(currentPage);
    toggleDeleteAllBtn();
  };
  reader.readAsArrayBuffer(file);
});
